const { getPool } = require('../shared/db-config');

module.exports = async function (context, req) {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM dbo.Users ORDER BY created_at DESC');
        
        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: { value: result.recordset }
        };
    } catch (error) {
        context.log.error('Error fetching users:', error);
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
