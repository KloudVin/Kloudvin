const { BlobServiceClient } = require('@azure/storage-blob');
const multipart = require('parse-multipart');

module.exports = async function (context, req) {
    context.log('Image upload request received');
    
    try {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error('Storage connection string not configured');
        }
        
        context.log('Connection string found');
        
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient('images');
        
        context.log('Container client created');
        
        // Parse multipart form data
        const bodyBuffer = Buffer.from(req.body);
        const boundary = multipart.getBoundary(req.headers['content-type']);
        
        context.log('Boundary:', boundary);
        
        const parts = multipart.Parse(bodyBuffer, boundary);
        
        context.log('Parts parsed:', parts ? parts.length : 0);
        
        if (!parts || parts.length === 0) {
            throw new Error('No file uploaded');
        }
        
        const file = parts[0];
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const filename = `${timestamp}-${random}-${file.filename}`;
        
        context.log('Uploading file:', filename);
        
        // Upload to blob storage
        const blockBlobClient = containerClient.getBlockBlobClient(filename);
        await blockBlobClient.upload(file.data, file.data.length, {
            blobHTTPHeaders: { blobContentType: file.type }
        });
        
        const imageUrl = blockBlobClient.url;
        
        context.log('Upload successful:', imageUrl);
        
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: { 
                success: true,
                url: imageUrl, 
                filename: filename 
            }
        };
    } catch (error) {
        context.log.error('Upload error:', error);
        context.res = {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
            body: { 
                success: false,
                error: error.message 
            }
        };
    }
};
