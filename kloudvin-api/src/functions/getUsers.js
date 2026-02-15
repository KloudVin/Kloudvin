const { app } = require('@azure/functions');
const { getConnection, sql } = require('../shared/database');

app.http('getUsers', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'users',
    handler: async (request, context) => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .query('SELECT * FROM dbo.Users ORDER BY created_at DESC');
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ value: result.recordset })
            };
        } catch (error) {
            context.error('Error fetching users:', error);
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
