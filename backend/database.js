const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Ruta segura a la base de datos SQLite apuntando a __dirname (con soporte opcional para variables de entorno de volúmenes persistentes)
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            image TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            } else {
                console.log('Table products ready.');
                // Check if table is empty
                db.get("SELECT count(*) as count FROM products", (err, row) => {
                    if (row.count === 0) {
                        const initialData = [
                            {
                                id: 1,
                                name: "Llavero de Madera Grabado",
                                price: 1500,
                                category: "madera",
                                description: "Llavero de madera natural con grabado láser personalizado. Ideal para regalos corporativos o souvenirs.",
                                image: "./img/logocreart.png"
                            },
                            {
                                id: 2,
                                name: "Placa Identificatoria para Mascotas",
                                price: 2200,
                                category: "metal",
                                description: "Placa de acero inoxidable grabada en ambas caras. Resistente y duradera.",
                                image: "./img/logocreart.png"
                            },
                            {
                                id: 3,
                                name: "Tabla de Picar Personalizada",
                                price: 8500,
                                category: "madera",
                                description: "Tabla de madera de bambú con grabado de iniciales o logos. Perfecta para asados.",
                                image: "./img/logocreart.png"
                            },
                            {
                                id: 4,
                                name: "Mate Torpedo con Virola Grabada",
                                price: 12000,
                                category: "metal",
                                description: "Mate uruguayo con virola de alpaca grabada a fuego. Un clásico reinventado.",
                                image: "./img/logocreart.png"
                            },
                            {
                                id: 5,
                                name: "Caja de Té Grabada",
                                price: 6500,
                                category: "madera",
                                description: "Caja organizadora de té en madera MDF con tapa grabada.",
                                image: "./img/logocreart.png"
                            },
                            {
                                id: 6,
                                name: "Termo Grabado a Láser",
                                price: 18000,
                                category: "metal",
                                description: "Termo de acero inoxidable de 1 litro con grabado 360 grados.",
                                image: "./img/logocreart.png"
                            }
                        ];

                        const insert = db.prepare('INSERT INTO products (id, name, price, category, description, image) VALUES (?, ?, ?, ?, ?, ?)');
                        initialData.forEach(item => {
                            insert.run(item.id, item.name, item.price, item.category, item.description, item.image);
                        });
                        insert.finalize();
                        console.log('Inserted initial data into products table.');
                    }
                });
            }
        });

        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )`, (err) => {
            if (err) {
                console.error('Error creating users table', err.message);
            } else {
                console.log('Table users ready.');
                // Check if admin exists
                db.get("SELECT count(*) as count FROM users", (err, row) => {
                    if (row.count === 0) {
                        const hash = bcrypt.hashSync('admin123', 10);
                        db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', 
                            ['admin@creart.com', hash, 'admin']
                        );
                        console.log('Inserted default admin user.');
                    }
                });
            }
        });

        // Create contact_leads table
        db.run(`CREATE TABLE IF NOT EXISTS contact_leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating contact_leads table', err.message);
            } else {
                console.log('Table contact_leads ready.');
            }
        });
    }
});

module.exports = db;
