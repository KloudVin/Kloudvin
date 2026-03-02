const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

app.http('listImages', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'images',
    handler: async (request, context) => {
        try {
            const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
            
            if (!connectionString) {
                context.error('AZURE_STORAGE_CONNECTION_STRING not configured');
                return {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ 
                        error: 'Storage connection not configured',
                        images: []
                    })
                };
            }

            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient('images');
            
            const images = [];
            
            // List all blobs in the container
            for await (const blob of containerClient.listBlobsFlat()) {
                images.push({
                    name: blob.name,
                    url: `https://kloudvin.blob.core.windows.net/images/${blob.name}`,
                    size: blob.properties.contentLength,
                    lastModified: blob.properties.lastModified
                });
            }
            
            context.log(`Found ${images.length} images in storage`);
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ images })
            };
        } catch (error) {
            context.error('Error listing images:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: error.message,
                    images: []
                })
            };
        }
    }
});
