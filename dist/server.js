import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import { optionalAuth } from './middleware/auth.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
// Middleware de autenticación opcional para todas las rutas
app.use(optionalAuth);
// Rutas de API
app.use('/api/auth', authRoutes);
// Ruta para verificar el estado del servidor
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor de Zapatería App funcionando',
        timestamp: new Date().toISOString()
    });
});
// Ruta protegida de ejemplo
app.get('/api/protected', (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Acceso no autorizado'
        });
    }
    res.json({
        success: true,
        message: 'Acceso a ruta protegida exitoso',
        user: req.user
    });
});
// Datos de productos de ejemplo
const products = [
    {
        id: 1,
        name: "Runner Azul",
        description: "Zapatilla ligera para correr, malla transpirable.",
        price: 199999,
        image: "/img/runner-azul.jpg",
        category: "deportivas"
    },
    {
        id: 2,
        name: "Classic Rojo",
        description: "Clásico urbano para uso diario.",
        price: 149999,
        image: "/img/classic-rojo.jpg",
        category: "urbanas"
    },
    {
        id: 3,
        name: "Eco Verde",
        description: "Materiales reciclados, cómodo y resistente.",
        price: 179999,
        image: "/img/eco-verde.jpg",
        category: "sostenibles"
    }
];
// API para obtener productos
app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        products: products
    });
});
// API para obtener un producto específico
app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }
    res.json({
        success: true,
        product: product
    });
});
// API para el carrito (protegida)
app.get('/api/cart', (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Debes iniciar sesión para ver el carrito'
        });
    }
    // Simular carrito de compras
    const cart = {
        items: [],
        total: 0,
        user: req.user
    };
    res.json({
        success: true,
        cart: cart
    });
});
// API para agregar al carrito (protegida)
app.post('/api/cart/add', (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Debes iniciar sesión para agregar productos al carrito'
        });
    }
    const { productId, quantity = 1 } = req.body;
    const product = products.find(p => p.id === productId);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }
    res.json({
        success: true,
        message: 'Producto agregado al carrito',
        product: product,
        quantity: quantity,
        user: req.user
    });
});
// Manejo de rutas del frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/cart.html'));
});
// Ruta para perfil de usuario (protegida)
app.get('/profile', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    // En una implementación real, servirías profile.html
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
// Manejo de errores 404 para API
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint de API no encontrado'
    });
});
// Manejo de errores 404 para páginas
app.use('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});
// Manejo global de errores
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    if (req.path.startsWith('/api/')) {
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
    else {
        res.status(500).send('Error interno del servidor');
    }
});
// Inicializar servidor
app.listen(PORT, () => {
    console.log(`🛍️  Zapatería App ejecutándose en http://localhost:${PORT}`);
    console.log(`🔐 Rutas de autenticación disponibles en /api/auth`);
    console.log(`🏥 Health check en /api/health`);
    console.log(`🛒 API de productos en /api/products`);
    console.log(`\n📋 Credenciales de demo:`);
    console.log(`   Email: demo@zapateria.com`);
    console.log(`   Contraseña: password`);
});
