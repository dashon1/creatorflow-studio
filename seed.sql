-- Insert admin user (password: admin123)
INSERT OR IGNORE INTO users (email, name, password_hash, role, status) VALUES 
  ('admin@creatorflow.studio', 'Admin User', '$2a$10$rBV2JDeWW3.vKyeQcM8fFO4777l4bVD.rnEn3PsLx2Q9YNa3eQJDa', 'super_admin', 'active'),
  ('john@example.com', 'John Doe', '$2a$10$rBV2JDeWW3.vKyeQcM8fFO4777l4bVD.rnEn3PsLx2Q9YNa3eQJDa', 'user', 'active'),
  ('jane@example.com', 'Jane Smith', '$2a$10$rBV2JDeWW3.vKyeQcM8fFO4777l4bVD.rnEn3PsLx2Q9YNa3eQJDa', 'user', 'active');

-- Insert sample integrations
INSERT OR IGNORE INTO integrations (user_id, provider, name, config, status) VALUES 
  (1, 'openai', 'OpenAI GPT-4', '{"model": "gpt-4", "maxTokens": 4000}', 'active'),
  (1, 'dall-e', 'DALL-E 3', '{"size": "1024x1024", "quality": "hd"}', 'active'),
  (1, 'whatsapp', 'WhatsApp Business', '{"phoneNumber": "+1234567890"}', 'active'),
  (2, 'openai', 'OpenAI GPT-3.5', '{"model": "gpt-3.5-turbo", "maxTokens": 2000}', 'active');

-- Insert sample workflows
INSERT OR IGNORE INTO workflows (user_id, name, description, type, config, status) VALUES 
  (1, 'AI Content Generator', 'Generate blog posts and social media content', 'content_generation', '{"template": "blog_post", "tone": "professional"}', 'active'),
  (1, 'Video Creator', 'Create product videos automatically', 'video_generation', '{"duration": 30, "style": "modern"}', 'active'),
  (2, 'Image Generator', 'Generate product images', 'image_generation', '{"style": "photorealistic", "batch": 5}', 'active'),
  (2, 'Chatbot Assistant', 'Customer support chatbot', 'chatbot', '{"language": "en", "personality": "helpful"}', 'active');

-- Insert sample subscriptions
INSERT OR IGNORE INTO subscriptions (user_id, plan, status) VALUES 
  (1, 'enterprise', 'active'),
  (2, 'pro', 'active'),
  (3, 'starter', 'trial');

-- Insert sample workflow runs
INSERT OR IGNORE INTO workflow_runs (workflow_id, user_id, status, input, output, duration_ms) VALUES 
  (1, 1, 'success', '{"topic": "AI in 2024"}', '{"content": "Generated blog post..."}', 5200),
  (2, 1, 'success', '{"product": "Smart Watch"}', '{"videoUrl": "https://example.com/video.mp4"}', 15000),
  (3, 2, 'running', '{"product": "Laptop"}', NULL, NULL),
  (4, 2, 'success', '{"query": "Order status"}', '{"response": "Your order is being processed"}', 800);