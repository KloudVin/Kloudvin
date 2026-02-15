const { app } = require('@azure/functions');
const { getConnection, sql } = require('../shared/database');

app.http('deleteArticle', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'articles/{id}',
    handler: async (request, context) => {
        try {
            const id = request.params.id;
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('id', sql.NVarChar, id)
                .query('DELETE FROM dbo.Articles WHERE id = @id');
            
            if (result.rowsAffected[0] === 0) {
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
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            };
        } catch (error) {
            context.error('Error deleting article:', error);
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
