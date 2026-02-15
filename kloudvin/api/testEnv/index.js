module.exports = async function (context, req) {
    context.log('Environment test');

    const envVars = {
        DB_SERVER: process.env.DB_SERVER ? 'SET' : 'MISSING',
        DB_NAME: process.env.DB_NAME ? 'SET' : 'MISSING',
        DB_USER: process.env.DB_USER ? 'SET' : 'MISSING',
        DB_PASSWORD: process.env.DB_PASSWORD ? 'SET (length: ' + (process.env.DB_PASSWORD || '').length + ')' : 'MISSING',
        AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING ? 'SET' : 'MISSING',
        NODE_VERSION: process.version
    };

    context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: envVars
    };
};
