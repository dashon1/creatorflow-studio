import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { SignJWT, jwtVerify } from 'jose'
import { z } from 'zod'
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types'

// Types
type Bindings = {
  DB: D1Database
  KV: KVNamespace
  R2: R2Bucket
  JWT_SECRET: string
  ADMIN_EMAIL: string
}

type Variables = {
  user?: any
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return c.json({ error: 'No token provided' }, 401)
  }

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    
    // Get user from database
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, role FROM users WHERE id = ?'
    ).bind(payload.userId).first()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 401)
    }
    
    c.set('user', user)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

// Admin middleware
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get('user')
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  await next()
}

// Helper function to hash password (simple example - use bcrypt in production)
const hashPassword = async (password: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
}

// Helper function to create JWT token
const createToken = async (userId: number, secret: string) => {
  const secretKey = new TextEncoder().encode(secret)
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey)
  return token
}

// ===== Authentication Routes =====

// Register
app.post('/api/auth/register', async (c) => {
  const { env } = c
  
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2)
  })
  
  try {
    const body = await c.req.json()
    const data = schema.parse(body)
    
    // Check if user exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(data.email).first()
    
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 400)
    }
    
    // Hash password
    const passwordHash = await hashPassword(data.password)
    
    // Create user
    const result = await env.DB.prepare(`
      INSERT INTO users (email, name, password_hash, role)
      VALUES (?, ?, ?, 'user')
    `).bind(data.email, data.name, passwordHash).run()
    
    const userId = result.meta.last_row_id as number
    
    // Create token
    const token = await createToken(userId, env.JWT_SECRET)
    
    return c.json({
      token,
      user: {
        id: userId,
        email: data.email,
        name: data.name,
        role: 'user'
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// Login
app.post('/api/auth/login', async (c) => {
  const { env } = c
  
  const schema = z.object({
    email: z.string().email(),
    password: z.string()
  })
  
  try {
    const body = await c.req.json()
    const data = schema.parse(body)
    
    // Get user
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(data.email).first()
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Verify password
    const passwordHash = await hashPassword(data.password)
    if (passwordHash !== user.password_hash) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Create token
    const token = await createToken(user.id, env.JWT_SECRET)
    
    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Login failed' }, 500)
  }
})

// Get current user
app.get('/api/auth/me', authMiddleware, async (c) => {
  const user = c.get('user')
  return c.json({ user })
})

// ===== User Management Routes (Admin) =====

// Get all users (admin only)
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (c) => {
  const { env } = c
  
  const users = await env.DB.prepare(`
    SELECT id, email, name, role, status, created_at
    FROM users
    ORDER BY created_at DESC
  `).all()
  
  return c.json({ users: users.results })
})

// Update user (admin only)
app.put('/api/admin/users/:id', authMiddleware, adminMiddleware, async (c) => {
  const { env } = c
  const userId = c.req.param('id')
  
  const schema = z.object({
    role: z.enum(['user', 'admin', 'super_admin']).optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional()
  })
  
  try {
    const body = await c.req.json()
    const data = schema.parse(body)
    
    const updates = []
    const values = []
    
    if (data.role !== undefined) {
      updates.push('role = ?')
      values.push(data.role)
    }
    
    if (data.status !== undefined) {
      updates.push('status = ?')
      values.push(data.status)
    }
    
    if (updates.length === 0) {
      return c.json({ error: 'No updates provided' }, 400)
    }
    
    values.push(userId)
    
    await env.DB.prepare(`
      UPDATE users
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(...values).run()
    
    return c.json({ message: 'User updated successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Update failed' }, 500)
  }
})

// ===== Integration Routes =====

// Get integrations
app.get('/api/integrations', authMiddleware, async (c) => {
  const { env } = c
  const user = c.get('user')
  
  const integrations = await env.DB.prepare(`
    SELECT id, provider, name, status, last_sync_at, created_at
    FROM integrations
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).bind(user.id).all()
  
  return c.json({ integrations: integrations.results })
})

// Create integration
app.post('/api/integrations', authMiddleware, async (c) => {
  const { env } = c
  const user = c.get('user')
  
  const schema = z.object({
    provider: z.string(),
    name: z.string(),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    config: z.record(z.any()).optional()
  })
  
  try {
    const body = await c.req.json()
    const data = schema.parse(body)
    
    const result = await env.DB.prepare(`
      INSERT INTO integrations (user_id, provider, name, api_key, api_secret, config)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      data.provider,
      data.name,
      data.apiKey || null,
      data.apiSecret || null,
      JSON.stringify(data.config || {})
    ).run()
    
    return c.json({
      id: result.meta.last_row_id,
      message: 'Integration created successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Failed to create integration' }, 500)
  }
})

// Delete integration
app.delete('/api/integrations/:id', authMiddleware, async (c) => {
  const { env } = c
  const user = c.get('user')
  const integrationId = c.req.param('id')
  
  await env.DB.prepare(`
    DELETE FROM integrations
    WHERE id = ? AND user_id = ?
  `).bind(integrationId, user.id).run()
  
  return c.json({ message: 'Integration deleted successfully' })
})

// ===== Workflow Routes =====

// Get workflows
app.get('/api/workflows', authMiddleware, async (c) => {
  const { env } = c
  const user = c.get('user')
  
  const workflows = await env.DB.prepare(`
    SELECT id, name, description, type, status, runs_count, last_run_at, created_at
    FROM workflows
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).bind(user.id).all()
  
  return c.json({ workflows: workflows.results })
})

// Create workflow
app.post('/api/workflows', authMiddleware, async (c) => {
  const { env } = c
  const user = c.get('user')
  
  const schema = z.object({
    name: z.string(),
    description: z.string().optional(),
    type: z.string(),
    config: z.record(z.any()).optional()
  })
  
  try {
    const body = await c.req.json()
    const data = schema.parse(body)
    
    const result = await env.DB.prepare(`
      INSERT INTO workflows (user_id, name, description, type, config)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user.id,
      data.name,
      data.description || null,
      data.type,
      JSON.stringify(data.config || {})
    ).run()
    
    return c.json({
      id: result.meta.last_row_id,
      message: 'Workflow created successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Failed to create workflow' }, 500)
  }
})

// Run workflow
app.post('/api/workflows/:id/run', authMiddleware, async (c) => {
  const { env } = c
  const user = c.get('user')
  const workflowId = c.req.param('id')
  
  try {
    const body = await c.req.json()
    
    // Create workflow run
    const result = await env.DB.prepare(`
      INSERT INTO workflow_runs (workflow_id, user_id, status, input, started_at)
      VALUES (?, ?, 'running', ?, CURRENT_TIMESTAMP)
    `).bind(workflowId, user.id, JSON.stringify(body)).run()
    
    const runId = result.meta.last_row_id
    
    // Update workflow stats
    await env.DB.prepare(`
      UPDATE workflows
      SET runs_count = runs_count + 1, last_run_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(workflowId).run()
    
    // Simulate workflow execution (in production, this would be async)
    setTimeout(async () => {
      await env.DB.prepare(`
        UPDATE workflow_runs
        SET status = 'success',
            output = '{"result": "Workflow completed"}',
            completed_at = CURRENT_TIMESTAMP,
            duration_ms = 1000
        WHERE id = ?
      `).bind(runId).run()
    }, 1000)
    
    return c.json({
      runId,
      message: 'Workflow started'
    })
  } catch (error) {
    return c.json({ error: 'Failed to run workflow' }, 500)
  }
})

// ===== Analytics Routes =====

// Get dashboard stats
app.get('/api/analytics/dashboard', authMiddleware, async (c) => {
  const { env } = c
  const user = c.get('user')
  
  // Get user stats
  const isAdmin = user.role === 'admin' || user.role === 'super_admin'
  
  let stats
  if (isAdmin) {
    stats = await env.DB.prepare(`
      SELECT
        (SELECT COUNT(*) FROM workflows) as total_workflows,
        (SELECT COUNT(*) FROM workflow_runs) as total_runs,
        (SELECT COUNT(*) FROM integrations) as total_integrations,
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users
    `).first()
  } else {
    stats = await env.DB.prepare(`
      SELECT
        (SELECT COUNT(*) FROM workflows WHERE user_id = ?) as total_workflows,
        (SELECT COUNT(*) FROM workflow_runs WHERE user_id = ?) as total_runs,
        (SELECT COUNT(*) FROM integrations WHERE user_id = ?) as total_integrations,
        0 as total_users
    `).bind(user.id, user.id, user.id).first()
  }
  
  // Get recent activity
  let recentRuns
  if (isAdmin) {
    recentRuns = await env.DB.prepare(`
      SELECT wr.*, w.name as workflow_name
      FROM workflow_runs wr
      JOIN workflows w ON wr.workflow_id = w.id
      ORDER BY wr.created_at DESC
      LIMIT 10
    `).all()
  } else {
    recentRuns = await env.DB.prepare(`
      SELECT wr.*, w.name as workflow_name
      FROM workflow_runs wr
      JOIN workflows w ON wr.workflow_id = w.id
      WHERE wr.user_id = ?
      ORDER BY wr.created_at DESC
      LIMIT 10
    `).bind(user.id).all()
  }
  
  return c.json({
    stats,
    recentRuns: recentRuns.results
  })
})

// Track analytics event
app.post('/api/analytics/track', authMiddleware, async (c) => {
  const { env } = c
  const user = c.get('user')
  
  const schema = z.object({
    eventType: z.string(),
    eventData: z.record(z.any()).optional()
  })
  
  try {
    const body = await c.req.json()
    const data = schema.parse(body)
    
    await env.DB.prepare(`
      INSERT INTO analytics (user_id, event_type, event_data, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user.id,
      data.eventType,
      JSON.stringify(data.eventData || {}),
      c.req.header('CF-Connecting-IP') || null,
      c.req.header('User-Agent') || null
    ).run()
    
    return c.json({ message: 'Event tracked' })
  } catch (error) {
    return c.json({ error: 'Failed to track event' }, 500)
  }
})

// ===== Main Application Route =====

// Serve the main application
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CreatorFlow Studio - Transform Workflows into Apps</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div id="app"></div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app