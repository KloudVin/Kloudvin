const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    try {
        // Get connection string from environment variables
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        
        if (!connectionString) {
            context.res = {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: { error: 'Storage connection string not configured' }
            };
            return;
        }

        // Create BlobServiceClient
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient('images');

        // List all blobs in the container
        const images = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            images.push({
                filename: blob.name,
                url: `https://kloudvin.blob.core.windows.net/images/${blob.name}`,
                size: blob.properties.contentLength,
                lastModified: blob.properties.lastModified,
                contentType: blob.properties.contentType
            });
        }

        // Sort by last modified (newest first)
        images.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: { images, count: images.length }
        };
    } catch (error) {
        context.log.error('Error listing images:', error);
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
