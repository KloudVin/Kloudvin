const { app } = require('@azure/functions');
const { getConnection, sql } = require('../shared/database');

app.http('getArticles', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'articles',
    handler: async (request, context) => {
        try {
            const pool = await getConnection();
            
            // Get query parameters
            const orderBy = request.query.get('$orderby') || 'created_at desc';
            const top = request.query.get('$top') || null;
            const filter = request.query.get('$filter') || null;
            
            // Build query
            let query = 'SELECT * FROM dbo.Articles';
            
            // Add filter if provided
            if (filter) {
                // Simple filter parsing (category eq 'value')
                const filterMatch = filter.match(/(\w+)\s+eq\s+'([^']+)'/);
                if (filterMatch) {
                    query += ` WHERE ${filterMatch[1]} = @filterValue`;
                }
            }
            
            // Add order by
            const orderMatch = orderBy.match(/(\w+)\s*(asc|desc)?/i);
            if (orderMatch) {
                query += ` ORDER BY ${orderMatch[1]} ${orderMatch[2] || 'ASC'}`;
            }
            
            // Add top
            if (top) {
                query = query.replace('SELECT', `SELECT TOP ${parseInt(top)}`);
            }
            
            const result = await pool.request()
                .input('filterValue', sql.NVarChar, filter ? filter.match(/'([^']+)'/)[1] : null)
                .query(query);
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ value: result.recordset })
            };
        } catch (error) {
            context.error('Error fetching articles:', error);
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
