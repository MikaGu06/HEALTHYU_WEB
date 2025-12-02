// index.js - API HealthyU

const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");

app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);

// Ruta básica
app.get("/", (req, res) => {
  res.json({ mensaje: "API HealthyU funcionando correctamente 🚀" });
});

// Puerto de escucha
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ API HealthyU escuchando en el puerto ${PORT}`);
});
