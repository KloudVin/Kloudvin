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
        const user = req.body;
        const pool = await sql.connect(config);
        
        const result = await pool.request()
            .input('username', sql.NVarChar, user.username)
            .input('email', sql.NVarChar, user.email)
            .input('password_hash', sql.NVarChar, user.password_hash)
            .input('role', sql.NVarChar, user.role || 'Editor')
            .input('is_admin', sql.Bit, user.is_admin || 0)
            .input('phone', sql.NVarChar, user.phone)
            .query(`
                INSERT INTO dbo.Users 
                (username, email, password_hash, role, is_admin, phone, created_at)
                VALUES 
                (@username, @email, @password_hash, @role, @is_admin, @phone, GETUTCDATE());
                SELECT * FROM dbo.Users WHERE id = SCOPE_IDENTITY();
            `);
        
        context.res = {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: result.recordset[0]
        };
    } catch (error) {
        context.log.error('Error creating user:', error);
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
