const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'tu_secreto_super_seguro';

// Carpeta de almacenamiento de imágenes
const imgDir = path.join(__dirname, 'img');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

// Configuración de almacenamiento con Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imgDir);
    },
    filename: (req, file, cb) => {
        // Nombres únicos usando timestamp y número aleatorio
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (PNG, JPG, JPEG, WEBP, etc.)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10 MB
});

// Middleware básicos
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la carpeta de imágenes públicamente
app.use('/img', express.static(imgDir));

// Servir los archivos estáticos del frontend (si existe en el directorio de ejecución local)
const frontendDir = path.join(__dirname, '../frontend');
if (fs.existsSync(frontendDir)) {
    app.use(express.static(frontendDir));
}

// Endpoint de salud útil para plataformas de hosting (Render / Railway)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'creart-backend', timestamp: new Date() });
});

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
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', data: rows });
    });
});

app.post('/api/products', verifyAdmin, upload.single('image'), (req, res) => {
    const { name, price, category, description } = req.body;

    if (!name || price === undefined || !category) {
        return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
    }

    const numericPrice = parseFloat(price) || 0;
    let imagePath = '';

    if (req.file) {
        imagePath = `/img/${req.file.filename}`;
    } else if (req.body.image) {
        imagePath = req.body.image;
    } else {
        imagePath = '/img/default.png';
    }

    db.run(
        'INSERT INTO products (name, price, category, description, image) VALUES (?, ?, ?, ?, ?)',
        [name, numericPrice, category, description || '', imagePath],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                message: 'Producto creado',
                id: this.lastID,
                product: {
                    id: this.lastID,
                    name,
                    price: numericPrice,
                    category,
                    description: description || '',
                    image: imagePath
                }
            });
        }
    );
});

app.put('/api/products/:id', verifyAdmin, upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, price, category, description } = req.body;

    if (!name || price === undefined || !category) {
        return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
    }

    const numericPrice = parseFloat(price) || 0;

    // Buscar producto existente para preservar imagen si no se subió una nueva
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

        // Si se subió un nuevo archivo se usa su ruta, sino se conserva la imagen anterior
        const imagePath = req.file ? `/img/${req.file.filename}` : product.image;

        db.run(
            'UPDATE products SET name = ?, price = ?, category = ?, description = ?, image = ? WHERE id = ?',
            [name, numericPrice, category, description || '', imagePath, id],
            function (updateErr) {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                res.json({
                    message: 'Producto actualizado',
                    product: {
                        id: Number(id),
                        name,
                        price: numericPrice,
                        category,
                        description: description || '',
                        image: imagePath
                    }
                });
            }
        );
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
    if (!name) {
        return res.status(400).json({ error: 'El nombre es requerido' });
    }
    db.run(
        'INSERT INTO contact_leads (name, email, message) VALUES (?, ?, ?)',
        [name, email || '', message || ''],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Lead guardado', id: this.lastID });
        }
    );
});

// Manejo de errores de Multer y generales
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Error al procesar archivo: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 SERVIDOR DEFINITIVO LISTO en el puerto ${PORT}`);
});