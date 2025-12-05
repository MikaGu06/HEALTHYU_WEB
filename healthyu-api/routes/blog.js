const express = require("express");
const router = express.Router();
const { sql, pool, poolConnect } = require("../db");

// ======================================================
// OBTENER TODOS LOS POSTS
// ======================================================
router.get("/", async (req, res) => {
  try {
    await poolConnect;

    const result = await pool.request().query(`
      SELECT id_post, asunto, descripcion
      FROM post
      ORDER BY id_post DESC
    `);

    return res.json(result.recordset);

  } catch (err) {
    console.log("Error GET /blog:", err);
    return res.status(500).json({ mensaje: "Error obteniendo posts" });
  }
});

// ======================================================
// OBTENER UN ÚNICO POST (Para Leer más)
// ======================================================
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await poolConnect;

    const request = pool.request();
    request.input("id", sql.Int, id);

    const result = await request.query(`
      SELECT id_post, asunto, descripcion
      FROM post
      WHERE id_post = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: "Post no encontrado" });
    }

    return res.json(result.recordset[0]);

  } catch (err) {
    console.log("Error GET /blog/:id:", err);
    return res.status(500).json({ mensaje: "Error obteniendo post" });
  }
});

// ======================================================
// CREAR POST
// ======================================================
router.post("/", async (req, res) => {
  try {
    const { asunto, descripcion } = req.body;

    if (!asunto || !descripcion) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    await poolConnect;

    const request = pool.request();
    request.input("asunto", sql.VarChar(150), asunto);
    request.input("descripcion", sql.VarChar(500), descripcion);

    const result = await request.query(`
      INSERT INTO post (asunto, descripcion)
      OUTPUT inserted.*
      VALUES (@asunto, @descripcion)
    `);

    return res.json({
      mensaje: "Post creado correctamente",
      post: result.recordset[0]
    });

  } catch (err) {
    console.log("Error POST /blog:", err);
    return res.status(500).json({ mensaje: "Error creando post" });
  }
});

module.exports = router;
