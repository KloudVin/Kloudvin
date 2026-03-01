const sql = require('mssql');

module.exports = async function (context, req) {
    const config = {
        server: process.env.DB_SERVER || 'kloudvin.database.windows.net',
        database: process.env.DB_NAME || 'kloudvin',
        user: process.env.DB_USER || 'kloudvin',
        password: process.env.DB_PASSWORD || 'Vins@6579',
        options: {
            encrypt: true,
            trustServerCertificate: false,
            enableArithAbort: true
        },
        connectionTimeout: 30000,
        requestTimeout: 30000
    };

    try {
        context.log('Attempting to connect to:', config.server);
        context.log('Database:', config.database);
        context.log('User:', config.user);
        
        const pool = await sql.connect(config);
        context.log('Connected successfully!');
        
        const result = await pool.request().query('SELECT @@VERSION as version, GETDATE() as currentTime');
        
        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                success: true,
                message: 'Database connection successful',
                server: config.server,
                database: config.database,
                data: result.recordset[0]
            }
        };
    } catch (error) {
        context.log.error('Connection error:', error);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                success: false,
                error: error.message,
                code: error.code,
                server: config.server,
                database: config.database
            }
        };
    }
};
