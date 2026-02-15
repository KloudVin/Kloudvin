const sql = require('mssql');

const config = {
    server: process.env.DB_SERVER || 'kloudvin.database.windows.net',
    database: process.env.DB_NAME || 'kloudvin',
    user: process.env.DB_USER || 'kloudvin',
    password: process.env.DB_PASSWORD || 'Vins@6579',
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

async function getConnection() {
    if (!pool) {
        pool = await sql.connect(config);
    }
    return pool;
}

module.exports = { getConnection, sql };
