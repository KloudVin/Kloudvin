const { app } = require('@azure/functions');
const { getConnection, sql } = require('../shared/database');

app.http('updateUser', {
    methods: ['PUT', 'PATCH'],
    authLevel: 'anonymous',
    route: 'users/{id}',
    handler: async (request, context) => {
        try {
            const id = request.params.id;
            const user = await request.json();
            const pool = await getConnection();
            
            // Build dynamic update query based on provided fields
            const updates = [];
            const requestObj = pool.request().input('id', sql.Int, id);
            
            if (user.username !== undefined) {
                updates.push('username = @username');
                requestObj.input('username', sql.NVarChar, user.username);
            }
            if (user.email !== undefined) {
                updates.push('email = @email');
                requestObj.input('email', sql.NVarChar, user.email);
            }
            if (user.password_hash !== undefined) {
                updates.push('password_hash = @password_hash');
                requestObj.input('password_hash', sql.NVarChar, user.password_hash);
            }
            if (user.role !== undefined) {
                updates.push('role = @role');
                requestObj.input('role', sql.NVarChar, user.role);
            }
            if (user.is_admin !== undefined) {
                updates.push('is_admin = @is_admin');
                requestObj.input('is_admin', sql.Bit, user.is_admin);
            }
            if (user.phone !== undefined) {
                updates.push('phone = @phone');
                requestObj.input('phone', sql.NVarChar, user.phone);
            }
            if (user.otp_code !== undefined) {
                updates.push('otp_code = @otp_code');
                requestObj.input('otp_code', sql.NVarChar, user.otp_code);
            }
            if (user.otp_expires !== undefined) {
                updates.push('otp_expires = @otp_expires');
                requestObj.input('otp_expires', sql.DateTime2, user.otp_expires);
            }
            if (user.otp_type !== undefined) {
                updates.push('otp_type = @otp_type');
                requestObj.input('otp_type', sql.NVarChar, user.otp_type);
            }
            if (user.last_login !== undefined) {
                updates.push('last_login = @last_login');
                requestObj.input('last_login', sql.DateTime2, user.last_login);
            }
            
            if (updates.length === 0) {
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'No fields to update' })
                };
            }
            
            const query = `
                UPDATE dbo.Users 
                SET ${updates.join(', ')}
                WHERE id = @id;
                SELECT * FROM dbo.Users WHERE id = @id;
            `;
            
            const result = await requestObj.query(query);
            
            if (result.recordset.length === 0) {
                return {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'User not found' })
                };
            }
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(result.recordset[0])
            };
        } catch (error) {
            context.error('Error updating user:', error);
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
