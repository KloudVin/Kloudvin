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
        const article = req.body;
        const pool = await sql.connect(config);

        const result = await pool.request()
            .input('id', sql.NVarChar, article.id)
            .input('title', sql.NVarChar, article.title)
            .input('description', sql.NVarChar, article.description)
            .input('content', sql.NVarChar(sql.MAX), article.content)
            .input('category', sql.NVarChar, article.category)
            .input('read_time', sql.NVarChar, article.read_time || null)
            .input('tags', sql.NVarChar, article.tags || null)
            .input('date_published', sql.NVarChar, article.date_published)
            .input('author_id', sql.Int, article.author_id || null)
            .query(`
                INSERT INTO dbo.Articles
                (id, title, description, content, category, read_time, tags, date_published, author_id, created_at, updated_at)
                VALUES
                (@id, @title, @description, @content, @category, @read_time, @tags, @date_published, @author_id, GETUTCDATE(), GETUTCDATE());
                SELECT * FROM dbo.Articles WHERE id = @id;
            `);

        context.res = {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: result.recordset[0]
        };
    } catch (error) {
        context.log.error('Error creating article:', error);

        // Detect duplicate primary key — tell the client to retry with a different ID
        const isDuplicateKey =
            error.number === 2627 ||  // SQL Server: Violation of PRIMARY KEY constraint
            error.number === 2601 ||  // SQL Server: Violation of UNIQUE KEY constraint
            (error.message && error.message.includes('duplicate key'));

        context.res = {
            status: isDuplicateKey ? 409 : 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                error: error.message,
                code: isDuplicateKey ? 'DUPLICATE_ID' : 'SERVER_ERROR'
            }
        };
    }
};
