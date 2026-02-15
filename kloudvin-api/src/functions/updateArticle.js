const { app } = require('@azure/functions');
const { getConnection, sql } = require('../shared/database');

app.http('updateArticle', {
    methods: ['PUT', 'PATCH'],
    authLevel: 'anonymous',
    route: 'articles/{id}',
    handler: async (request, context) => {
        try {
            const id = request.params.id;
            const article = await request.json();
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('id', sql.NVarChar, id)
                .input('title', sql.NVarChar, article.title)
                .input('description', sql.NVarChar, article.description)
                .input('content', sql.NVarChar(sql.MAX), article.content)
                .input('category', sql.NVarChar, article.category)
                .input('read_time', sql.NVarChar, article.read_time)
                .input('tags', sql.NVarChar, article.tags)
                .input('date_published', sql.NVarChar, article.date_published)
                .query(`
                    UPDATE dbo.Articles 
                    SET title = @title,
                        description = @description,
                        content = @content,
                        category = @category,
                        read_time = @read_time,
                        tags = @tags,
                        date_published = @date_published,
                        updated_at = GETUTCDATE()
                    WHERE id = @id;
                    SELECT * FROM dbo.Articles WHERE id = @id;
                `);
            
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
            context.error('Error updating article:', error);
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
