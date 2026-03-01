const { getPool } = require('../shared/db-config');

module.exports = async function (context, req) {
    try {
        const pool = await getPool();
        
        const orderBy = req.query.$orderby || 'created_at desc';
        const orderMatch = orderBy.match(/(\w+)\s*(asc|desc)?/i);
        
        let query = 'SELECT * FROM dbo.Articles';
        if (orderMatch) {
            query += ` ORDER BY ${orderMatch[1]} ${orderMatch[2] || 'ASC'}`;
        }
        
        const result = await pool.request().query(query);
        
        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: { value: result.recordset }
        };
    } catch (error) {
        context.log.error('Error fetching articles:', error);
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
