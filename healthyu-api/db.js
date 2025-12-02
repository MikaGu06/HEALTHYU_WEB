// db.js - Conexión a SQL Server (HealthyU)

const sql = require("mssql");

const dbConfig = {
    user: "sa",
    password: "Passw0rd!",
    server: "159.203.102.189",   
    database: "HealthyU",
    port: 1433,
    options: {
        trustServerCertificate: true,
        encrypt: false
    }
};

// Creamos el pool
const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

module.exports = {
    sql,
    pool,
    poolConnect
};
