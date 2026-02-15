const { app } = require('@azure/functions');
const { getConnection, sql } = require('../shared/database');

app.http('createArticle', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'articles',
    handler: async (request, context) => {
        try {
            const article = await request.json();
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('id', sql.NVarChar, article.id)
                .input('title', sql.NVarChar, article.title)
                .input('description', sql.NVarChar, article.description)
                .input('content', sql.NVarChar(sql.MAX), article.content)
                .input('category', sql.NVarChar, article.category)
                .input('read_time', sql.NVarChar, article.read_time)
                .input('tags', sql.NVarChar, article.tags)
                .input('date_published', sql.NVarChar, article.date_published)
                .input('author_id', sql.Int, article.author_id || null)
                .query(`
                    INSERT INTO dbo.Articles 
                    (id, title, description, content, category, read_time, tags, date_published, author_id, created_at, updated_at)
                    VALUES 
                    (@id, @title, @description, @content, @category, @read_time, @tags, @date_published, @author_id, GETUTCDATE(), GETUTCDATE());
                    SELECT * FROM dbo.Articles WHERE id = @id;
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
            context.error('Error creating article:', error);
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
