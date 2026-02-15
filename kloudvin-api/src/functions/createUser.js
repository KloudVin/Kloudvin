const { app } = require('@azure/functions');
const { getConnection, sql } = require('../shared/database');

app.http('createUser', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'users',
    handler: async (request, context) => {
        try {
            const user = await request.json();
            const pool = await getConnection();
            
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
            
            return {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(result.recordset[0])
            };
        } catch (error) {
            context.error('Error creating user:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: error.message })
            };
        }
    }
});
