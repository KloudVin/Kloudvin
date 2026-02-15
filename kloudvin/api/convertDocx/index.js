const mammoth = require('mammoth');
const TurndownService = require('turndown');
const { gfm } = require('turndown-plugin-gfm');
const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    context.log('DOCX conversion request received (MarkItDown-style approach)');

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
        context.log('DOCX buffer size:', docxBuffer.length);

        // STEP 1: Convert DOCX to HTML using mammoth (better structure preservation)
        const htmlResult = await mammoth.convertToHtml(docxBuffer, {
            styleMap: [
                "p[style-name='Heading 1'] => h1:fresh",
                "p[style-name='Heading 2'] => h2:fresh",
                "p[style-name='Heading 3'] => h3:fresh",
                "p[style-name='Heading 4'] => h4:fresh",
                "p[style-name='Heading 5'] => h5:fresh",
                "p[style-name='Heading 6'] => h6:fresh",
                "p[style-name='Title'] => h1:fresh",
                "p[style-name='Subtitle'] => h2:fresh",
                "p[style-name='heading 1'] => h1:fresh",
                "p[style-name='heading 2'] => h2:fresh",
                "p[style-name='heading 3'] => h3:fresh",
                "p[style-name='heading 4'] => h4:fresh",
                "p[style-name='List Paragraph'] => p:fresh",
                "p[style-name='Normal'] => p:fresh"
            ],
            preserveEmptyParagraphs: false,
            ignoreEmptyParagraphs: true,
            convertImage: mammoth.images.imgElement(async function(image) {
                try {
                    context.log('Processing image:', image.contentType);
                    const imageBuffer = await image.read();
                    context.log('Image buffer size:', imageBuffer.length);

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

                    // Return image element with URL
                    return { src: blockBlobClient.url };
                } catch (imgError) {
                    context.log.error('Image extraction error:', imgError.message);
                    return { src: '' };
                }
            })
        });

        context.log('Mammoth HTML conversion complete, messages:', htmlResult.messages.length);

        // STEP 2: Clean up HTML before converting to Markdown
        let html = htmlResult.value;

        // Remove TOC-related content
        html = html
            .replace(/<p[^>]*>[\s\S]*?Contents?[\s\S]*?<\/p>/gi, '')
            .replace(/<p[^>]*>[\s\S]*?Table\s+of\s+Contents?[\s\S]*?<\/p>/gi, '')
            .replace(/<a[^>]*href="#_Toc\d+"[^>]*>.*?<\/a>/gi, '')
            .replace(/<a[^>]*href="#_Hlk\d+"[^>]*>.*?<\/a>/gi, '')
            .replace(/<a[^>]*name="_Toc\d+"[^>]*><\/a>/gi, '')
            .replace(/<a[^>]*id="_Toc\d+"[^>]*><\/a>/gi, '');

        // Remove empty paragraphs and spans
        html = html
            .replace(/<p[^>]*>\s*<\/p>/gi, '')
            .replace(/<span[^>]*>\s*<\/span>/gi, '');

        // Remove page numbers
        html = html
            .replace(/<p[^>]*>\s*\d+\s*<\/p>/gi, '')
            .replace(/<p[^>]*>\s*Page\s+\d+.*?<\/p>/gi, '');

        context.log('HTML cleanup complete');

        // STEP 3: Convert HTML to Markdown using Turndown (like MarkItDown does)
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            hr: '---',
            bulletListMarker: '-',
            codeBlockStyle: 'fenced',
            emDelimiter: '*',
            strongDelimiter: '**',
            linkStyle: 'inlined'
        });

        // Add GitHub Flavored Markdown support
        turndownService.use(gfm);

        // Custom rule for preserving list indentation
        turndownService.addRule('listIndentation', {
            filter: ['ul', 'ol'],
            replacement: function(content, node, options) {
                const parent = node.parentNode;
                if (parent && (parent.nodeName === 'LI' || parent.nodeName === 'UL' || parent.nodeName === 'OL')) {
                    return '\n' + content + '\n';
                }
                return '\n\n' + content + '\n\n';
            }
        });

        // Custom rule for better image handling
        turndownService.addRule('images', {
            filter: 'img',
            replacement: function(content, node) {
                const alt = node.getAttribute('alt') || '';
                const src = node.getAttribute('src') || '';
                const title = node.getAttribute('title') || '';

                if (!src) return '';

                const titlePart = title ? ` "${title}"` : '';
                return `![${alt}](${src}${titlePart})`;
            }
        });

        // Convert HTML to Markdown
        let markdown = turndownService.turndown(html);

        context.log('Turndown conversion complete');

        // STEP 4: Post-process Markdown for final cleanup
        markdown = markdown
            // Remove remaining TOC artifacts
            .replace(/^#{1,3}\s*Contents?\s*$/gmi, '')
            .replace(/^#{1,3}\s*Table\s+of\s+Contents?\s*$/gmi, '')
            .replace(/\[.*?\]\(#_Toc\d+\)/g, '')
            .replace(/\[.*?\]\(#_Hlk\d+\)/g, '')

            // Remove TOC dotted lines
            .replace(/^\.{3,}.*$/gm, '')
            .replace(/^_{3,}.*$/gm, '')

            // Remove page numbers
            .replace(/^\d+\s*$/gm, '')
            .replace(/^Page\s+\d+.*$/gmi, '')

            // Remove "read time" indicators
            .replace(/\d+\s*min(ute)?s?\s*read/gi, '')

            // Clean up multiple consecutive blank lines (max 2)
            .replace(/\n{3,}/g, '\n\n')

            // Remove trailing whitespace from lines
            .replace(/[ \t]+$/gm, '')

            // Normalize list spacing
            .replace(/\n\n+(-|\d+\.)\s/g, '\n\n$1 ')

            // Remove empty links
            .replace(/\[\]\([^)]*\)/g, '')

            .trim();

        // STEP 5: Extract title from the document
        const lines = markdown.split('\n');
        let extractedTitle = '';
        let contentStartIndex = 0;

        // Look for title in first 15 lines
        for (let i = 0; i < Math.min(15, lines.length); i++) {
            const trimmed = lines[i].trim();

            if (!trimmed) continue;

            // Skip TOC-like content
            if (trimmed.toLowerCase().includes('content')) continue;

            // If it's an H1 heading, use it as title
            if (trimmed.startsWith('# ')) {
                extractedTitle = trimmed.substring(2).trim();
                context.log('Title from H1:', extractedTitle);
                contentStartIndex = i + 1;
                break;
            }

            // Skip other headings
            if (trimmed.startsWith('#')) continue;

            // Check if this looks like a title
            // - Between 2 and 10 words
            // - Less than 100 characters
            // - Not a full sentence (no period at end)
            const wordCount = trimmed.split(/\s+/).length;
            if (wordCount >= 2 && wordCount <= 10 && trimmed.length < 100 && !trimmed.endsWith('.')) {
                extractedTitle = trimmed.replace(/\*\*/g, '').replace(/\*/g, '').trim();
                context.log('Title extracted from text:', extractedTitle);
                contentStartIndex = i + 1;
                break;
            }
        }

        // If title was found at the beginning, remove it from content
        if (extractedTitle && contentStartIndex > 0) {
            const contentLines = lines.slice(contentStartIndex);
            markdown = contentLines.join('\n').trim();
        }

        context.log('Conversion successful');
        context.log('Markdown length:', markdown.length);
        context.log('Title extracted:', extractedTitle || 'none');
        context.log('Images found:', (markdown.match(/!\[/g) || []).length);

        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                success: true,
                markdown: markdown,
                title: extractedTitle,
                messages: htmlResult.messages,
                imageCount: (markdown.match(/!\[/g) || []).length
            }
        };
    } catch (error) {
        context.log.error('Conversion error:', error.message);
        context.log.error('Stack:', error.stack);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                success: false,
                error: error.message
            }
        };
    }
};
