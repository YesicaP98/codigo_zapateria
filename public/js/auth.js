// Sistema de Autenticación - Zapatería App
class AuthService {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.apiBase = '/api/auth';
        this.init();
    }

    init() {
        console.log('AuthService inicializado');
        this.updateUI();
        this.setupInterceptors();
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return !!this.token && this.isTokenValid();
    }

    // Validar token (simulación)
    isTokenValid() {
        if (!this.token) return false;
        
        // En una app real, verificarías la expiración del token
        // Por ahora, simulación básica
        const tokenData = this.parseJwt(this.token);
        if (tokenData && tokenData.exp) {
            return tokenData.exp * 1000 > Date.now();
        }
        return true; // Para demo
    }

    // Parsear JWT (simulación)
    parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    // Iniciar sesión
    async login(email, password) {
        try {
            console.log('Intentando login:', email);
            
            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success && data.token) {
                this.token = data.token;
                this.user = data.user;
                
                // Guardar en localStorage
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                console.log('Login exitoso:', this.user);
                this.updateUI();
                
                return { 
                    success: true, 
                    user: this.user,
                    message: '¡Bienvenido!'
                };
            } else {
                console.error('Error en login:', data.message);
                return { 
                    success: false, 
                    error: data.message || 'Error en el servidor'
                };
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            
            // Modo demo - permitir login sin backend
            if (email === 'demo@zapateria.com' && password === 'demo123') {
                return this.demoLogin(email);
            }
            
            return { 
                success: false, 
                error: 'Error de conexión. Usa las credenciales demo: demo@zapateria.com / demo123'
            };
        }
    }

    // Registro de usuario
    async register(name, email, password) {
        try {
            console.log('Intentando registro:', email);
            
            const response = await fetch(`${this.apiBase}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success && data.token) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                console.log('Registro exitoso:', this.user);
                this.updateUI();
                
                return { 
                    success: true, 
                    user: this.user,
                    message: '¡Cuenta creada exitosamente!'
                };
            } else {
                return { 
                    success: false, 
                    error: data.message || 'Error en el servidor'
                };
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            
            // Modo demo - permitir registro sin backend
            return this.demoRegister(name, email);
        }
    }

    // Cerrar sesión
    logout() {
        console.log('Cerrando sesión');
        
        this.token = null;
        this.user = null;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('cart'); // Limpiar carrito también
        
        this.updateUI();
        
        // Redirigir a home
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
        
        return { success: true, message: 'Sesión cerrada' };
    }

    // Login de demo (cuando no hay backend)
    async demoLogin(email) {
        const demoUser = { 
            id: 1, 
            name: 'Usuario Demo', 
            email: email,
            role: 'customer'
        };
        
        this.token = 'demo-jwt-token-' + Date.now();
        this.user = demoUser;
        
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        console.log('Demo login exitoso:', demoUser);
        this.updateUI();
        
        return { 
            success: true, 
            user: demoUser,
            message: '¡Modo demo activado! Bienvenido'
        };
    }

    // Registro de demo
    async demoRegister(name, email) {
        const demoUser = { 
            id: Math.floor(Math.random() * 1000) + 2, 
            name: name, 
            email: email,
            role: 'customer'
        };
        
        this.token = 'demo-jwt-token-' + Date.now();
        this.user = demoUser;
        
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        console.log('Demo registro exitoso:', demoUser);
        this.updateUI();
        
        return { 
            success: true, 
            user: demoUser,
            message: '¡Cuenta demo creada exitosamente!'
        };
    }

    // Actualizar interfaz según estado de autenticación
    updateUI() {
        const isAuth = this.isAuthenticated();
        console.log('Actualizando UI - Autenticado:', isAuth);
        
        // Elementos para usuarios autenticados
        const authElements = document.querySelectorAll('.auth-element');
        authElements.forEach(element => {
            if (isAuth) {
                element.classList.remove('d-none');
            } else {
                element.classList.add('d-none');
            }
        });
        
        // Elementos para usuarios NO autenticados
        const unauthElements = document.querySelectorAll('.unauth-element');
        unauthElements.forEach(element => {
            if (!isAuth) {
                element.classList.remove('d-none');
            } else {
                element.classList.add('d-none');
            }
        });
        
        // Actualizar nombre de usuario
        const userElements = document.querySelectorAll('.user-name, .user-email');
        userElements.forEach(element => {
            if (this.user) {
                if (element.classList.contains('user-name')) {
                    element.textContent = this.user.name;
                } else if (element.classList.contains('user-email')) {
                    element.textContent = this.user.email;
                }
            }
        });
        
        // Actualizar navegación
        this.updateNavigation();
    }

    // Actualizar barra de navegación
    updateNavigation() {
        const isAuth = this.isAuthenticated();
        const navAuth = document.getElementById('navAuth');
        const navUnauth = document.getElementById('navUnauth');
        
        if (navAuth) navAuth.style.display = isAuth ? 'block' : 'none';
        if (navUnauth) navUnauth.style.display = isAuth ? 'none' : 'block';
    }

    // Obtener headers de autenticación para API calls
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    // Configurar interceptors para fetch
    setupInterceptors() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            let [resource, config] = args;
            
            // Agregar token a las requests que requieren autenticación
            if (this.isAuthenticated() && config && !config._noAuth) {
                config.headers = {
                    ...config.headers,
                    ...this.getAuthHeaders()
                };
            }
            
            const response = await originalFetch(resource, config);
            
            // Verificar si el token expiró
            if (response.status === 401) {
                console.log('Token expirado, cerrando sesión');
                this.logout();
            }
            
            return response;
        };
    }

    // Verificar estado de autenticación
    checkAuth() {
        return this.isAuthenticated();
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.user;
    }

    // Obtener token
    getToken() {
        return this.token;
    }

    // Verificar si es admin (para futuras funcionalidades)
    isAdmin() {
        return this.user && this.user.role === 'admin';
    }

    // Actualizar perfil de usuario
    async updateProfile(profileData) {
        if (!this.isAuthenticated()) {
            return { success: false, error: 'No autenticado' };
        }
        
        try {
            const response = await fetch(`${this.apiBase}/profile`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(profileData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.user = { ...this.user, ...profileData };
                localStorage.setItem('user', JSON.stringify(this.user));
                this.updateUI();
            }
            
            return data;
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            return { success: false, error: 'Error de conexión' };
        }
    }
}

// Instancia global de AuthService
const authService = new AuthService();

// Para uso en la consola del navegador
window.authService = authService;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada - Verificando autenticación');
    authService.updateUI();
    
    // Agregar botón de logout si existe
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                authService.logout();
            }
        });
    }
});

// Exportar para módulos (si se usa ES6)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}