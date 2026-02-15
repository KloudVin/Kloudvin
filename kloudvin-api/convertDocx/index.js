const mammoth = require('mammoth');
const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    context.log('DOCX conversion request received');
    
    try {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error('Storage connection string not configured');
        }
        
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient('images');
        
        // Get DOCX file from request body
        if (!req.body || !req.body.docx) {
            throw new Error('No DOCX data provided');
        }
        
        const docxBuffer = Buffer.from(req.body.docx, 'base64');
        
        // Convert DOCX to Markdown with image extraction
        const result = await mammoth.convertToMarkdown(docxBuffer, {
            styleMap: [
                "p[style-name='Heading 1'] => # ",
                "p[style-name='Heading 2'] => ## ",
                "p[style-name='Heading 3'] => ### ",
                "p[style-name='Heading 4'] => #### ",
                "p[style-name='Title'] => # ",
                "p[style-name='Subtitle'] => ## ",
                "b => **",
                "i => *",
                "u => _"
            ],
            convertImage: mammoth.images.imgElement(async function(image) {
                try {
                    // Read image data
                    const imageBuffer = await image.read();
                    
                    // Generate unique filename
                    const extension = image.contentType.split('/')[1] || 'png';
                    const timestamp = Date.now();
                    const random = Math.random().toString(36).substring(7);
                    const filename = `${timestamp}-${random}.${extension}`;
                    
                    context.log('Uploading image:', filename);
                    
                    // Upload to blob storage
                    const blockBlobClient = containerClient.getBlockBlobClient(filename);
                    await blockBlobClient.upload(imageBuffer, imageBuffer.length, {
                        blobHTTPHeaders: { blobContentType: image.contentType }
                    });
                    
                    context.log('Image uploaded:', blockBlobClient.url);
                    
                    // Return image URL for markdown
                    return { src: blockBlobClient.url };
                } catch (imgError) {
                    context.log.error('Image extraction error:', imgError);
                    return { src: '' };
                }
            })
        });
        
        // Clean up the markdown
        let markdown = result.value;
        
        // First pass: Remove escaped characters and clean up basic formatting
        markdown = markdown
            // Remove ALL backslash escapes (mammoth over-escapes)
            .replace(/\\([().\[\]{}*_#+-])/g, '$1')
            
            // Remove table of contents section completely
            .replace(/^#{1,3}\s*Contents\s*$/mi, '')
            .replace(/^Contents\s*$/mi, '')
            
            // Remove all TOC links
            .replace(/\[__[^\]]*__\s*\d*\]\(#[^)]*\)/g, '')
            .replace(/\[[^\]]*\]\(#_Toc\d+\)/g, '')
            .replace(/\[#_Toc\d+\]/g, '')
            
            // Remove anchor tags
            .replace(/<a id="[^"]*"><\/a>/g, '')
            .replace(/<a id='[^']*'><\/a>/g, '')
            
            // Clean up headings - remove underscores and extra formatting
            .replace(/^(#{1,6})\s*__(.+?)__\s*$/gm, '$1 $2')
            .replace(/^(#{1,6})\s*\*\*(.+?)\*\*\s*$/gm, '$1 $2')
            
            // Remove "read time" text
            .replace(/\d+\s*min\s*read/gi, '')
            
            // Remove page numbers and footers (standalone numbers)
            .replace(/^\d+\s*$/gm, '')
            
            // Clean up multiple underscores
            .replace(/_{3,}/g, '')
            
            // Remove empty links
            .replace(/\[\]\([^)]*\)/g, '');
        
        // Process line by line for better control
        const lines = markdown.split('\n');
        const processedLines = [];
        let inList = false;
        let listType = '';
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // Skip completely empty lines initially
            if (line.length === 0) {
                // End of list - add spacing
                if (inList) {
                    processedLines.push('');
                    inList = false;
                    listType = '';
                }
                continue;
            }
            
            // Detect line type
            const isHeading = line.match(/^#{1,6}\s/);
            const isNumbered = line.match(/^(\d+)\.\s+(.+)/);
            const isBullet = line.match(/^[-*•·●○]\s+(.+)/);
            const isCode = line.match(/^```/);
            
            // Handle numbered lists
            if (isNumbered) {
                const [, num, content] = isNumbered;
                line = `${num}. ${content}`;
                if (!inList || listType !== 'numbered') {
                    if (processedLines.length > 0) processedLines.push('');
                    inList = true;
                    listType = 'numbered';
                }
            }
            // Handle bullet lists
            else if (isBullet) {
                const content = isBullet[1];
                line = `- ${content}`;
                if (!inList || listType !== 'bullet') {
                    if (processedLines.length > 0) processedLines.push('');
                    inList = true;
                    listType = 'bullet';
                }
            }
            // Handle headings
            else if (isHeading) {
                if (inList) {
                    processedLines.push('');
                    inList = false;
                    listType = '';
                }
                if (processedLines.length > 0) processedLines.push('');
                processedLines.push(line);
                processedLines.push('');
                continue;
            }
            // Regular text
            else {
                if (inList) {
                    processedLines.push('');
                    inList = false;
                    listType = '';
                }
            }
            
            processedLines.push(line);
        }
        
        markdown = processedLines.join('\n')
            // Final cleanup - normalize spacing (max 2 newlines)
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        
        context.log('Conversion successful, markdown length:', markdown.length);
        context.log('First 500 chars:', markdown.substring(0, 500));
        
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: {
                success: true,
                markdown: markdown,
                messages: result.messages,
                imageCount: (markdown.match(/!\[/g) || []).length
            }
        };
    } catch (error) {
        context.log.error('Conversion error:', error);
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
