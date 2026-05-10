const express = require('express');
const mysql = require('mysql2');

const app = express();
// Lentes puestos: Ahora Express entiende JSON
app.use(express.json()); 

/**
 * Endpoint RF01 – Validación de Cliente
 */
app.post('/api/v1/auth/validate', (req, res) => {
    const { identificador } = req.body;

    if (!identificador) {
        return res.status(400).json({ 
            success: false, 
            message: "Debe ingresar su teléfono o cédula." 
        });
    }

    const query = 'SELECT * FROM clientes WHERE cedula = ? OR telefono = ?';
    
    db.query(query, [identificador, identificador], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        if (results.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Validación exitosa.",
                cliente: {
                    nombre: results[0].nombre,
                    telefono: results[0].telefono
                }
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado. Por favor intente de nuevo o espere a un asesor."
            });
        }
    });
});

/**
 * Endpoint RF03 – Crear Reserva
 */
app.post('/api/v1/reservations', (req, res) => {
    const { id_cliente, fecha_reserva, cantidad_personas } = req.body;

    if (!id_cliente || !fecha_reserva || !cantidad_personas) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos para procesar la reserva (cliente, fecha o cantidad de personas)."
        });
    }

    const query = `INSERT INTO reservas (id_cliente, fecha_reserva, cantidad_personas, estado) 
                   VALUES (?, ?, ?, 'Pendiente')`;

    db.query(query, [id_cliente, fecha_reserva, cantidad_personas], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        return res.status(201).json({
            success: true,
            message: "Reserva creada exitosamente y pendiente de confirmación.",
            id_reserva: results.insertId
        });
    });
});

/**
 * Endpoint RF04 – Estado del Pedido
 */
app.get('/api/v1/orders/status/:numero_pedido', (req, res) => {
    const { numero_pedido } = req.params;

    const query = 'SELECT estado FROM pedidos WHERE numero_pedido = ?';

    db.query(query, [numero_pedido], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        if (results.length > 0) {
            return res.status(200).json({
                success: true,
                numero_pedido: numero_pedido,
                estado: results[0].estado,
                mensaje: `Su pedido se encuentra: ${results[0].estado}` 
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Número de pedido no encontrado. Verifique e intente nuevamente."
            });
        }
    });
});

/**
 * Endpoint RF06 – Mostrar promociones activas
 */
app.get('/api/v1/promotions/active', (req, res) => {
    const query = 'SELECT id_promocion, nombre, descripcion FROM promociones WHERE activa = 1';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        if (results.length > 0) {
            return res.status(200).json({
                success: true,
                mensaje: "Promociones activas encontradas.",
                cantidad: results.length,
                promociones: results
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No hay promociones activas en este momento."
            });
        }
    });
});

/**
 * Endpoint RF05 – Menú Digital
 */
app.post('/api/v1/content/send-menu', (req, res) => {
    const { id_cliente, canal } = req.body;

    if (!id_cliente || !canal) {
        return res.status(400).json({ 
            success: false, 
            message: "Faltan datos. Especifique el id_cliente y el canal ('email' o 'whatsapp')." 
        });
    }

    const query = 'SELECT nombre, email, telefono FROM clientes WHERE id_cliente = ?';

    db.query(query, [id_cliente], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Cliente no encontrado." });
        }

        const cliente = results[0];

        if (canal === 'email') {
            if (!cliente.email) {
                return res.status(400).json({ 
                    success: false, 
                    message: "El cliente no tiene un correo electrónico registrado." 
                });
            }
            console.log(`✉️ [Simulación] Enviando PDF del menú al correo: ${cliente.email}`);
            
            return res.status(200).json({ 
                success: true, 
                message: `Menú enviado exitosamente al correo ${cliente.email}` 
            });

        } else if (canal === 'whatsapp') {
            console.log(`📱 [Simulación] Enviando PDF del menú al WhatsApp: ${cliente.telefono}`);
            
            return res.status(200).json({ 
                success: true, 
                message: `Menú enviado exitosamente al WhatsApp ${cliente.telefono}` 
            });

        } else {
            return res.status(400).json({ 
                success: false, 
                message: "Canal no reconocido. Por favor use 'email' o 'whatsapp'." 
            });
        }
    });
});

/**
 * Endpoint RF07 – Transferir a Asesor
 * Recibe: {"telefono": "3001234567"}
 */
app.post('/api/v1/support/transfer', (req, res) => {
    const { telefono } = req.body;

    if (!telefono) {
        return res.status(400).json({
            success: false,
            message: "Faltan datos. Especifique el número de teléfono del cliente."
        });
    }

    // Aquí simularíamos guardar el registro en una tabla de 'llamadas_soporte'
    // o avisar a la cola del Call Center.
    console.log('🎧 [Call Center] Alerta: Transfiriendo la llamada del número ${telefono} a un asesor disponible...');

    return res.status(200).json({
        success: true,
        message: "Solicitud recibida. Transfiriendo llamada al próximo agente disponible.",
        extension_asignada: "101" // Simulación de una extensión
    });
});

// Iniciar el servidor (¡Siempre al final!)
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Root123!',
    database: process.env.DB_NAME || 'Local instance MySQL80',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : null,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor API REST corriendo en http://localhost:${PORT}`);
});
