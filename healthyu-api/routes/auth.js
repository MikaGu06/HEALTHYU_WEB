// routes/auth.js - Rutas de registro y login

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { sql, pool, poolConnect } = require("../db");

const JWT_SECRET = "SUPER_SECRETO_CAMBIAR";  // cambia este valor

// =============================
//     REGISTRO DE USUARIO
// =============================
router.post("/registro", async (req, res) => {
    const { nombre_usuario, contrasena } = req.body;

    if (!nombre_usuario || !contrasena)
        return res.status(400).json({ mensaje: "Faltan datos" });

    try {
        await poolConnect;

        // Verificar si existe
        const existe = await pool.request()
            .input("nombre", sql.VarChar, nombre_usuario)
            .query("SELECT id_usuario FROM Usuario WHERE nombre_usuario = @nombre");

        if (existe.recordset.length > 0)
            return res.status(400).json({ mensaje: "Usuario ya existe" });

        const hash = await bcrypt.hash(contrasena, 10);

        // Insertar usuario
        await pool.request()
            .input("nombre", sql.VarChar, nombre_usuario)
            .input("hash", sql.VarBinary, Buffer.from(hash))
            .input("estado", sql.Bit, 1)
            .query(`
                INSERT INTO Usuario (id_usuario, nombre_usuario, contrasena_hash, estado)
                VALUES (
                    (SELECT ISNULL(MAX(id_usuario),0)+1 FROM Usuario),
                    @nombre,
                    @hash,
                    @estado
                )
            `);

        res.json({ mensaje: "Usuario registrado correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en registro" });
    }
});

// =============================
//            LOGIN
// =============================
router.post("/login", async (req, res) => {
    const { nombre_usuario, contrasena } = req.body;

    if (!nombre_usuario || !contrasena)
        return res.status(400).json({ mensaje: "Faltan datos" });

    try {
        await poolConnect;

        const result = await pool.request()
            .input("nombre", sql.VarChar, nombre_usuario)
            .query("SELECT * FROM Usuario WHERE nombre_usuario = @nombre");

        if (result.recordset.length === 0)
            return res.status(401).json({ mensaje: "Usuario no encontrado" });

        const user = result.recordset[0];
        const hash = Buffer.from(user.contrasena_hash).toString();

        const ok = await bcrypt.compare(contrasena, hash);

        if (!ok)
            return res.status(401).json({ mensaje: "Contraseña incorrecta" });

        const token = jwt.sign(
            { id_usuario: user.id_usuario, nombre_usuario: user.nombre_usuario },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            mensaje: "Login correcto",
            token,
            usuario: {
                id_usuario: user.id_usuario,
                nombre_usuario: user.nombre_usuario
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en login" });
    }
});

module.exports = router;
