const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routes/index");
const blogRoutes = require("./routes/blog");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// servir frontend si lo necesitas
app.use(express.static(path.join(__dirname, "public")));

// rutas API principales
app.use("/api", apiRoutes);        // /api/auth/..., /api/pacientes/...
app.use("/api/blog", blogRoutes);  // /api/blog/listar, /api/blog/crear

app.listen(PORT, () => {
  console.log(`HealthyU API escuchando en http://localhost:${PORT}`);
});
