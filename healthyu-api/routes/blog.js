// routes/blog.js - Rutas de Blog (API)

const express = require("express");
const router = express.Router();

const { sql, pool, poolConnect } = require("../db");

/*
  Estructura esperada en BD (según tu diagrama):

  Tabla Post
    id_post       int PK
    asunto        varchar(150)
    descripcion   varchar(500)

  Tabla pac_post
    ci_paciente   int FK Paciente(ci_paciente)
    id_post       int FK Post(id_post)
    fecha         date

  Tabla Usuario
    id_usuario    int PK
    ci_paciente   int FK Paciente(ci_paciente)
    nombre_usuario varchar(50)
*/

// =============================
//     LISTAR POSTS
// =============================
// GET /api/blog/listar
router.get("/listar", async (req, res) => {
  try {
    await poolConnect;

    const result = await pool.request().query(`
      SELECT
        p.id_post,
        p.asunto      AS titulo,
        p.descripcion AS contenido,
        CONVERT(varchar(16), pp.fecha, 120) AS fecha,
        ISNULL(u.nombre_usuario, 'Anónimo') AS autor
      FROM Post p
      LEFT JOIN pac_post pp   ON pp.id_post    = p.id_post
      LEFT JOIN Paciente pac  ON pac.ci_paciente = pp.ci_paciente
      LEFT JOIN Usuario u     ON u.ci_paciente = pac.ci_paciente
      ORDER BY pp.fecha DESC, p.id_post DESC;
    `);

    return res.json({ posts: result.recordset });
  } catch (error) {
    console.error("Error en GET /api/blog/listar:", error);
    return res
      .status(500)
      .json({ mensaje: "No se pudieron cargar las publicaciones del blog." });
  }
});

// =============================
//     CREAR POST
// =============================
// POST /api/blog/crear
// body: { titulo, contenido, id_usuario }
router.post("/crear", async (req, res) => {
  const { titulo, contenido, id_usuario } = req.body;

  if (!titulo || !contenido || !id_usuario) {
    return res
      .status(400)
      .json({ mensaje: "Faltan datos: titulo, contenido o id_usuario." });
  }

  try {
    await poolConnect;

    const request = pool.request();
    request.input("id_usuario", sql.Int, id_usuario);
    request.input("asunto", sql.VarChar(150), titulo);
    request.input("descripcion", sql.VarChar(500), contenido);

    const result = await request.query(`
      DECLARE @ci_paciente INT;
      DECLARE @id_post INT;

      -- Obtener CI del paciente asociado al usuario
      SELECT @ci_paciente = ci_paciente
      FROM Usuario
      WHERE id_usuario = @id_usuario;

      IF (@ci_paciente IS NULL)
      BEGIN
        THROW 50001, 'El usuario no tiene un paciente asociado', 1;
      END

      -- Generar siguiente id_post (si tu tabla NO es IDENTITY)
      SELECT @id_post = ISNULL(MAX(id_post), 0) + 1 FROM Post;

      -- Insertar post
      INSERT INTO Post (id_post, asunto, descripcion)
      VALUES (@id_post, @asunto, @descripcion);

      -- Vincular con el paciente
      INSERT INTO pac_post (ci_paciente, id_post, fecha)
      VALUES (@ci_paciente, @id_post, GETDATE());

      -- Devolver el post recién creado
      SELECT
        p.id_post,
        p.asunto      AS titulo,
        p.descripcion AS contenido,
        CONVERT(varchar(16), pp.fecha, 120) AS fecha,
        u.nombre_usuario AS autor
      FROM Post p
      JOIN pac_post pp ON pp.id_post = p.id_post
      JOIN Usuario u   ON u.ci_paciente = pp.ci_paciente
      WHERE p.id_post = @id_post;
    `);

    const nuevoPost = result.recordset[0];

    return res
      .status(201)
      .json({ mensaje: "Post creado correctamente.", post: nuevoPost });
  } catch (error) {
    console.error("Error en POST /api/blog/crear:", error);
    return res.status(500).json({ mensaje: "Error creando post." });
  }
});

module.exports = router;
