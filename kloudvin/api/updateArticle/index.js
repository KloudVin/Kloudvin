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
        const article = req.body;
        const pool = await sql.connect(config);
        
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
            context.res = {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: { error: 'Article not found' }
            };
            return;
        }
        
        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: result.recordset[0]
        };
    } catch (error) {
        context.log.error('Error updating article:', error);
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
