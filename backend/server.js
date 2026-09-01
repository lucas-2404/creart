const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'tu_secreto_super_seguro';

// Middleware
app.use(cors());
app.use(express.json());

// --- MIDDLEWARE DE AUTENTICACIÓN Y ROL ---
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
        if (decoded.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
        req.user = decoded;
        next();
    });
};

// --- RUTAS DE AUTENTICACIÓN ---
// ESTA ES LA PUERTA QUE NO EXISTÍA EN LA VERSIÓN ANTERIOR
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ message: 'Login exitoso', token, user: { id: user.id, email: user.email, role: user.role } });
    });
});

// --- RUTAS DE PRODUCTOS ---
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "success", data: rows });
    });
});

app.post('/api/products', verifyAdmin, (req, res) => {
    const { name, price, category, description, image } = req.body;
    db.run('INSERT INTO products (name, price, category, description, image) VALUES (?, ?, ?, ?, ?)',
        [name, price, category, description, image], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Producto creado', id: this.lastID });
        });
});

app.put('/api/products/:id', verifyAdmin, (req, res) => {
    const { name, price, category, description, image } = req.body;
    const { id } = req.params;
    db.run('UPDATE products SET name = ?, price = ?, category = ?, description = ?, image = ? WHERE id = ?',
        [name, price, category, description, image, id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Producto actualizado' });
        });
});

app.delete('/api/products/:id', verifyAdmin, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Producto eliminado' });
    });
});

// --- RUTA DE CONTACTO ---
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }
    db.run(
        'INSERT INTO contact_leads (name, email, message) VALUES (?, ?, ?)',
        [name, email, message || ''],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Lead guardado', id: this.lastID });
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 SERVIDOR DEFINITIVO LISTO en el puerto ${PORT}`);
});