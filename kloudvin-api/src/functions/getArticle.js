const { app } = require('@azure/functions');
const { getConnection, sql } = require('../shared/database');

app.http('getArticle', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'articles/{id}',
    handler: async (request, context) => {
        try {
            const id = request.params.id;
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('id', sql.NVarChar, id)
                .query('SELECT * FROM dbo.Articles WHERE id = @id');
            
            if (result.recordset.length === 0) {
                return {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'Article not found' })
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
            context.error('Error fetching article:', error);
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
