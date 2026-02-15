import logging
import azure.functions as func
import base64
import os
import tempfile
from io import BytesIO
from markitdown import MarkItDown
from azure.storage.blob import BlobServiceClient

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python DOCX conversion request received')

    try:
        # Get request body
        req_body = req.get_json()

        if not req_body or 'docx' not in req_body:
            return func.HttpResponse(
                body='{"success": false, "error": "No DOCX data provided"}',
                status_code=400,
                mimetype='application/json'
            )

        # Decode base64 DOCX data
        docx_base64 = req_body['docx']
        docx_bytes = base64.b64decode(docx_base64)

        logging.info(f'DOCX buffer size: {len(docx_bytes)}')

        # Create a BytesIO object from the bytes
        docx_stream = BytesIO(docx_bytes)

        # Initialize MarkItDown
        md = MarkItDown()

        # Convert DOCX to Markdown
        result = md.convert_stream(docx_stream, file_extension='.docx')

        markdown = result.text_content

        logging.info(f'Conversion successful, markdown length: {len(markdown)}')

        # Extract title (first non-empty line that's not too long)
        extracted_title = ''
        lines = markdown.split('\n')
        for line in lines[:10]:
            trimmed = line.strip()
            if trimmed and not trimmed.startswith('#') and len(trimmed) < 100:
                word_count = len(trimmed.split())
                if 2 <= word_count <= 10:
                    extracted_title = trimmed.replace('**', '').replace('*', '')
                    break

        logging.info(f'Title extracted: {extracted_title or "none"}')

        # Count images
        image_count = markdown.count('![')
        logging.info(f'Images found: {image_count}')

        # Return response
        return func.HttpResponse(
            body=f'{{"success": true, "markdown": {repr(markdown)}, "title": {repr(extracted_title)}, "imageCount": {image_count}}}',
            status_code=200,
            mimetype='application/json'
        )

    except Exception as e:
        logging.error(f'Conversion error: {str(e)}')
        logging.error(f'Error type: {type(e).__name__}')
        import traceback
        logging.error(f'Traceback: {traceback.format_exc()}')

        return func.HttpResponse(
            body=f'{{"success": false, "error": {repr(str(e))}}}',
            status_code=500,
            mimetype='application/json'
        )
