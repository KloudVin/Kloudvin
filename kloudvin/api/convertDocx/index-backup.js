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
                "p[style-name='Heading 5'] => ##### ",
                "p[style-name='Heading 6'] => ###### ",
                "p[style-name='Title'] => # ",
                "p[style-name='Subtitle'] => ## ",
                "p[style-name='heading 1'] => # ",
                "p[style-name='heading 2'] => ## ",
                "p[style-name='heading 3'] => ### ",
                "p[style-name='heading 4'] => #### ",
                "b => **",
                "i => *",
                "u => **",
                "code => `",
                "strike => ~~"
            ],
            preserveEmptyParagraphs: false,
            ignoreEmptyParagraphs: true,
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

            // Convert any remaining __ to ** (from underline formatting in Word)
            .replace(/__/g, '**')

            // Remove bold formatting from images (fix __![...]__ and **![...]** to ![...])
            .replace(/\*\*!\[/g, '![')
            .replace(/\]\([^)]+\)\*\*/g, function(match) {
                return match.replace(/\*\*$/, '');
            })

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
        let listIndent = 0;
        let prevWasHeading = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trimEnd(); // Keep leading spaces for indentation
            let trimmedLine = line.trim();

            // Skip completely empty lines initially
            if (trimmedLine.length === 0) {
                // End of list - add spacing
                if (inList) {
                    processedLines.push('');
                    inList = false;
                    listType = '';
                    listIndent = 0;
                }
                // Add space after headings
                if (prevWasHeading) {
                    processedLines.push('');
                    prevWasHeading = false;
                }
                continue;
            }

            // Detect line type
            const isHeading = trimmedLine.match(/^(#{1,6})\s+(.+)/);
            const isNumbered = trimmedLine.match(/^(\s*)(\d+)\.\s+(.+)/);
            const isBullet = trimmedLine.match(/^(\s*)[-*•·●○]\s+(.+)/);
            const isCode = trimmedLine.match(/^```/);
            const isBold = trimmedLine.match(/^\*\*(.+)\*\*$/);
            const isItalic = trimmedLine.match(/^\*(.+)\*$/);

            // Preserve code blocks exactly
            if (isCode) {
                if (inList) {
                    processedLines.push('');
                    inList = false;
                    listType = '';
                }
                processedLines.push(trimmedLine);
                prevWasHeading = false;
                continue;
            }

            // Handle numbered lists with proper indentation
            if (isNumbered) {
                const [, indent, num, content] = isNumbered;
                const indentLevel = Math.floor(indent.length / 2); // Assume 2 spaces per indent
                const indentStr = '  '.repeat(indentLevel);
                line = `${indentStr}${num}. ${content}`;

                if (!inList || listType !== 'numbered') {
                    if (processedLines.length > 0 && !prevWasHeading) processedLines.push('');
                    inList = true;
                    listType = 'numbered';
                }
                processedLines.push(line);
                prevWasHeading = false;
                continue;
            }

            // Handle bullet lists with proper indentation
            if (isBullet) {
                const [, indent, content] = isBullet;
                const indentLevel = Math.floor(indent.length / 2);
                const indentStr = '  '.repeat(indentLevel);
                line = `${indentStr}- ${content}`;

                if (!inList || listType !== 'bullet') {
                    if (processedLines.length > 0 && !prevWasHeading) processedLines.push('');
                    inList = true;
                    listType = 'bullet';
                }
                processedLines.push(line);
                prevWasHeading = false;
                continue;
            }

            // Handle headings with proper spacing
            if (isHeading) {
                const [, hashes, title] = isHeading;
                if (inList) {
                    processedLines.push('');
                    inList = false;
                    listType = '';
                }
                if (processedLines.length > 0 && !prevWasHeading) {
                    processedLines.push('');
                }
                processedLines.push(`${hashes} ${title.trim()}`);
                prevWasHeading = true;
                continue;
            }

            // Handle bold standalone lines (might be headings)
            if (isBold && trimmedLine.length < 80) {
                if (inList) {
                    processedLines.push('');
                    inList = false;
                    listType = '';
                }
                if (processedLines.length > 0) processedLines.push('');
                processedLines.push(`## ${isBold[1]}`);
                prevWasHeading = true;
                continue;
            }

            // Regular paragraph text
            if (inList) {
                // If we're in a list and encounter regular text, it might be a continuation
                // Check if it's actually meant to be part of the list item
                const prevLine = processedLines[processedLines.length - 1];
                if (prevLine && (prevLine.match(/^\s*\d+\./) || prevLine.match(/^\s*-/))) {
                    // This could be a continuation of previous list item
                    // Add it as a new paragraph under the list item
                    const prevIndent = prevLine.match(/^(\s*)/)[1];
                    processedLines.push(prevIndent + '  ' + trimmedLine);
                } else {
                    // End the list
                    processedLines.push('');
                    inList = false;
                    listType = '';
                    processedLines.push(trimmedLine);
                }
            } else {
                processedLines.push(trimmedLine);
            }
            prevWasHeading = false;
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
