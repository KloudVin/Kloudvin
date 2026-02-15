const { app } = require('@azure/functions');
const { getConnection, sql } = require('../shared/database');

app.http('getUser', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'users/{id}',
    handler: async (request, context) => {
        try {
            const id = request.params.id;
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM dbo.Users WHERE id = @id');
            
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
            context.error('Error fetching user:', error);
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
