import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const router = express.Router();
// Usuarios en memoria (en producción usarías una base de datos)
const users = [
    {
        id: 1,
        name: 'Usuario Demo',
        email: 'yesica@zapateria.com',
        password: 'password123', // password
        role: 'customer'
    }
];
// Generar token JWT
const generateToken = (user) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'zapateria-app-secret-key';
    return jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    }, JWT_SECRET, { expiresIn: '24h' });
};
// Validación manual de email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
// Validación manual de datos
const validateRegistration = (name, email, password) => {
    const errors = [];
    if (!name || name.length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    if (!email || !isValidEmail(email)) {
        errors.push('Email inválido');
    }
    if (!password || password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    return errors;
};
const validateLogin = (email, password) => {
    const errors = [];
    if (!email || !isValidEmail(email)) {
        errors.push('Email inválido');
    }
    if (!password) {
        errors.push('La contraseña es requerida');
    }
    return errors;
};
// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Validar datos
        const errors = validateRegistration(name, email, password);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors
            });
        }
        // Verificar si el usuario ya existe
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya existe'
            });
        }
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        // Crear nuevo usuario
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword,
            role: 'customer',
            createdAt: new Date()
        };
        users.push(newUser);
        // Generar token
        const token = generateToken(newUser);
        // Devolver respuesta (sin password)
        const { password: _, ...userWithoutPassword } = newUser;
        res.json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});
// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validar datos
        const errors = validateLogin(email, password);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors
            });
        }
        // Buscar usuario
        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }
        // Generar token
        const token = generateToken(user);
        // Devolver respuesta (sin password)
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});
// Verificar token
router.get('/verify', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token no proporcionado'
        });
    }
    try {
        const JWT_SECRET = process.env.JWT_SECRET || 'zapateria-app-secret-key';
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
            success: true,
            user: decoded
        });
    }
    catch (error) {
        res.status(403).json({
            success: false,
            message: 'Token inválido'
        });
    }
});
// Obtener perfil de usuario
router.get('/profile', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token requerido'
        });
    }
    try {
        const JWT_SECRET = process.env.JWT_SECRET || 'zapateria-app-secret-key';
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            user: userWithoutPassword
        });
    }
    catch (error) {
        res.status(403).json({
            success: false,
            message: 'Token inválido'
        });
    }
});
export default router;
