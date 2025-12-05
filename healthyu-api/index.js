// healthyu-api/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 4000;

// ────────────────────────────
// Middlewares
// ────────────────────────────
app.use(cors());
app.use(express.json());

// Servir el frontend (carpeta public)
app.use(express.static(path.join(__dirname, "public")));

// ────────────────────────────
// Rutas API
// ────────────────────────────

const apiRoutes = require("./routes/index");


app.use("/api", apiRoutes);

// ────────────────────────────
// Arrancar servidor
// ────────────────────────────
app.listen(PORT, () => {
  console.log(`HealthyU API escuchando en http://localhost:${PORT}`);
});
