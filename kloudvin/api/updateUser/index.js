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
        const id = req.params.id;
        const updates = req.body;
        const pool = await sql.connect(config);

        // Fetch the current user record first
        const currentUserResult = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM dbo.Users WHERE id = @id');

        if (currentUserResult.recordset.length === 0) {
            context.res = {
                status: 404,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: { error: 'User not found' }
            };
            return;
        }

        const currentUser = currentUserResult.recordset[0];

        // Build dynamic UPDATE query based on provided fields
        const fields = [];
        const request = pool.request().input('id', sql.Int, id);

        if (updates.email !== undefined) {
            const newEmail = updates.email.toLowerCase().trim();
            const currentEmail = (currentUser.email || '').toLowerCase().trim();

            if (newEmail !== currentEmail) {
                // Email is changing — check it's not already taken by another user
                const emailCheck = await pool.request()
                    .input('emailCheck', sql.NVarChar, newEmail)
                    .input('idCheck', sql.Int, id)
                    .query('SELECT id FROM dbo.Users WHERE LOWER(email) = LOWER(@emailCheck) AND id != @idCheck');

                if (emailCheck.recordset.length > 0) {
                    context.res = {
                        status: 409,
                        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                        body: { error: 'Email address is already in use by another account.' }
                    };
                    return;
                }

                fields.push('email = @email');
                request.input('email', sql.NVarChar, updates.email);
            }
            // If email is unchanged, skip it entirely — no-op avoids duplicate key errors
        }

        if (updates.password_hash !== undefined) {
            fields.push('password_hash = @password_hash');
            request.input('password_hash', sql.NVarChar, updates.password_hash);
        }
        if (updates.role !== undefined) {
            fields.push('role = @role');
            request.input('role', sql.NVarChar, updates.role);
        }
        if (updates.is_admin !== undefined) {
            fields.push('is_admin = @is_admin');
            request.input('is_admin', sql.Bit, updates.is_admin);
        }
        if (updates.phone !== undefined) {
            fields.push('phone = @phone');
            request.input('phone', sql.NVarChar, updates.phone);
        }
        if (updates.last_login !== undefined) {
            fields.push('last_login = @last_login');
            request.input('last_login', sql.DateTime, updates.last_login);
        }

        if (fields.length === 0) {
            // Nothing actually changed — return the current user as-is (success)
            context.res = {
                status: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: currentUser
            };
            return;
        }

        const query = `
            UPDATE dbo.Users
            SET ${fields.join(', ')}
            WHERE id = @id;
            SELECT * FROM dbo.Users WHERE id = @id;
        `;

        const result = await request.query(query);

        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: result.recordset[0]
        };
    } catch (error) {
        context.log.error('Error updating user:', error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: { error: error.message }
        };
    }
};
