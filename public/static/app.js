// CreatorFlow Studio - Frontend Application
(function() {
    // ===== State Management =====
    const state = {
        user: null,
        token: localStorage.getItem('token'),
        theme: localStorage.getItem('theme') || 'light',
        currentView: 'home',
        integrations: [],
        workflows: [],
        analytics: null
    };

    // ===== Theme Management =====
    const initTheme = () => {
        if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleTheme = () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', state.theme);
        initTheme();
    };

    // ===== API Client =====
    const api = {
        baseURL: '/api',
        
        async request(method, url, data = null) {
            const config = {
                method,
                url: `${this.baseURL}${url}`,
                headers: {}
            };
            
            if (state.token) {
                config.headers.Authorization = `Bearer ${state.token}`;
            }
            
            if (data) {
                config.data = data;
                config.headers['Content-Type'] = 'application/json';
            }
            
            try {
                const response = await axios(config);
                return response.data;
            } catch (error) {
                if (error.response?.status === 401) {
                    logout();
                }
                throw error;
            }
        },
        
        get(url) { return this.request('GET', url); },
        post(url, data) { return this.request('POST', url, data); },
        put(url, data) { return this.request('PUT', url, data); },
        delete(url) { return this.request('DELETE', url); }
    };

    // ===== Authentication =====
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            state.token = response.token;
            state.user = response.user;
            localStorage.setItem('token', response.token);
            await loadUserData();
            render();
        } catch (error) {
            alert('Login failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    const register = async (email, password, name) => {
        try {
            const response = await api.post('/auth/register', { email, password, name });
            state.token = response.token;
            state.user = response.user;
            localStorage.setItem('token', response.token);
            await loadUserData();
            render();
        } catch (error) {
            alert('Registration failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    const logout = () => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        state.currentView = 'home';
        render();
    };

    const loadUserData = async () => {
        if (!state.token) return;
        
        try {
            const response = await api.get('/auth/me');
            state.user = response.user;
            
            // Load additional data
            const [integrations, workflows, analytics] = await Promise.all([
                api.get('/integrations'),
                api.get('/workflows'),
                api.get('/analytics/dashboard')
            ]);
            
            state.integrations = integrations.integrations;
            state.workflows = workflows.workflows;
            state.analytics = analytics;
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };

    // ===== UI Components =====
    const components = {
        navbar: () => `
            <nav class="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <h1 class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer" onclick="navigate('home')">
                                <i class="fas fa-robot mr-2"></i>CreatorFlow Studio
                            </h1>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            ${state.user ? `
                                <button onclick="navigate('dashboard')" class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                    <i class="fas fa-chart-line mr-1"></i>Dashboard
                                </button>
                                <button onclick="navigate('integrations')" class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                    <i class="fas fa-plug mr-1"></i>Integrations
                                </button>
                                <button onclick="navigate('workflows')" class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                    <i class="fas fa-project-diagram mr-1"></i>Workflows
                                </button>
                                ${state.user.role === 'admin' || state.user.role === 'super_admin' ? `
                                    <button onclick="navigate('admin')" class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        <i class="fas fa-cog mr-1"></i>Admin
                                    </button>
                                ` : ''}
                                <div class="relative group">
                                    <button class="flex items-center text-gray-700 dark:text-gray-300">
                                        <i class="fas fa-user-circle text-2xl"></i>
                                    </button>
                                    <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg hidden group-hover:block">
                                        <div class="p-2">
                                            <p class="text-sm font-medium text-gray-900 dark:text-white">${state.user.name}</p>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">${state.user.email}</p>
                                        </div>
                                        <hr class="dark:border-gray-700">
                                        <button onclick="logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                                        </button>
                                    </div>
                                </div>
                            ` : `
                                <button onclick="navigate('login')" class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                    Login
                                </button>
                                <button onclick="navigate('register')" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                    Get Started
                                </button>
                            `}
                            
                            <button onclick="toggleTheme()" class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                <i class="fas ${state.theme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        `,
        
        home: () => `
            <div class="py-12">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-12">
                        <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Transform Your Workflows into Production Apps
                        </h2>
                        <p class="text-xl text-gray-600 dark:text-gray-400">
                            AI-powered automation platform for creators and businesses
                        </p>
                    </div>
                    
                    <div class="grid md:grid-cols-3 gap-6 mb-12">
                        ${[
                            { icon: 'fa-video', title: 'AI Video Generation', desc: 'Create stunning videos with Sora 2, Runway, and more' },
                            { icon: 'fa-image', title: 'Image Creation', desc: 'Generate images with DALL-E, Midjourney, Stable Diffusion' },
                            { icon: 'fa-comments', title: 'AI Chatbots', desc: 'Build WhatsApp, Web, and SMS chatbots' },
                            { icon: 'fa-microphone', title: 'Voice Assistants', desc: 'Create voice-powered customer support' },
                            { icon: 'fa-podcast', title: 'Podcast Generator', desc: 'Transform content into podcast episodes' },
                            { icon: 'fa-globe', title: 'Web Automation', desc: 'Automate any web-based workflow' }
                        ].map(feature => `
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <div class="text-indigo-600 dark:text-indigo-400 text-3xl mb-4">
                                    <i class="fas ${feature.icon}"></i>
                                </div>
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${feature.title}</h3>
                                <p class="text-gray-600 dark:text-gray-400">${feature.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="bg-indigo-600 dark:bg-indigo-700 rounded-lg p-8 text-center">
                        <h3 class="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
                        <p class="text-indigo-100 mb-6">Join thousands of creators automating their workflows</p>
                        ${!state.user ? `
                            <button onclick="navigate('register')" class="bg-white text-indigo-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                                Start Free Trial
                            </button>
                        ` : `
                            <button onclick="navigate('dashboard')" class="bg-white text-indigo-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                                Go to Dashboard
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `,
        
        login: () => `
            <div class="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                        Welcome Back
                    </h2>
                    <form onsubmit="event.preventDefault(); login(document.getElementById('email').value, document.getElementById('password').value)">
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                            <input type="email" id="email" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                        </div>
                        <div class="mb-6">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
                            <input type="password" id="password" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                        </div>
                        <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors">
                            Login
                        </button>
                    </form>
                    <p class="mt-4 text-center text-gray-600 dark:text-gray-400">
                        Don't have an account? <a href="#" onclick="navigate('register')" class="text-indigo-600 dark:text-indigo-400">Register</a>
                    </p>
                </div>
            </div>
        `,
        
        register: () => `
            <div class="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                        Create Your Account
                    </h2>
                    <form onsubmit="event.preventDefault(); register(document.getElementById('reg-email').value, document.getElementById('reg-password').value, document.getElementById('reg-name').value)">
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
                            <input type="text" id="reg-name" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                            <input type="email" id="reg-email" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                        </div>
                        <div class="mb-6">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
                            <input type="password" id="reg-password" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" minlength="6" required>
                        </div>
                        <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors">
                            Create Account
                        </button>
                    </form>
                    <p class="mt-4 text-center text-gray-600 dark:text-gray-400">
                        Already have an account? <a href="#" onclick="navigate('login')" class="text-indigo-600 dark:text-indigo-400">Login</a>
                    </p>
                </div>
            </div>
        `,
        
        dashboard: () => `
            <div class="py-8">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h2>
                    
                    ${state.analytics ? `
                        <div class="grid md:grid-cols-4 gap-6 mb-8">
                            ${[
                                { label: 'Total Workflows', value: state.analytics.stats?.total_workflows || 0, icon: 'fa-project-diagram', color: 'indigo' },
                                { label: 'Total Runs', value: state.analytics.stats?.total_runs || 0, icon: 'fa-play', color: 'green' },
                                { label: 'Integrations', value: state.analytics.stats?.total_integrations || 0, icon: 'fa-plug', color: 'yellow' },
                                { label: 'Total Users', value: state.analytics.stats?.total_users || 0, icon: 'fa-users', color: 'purple' }
                            ].map(stat => `
                                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="text-${stat.color}-600 dark:text-${stat.color}-400">
                                            <i class="fas ${stat.icon} text-2xl"></i>
                                        </div>
                                        <span class="text-3xl font-bold text-gray-900 dark:text-white">${stat.value}</span>
                                    </div>
                                    <p class="text-gray-600 dark:text-gray-400">${stat.label}</p>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                            <div class="space-y-4">
                                ${state.analytics.recentRuns && state.analytics.recentRuns.length > 0 ? 
                                    state.analytics.recentRuns.map(run => `
                                        <div class="flex items-center justify-between py-2 border-b dark:border-gray-700">
                                            <div>
                                                <p class="font-medium text-gray-900 dark:text-white">${run.workflow_name}</p>
                                                <p class="text-sm text-gray-600 dark:text-gray-400">${new Date(run.created_at).toLocaleString()}</p>
                                            </div>
                                            <span class="px-2 py-1 text-xs rounded-full ${
                                                run.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                                run.status === 'running' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                                'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                            }">
                                                ${run.status}
                                            </span>
                                        </div>
                                    `).join('')
                                    : '<p class="text-gray-500 dark:text-gray-400">No recent activity</p>'
                                }
                            </div>
                        </div>
                    ` : '<p class="text-gray-600 dark:text-gray-400">Loading analytics...</p>'}
                </div>
            </div>
        `,
        
        integrations: () => `
            <div class="py-8">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Integrations</h2>
                        <button onclick="showAddIntegration()" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                            <i class="fas fa-plus mr-2"></i>Add Integration
                        </button>
                    </div>
                    
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${state.integrations.map(integration => `
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${integration.name}</h3>
                                    <span class="px-2 py-1 text-xs rounded-full ${
                                        integration.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                        'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                    }">
                                        ${integration.status}
                                    </span>
                                </div>
                                <p class="text-gray-600 dark:text-gray-400 mb-4">Provider: ${integration.provider}</p>
                                <div class="flex space-x-2">
                                    <button class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button onclick="deleteIntegration(${integration.id})" class="text-red-600 dark:text-red-400 hover:text-red-800">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `,
        
        workflows: () => `
            <div class="py-8">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center mb-8">
                        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Workflows</h2>
                        <button onclick="showAddWorkflow()" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                            <i class="fas fa-plus mr-2"></i>Create Workflow
                        </button>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-6">
                        ${state.workflows.map(workflow => `
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${workflow.name}</h3>
                                    <span class="px-2 py-1 text-xs rounded-full ${
                                        workflow.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                        workflow.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                                    }">
                                        ${workflow.status}
                                    </span>
                                </div>
                                <p class="text-gray-600 dark:text-gray-400 mb-2">${workflow.description || 'No description'}</p>
                                <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">
                                    Type: ${workflow.type} | Runs: ${workflow.runs_count}
                                </p>
                                <div class="flex space-x-2">
                                    <button onclick="runWorkflow(${workflow.id})" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                                        <i class="fas fa-play"></i> Run
                                    </button>
                                    <button class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="text-red-600 dark:text-red-400 hover:text-red-800">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `,
        
        admin: () => `
            <div class="py-8">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Panel</h2>
                    
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div class="p-6">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Management</h3>
                            <div id="admin-users">Loading users...</div>
                        </div>
                    </div>
                </div>
            </div>
        `
    };

    // ===== Integration Functions =====
    const showAddIntegration = () => {
        const modal = `
            <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Integration</h3>
                    <form onsubmit="event.preventDefault(); addIntegration()">
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Provider</label>
                            <select id="int-provider" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="openai">OpenAI</option>
                                <option value="dall-e">DALL-E</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="sora">Sora 2</option>
                                <option value="midjourney">Midjourney</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
                            <input type="text" id="int-name" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">API Key</label>
                            <input type="text" id="int-key" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        </div>
                        <div class="flex space-x-2">
                            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add</button>
                            <button type="button" onclick="closeModal()" class="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white px-4 py-2 rounded-md">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modal);
    };

    const addIntegration = async () => {
        const provider = document.getElementById('int-provider').value;
        const name = document.getElementById('int-name').value;
        const apiKey = document.getElementById('int-key').value;
        
        try {
            await api.post('/integrations', { provider, name, apiKey });
            await loadUserData();
            closeModal();
            render();
        } catch (error) {
            alert('Failed to add integration');
        }
    };

    const deleteIntegration = async (id) => {
        if (confirm('Are you sure you want to delete this integration?')) {
            try {
                await api.delete(`/integrations/${id}`);
                await loadUserData();
                render();
            } catch (error) {
                alert('Failed to delete integration');
            }
        }
    };

    // ===== Workflow Functions =====
    const showAddWorkflow = () => {
        const modal = `
            <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create Workflow</h3>
                    <form onsubmit="event.preventDefault(); addWorkflow()">
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
                            <input type="text" id="wf-name" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Type</label>
                            <select id="wf-type" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="content_generation">Content Generation</option>
                                <option value="video_generation">Video Generation</option>
                                <option value="image_generation">Image Generation</option>
                                <option value="chatbot">Chatbot</option>
                                <option value="automation">Web Automation</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <textarea id="wf-desc" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="3"></textarea>
                        </div>
                        <div class="flex space-x-2">
                            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Create</button>
                            <button type="button" onclick="closeModal()" class="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white px-4 py-2 rounded-md">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modal);
    };

    const addWorkflow = async () => {
        const name = document.getElementById('wf-name').value;
        const type = document.getElementById('wf-type').value;
        const description = document.getElementById('wf-desc').value;
        
        try {
            await api.post('/workflows', { name, type, description });
            await loadUserData();
            closeModal();
            render();
        } catch (error) {
            alert('Failed to create workflow');
        }
    };

    const runWorkflow = async (id) => {
        try {
            const response = await api.post(`/workflows/${id}/run`, { input: 'test' });
            alert(`Workflow started! Run ID: ${response.runId}`);
            await loadUserData();
            render();
        } catch (error) {
            alert('Failed to run workflow');
        }
    };

    // ===== Admin Functions =====
    const loadAdminUsers = async () => {
        if (state.user?.role !== 'admin' && state.user?.role !== 'super_admin') return;
        
        try {
            const response = await api.get('/admin/users');
            const usersDiv = document.getElementById('admin-users');
            if (usersDiv) {
                usersDiv.innerHTML = `
                    <table class="w-full">
                        <thead>
                            <tr class="border-b dark:border-gray-700">
                                <th class="text-left py-2 text-gray-900 dark:text-white">Name</th>
                                <th class="text-left py-2 text-gray-900 dark:text-white">Email</th>
                                <th class="text-left py-2 text-gray-900 dark:text-white">Role</th>
                                <th class="text-left py-2 text-gray-900 dark:text-white">Status</th>
                                <th class="text-left py-2 text-gray-900 dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${response.users.map(user => `
                                <tr class="border-b dark:border-gray-700">
                                    <td class="py-2 text-gray-900 dark:text-gray-300">${user.name}</td>
                                    <td class="py-2 text-gray-900 dark:text-gray-300">${user.email}</td>
                                    <td class="py-2">
                                        <select onchange="updateUserRole(${user.id}, this.value)" class="text-sm px-2 py-1 rounded dark:bg-gray-700 dark:text-white">
                                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                            <option value="super_admin" ${user.role === 'super_admin' ? 'selected' : ''}>Super Admin</option>
                                        </select>
                                    </td>
                                    <td class="py-2">
                                        <select onchange="updateUserStatus(${user.id}, this.value)" class="text-sm px-2 py-1 rounded dark:bg-gray-700 dark:text-white">
                                            <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                                            <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                            <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                                        </select>
                                    </td>
                                    <td class="py-2">
                                        <button onclick="deleteUser(${user.id})" class="text-red-600 dark:text-red-400 hover:text-red-800">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const updateUserRole = async (userId, role) => {
        try {
            await api.put(`/admin/users/${userId}`, { role });
            alert('User role updated successfully');
        } catch (error) {
            alert('Failed to update user role');
        }
    };

    const updateUserStatus = async (userId, status) => {
        try {
            await api.put(`/admin/users/${userId}`, { status });
            alert('User status updated successfully');
        } catch (error) {
            alert('Failed to update user status');
        }
    };

    // ===== Helper Functions =====
    const closeModal = () => {
        const modal = document.getElementById('modal');
        if (modal) modal.remove();
    };

    const navigate = (view) => {
        state.currentView = view;
        render();
    };

    // ===== Main Render Function =====
    const render = () => {
        const app = document.getElementById('app');
        
        let content = components.navbar();
        
        switch (state.currentView) {
            case 'login':
                content += components.login();
                break;
            case 'register':
                content += components.register();
                break;
            case 'dashboard':
                if (!state.user) {
                    navigate('login');
                    return;
                }
                content += components.dashboard();
                break;
            case 'integrations':
                if (!state.user) {
                    navigate('login');
                    return;
                }
                content += components.integrations();
                break;
            case 'workflows':
                if (!state.user) {
                    navigate('login');
                    return;
                }
                content += components.workflows();
                break;
            case 'admin':
                if (!state.user || (state.user.role !== 'admin' && state.user.role !== 'super_admin')) {
                    navigate('home');
                    return;
                }
                content += components.admin();
                setTimeout(loadAdminUsers, 100);
                break;
            default:
                content += components.home();
        }
        
        app.innerHTML = content;
    };

    // ===== Initialize App =====
    const init = async () => {
        initTheme();
        if (state.token) {
            await loadUserData();
        }
        render();
    };

    // Expose functions globally
    window.navigate = navigate;
    window.login = login;
    window.register = register;
    window.logout = logout;
    window.toggleTheme = toggleTheme;
    window.showAddIntegration = showAddIntegration;
    window.addIntegration = addIntegration;
    window.deleteIntegration = deleteIntegration;
    window.showAddWorkflow = showAddWorkflow;
    window.addWorkflow = addWorkflow;
    window.runWorkflow = runWorkflow;
    window.updateUserRole = updateUserRole;
    window.updateUserStatus = updateUserStatus;
    window.closeModal = closeModal;

    // Start the app
    init();
})();