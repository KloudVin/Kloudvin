const sql = require('mssql');

const config = {
    server: process.env.DB_SERVER || 'kloudvin.database.windows.net',
    database: process.env.DB_NAME || 'kloudvin',
    user: process.env.DB_USER || 'kloudvin',
    password: process.env.DB_PASSWORD || 'Vins@6579',
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(config);
        
        const orderBy = req.query.$orderby || 'created_at desc';
        const orderMatch = orderBy.match(/(\w+)\s*(asc|desc)?/i);
        
        let query = 'SELECT * FROM dbo.Articles';
        if (orderMatch) {
            query += ` ORDER BY ${orderMatch[1]} ${orderMatch[2] || 'ASC'}`;
        }
        
        const result = await pool.request().query(query);
        
        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: { value: result.recordset }
        };
    } catch (error) {
        context.log.error('Error fetching articles:', error);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: { error: error.message }
        };
    }
};
