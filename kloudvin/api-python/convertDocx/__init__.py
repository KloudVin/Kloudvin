import logging
import azure.functions as func
import base64
import json
import os
import re
from io import BytesIO
from markitdown import MarkItDown
from azure.storage.blob import BlobServiceClient

def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Convert DOCX to Markdown using Microsoft MarkItDown
    Better formatting preservation than mammoth.js
    """
    logging.info('MarkItDown DOCX conversion started')

    try:
        # Get connection string
        connection_string = os.environ.get('AZURE_STORAGE_CONNECTION_STRING')
        if not connection_string:
            raise Exception('Storage connection string not configured')

        # Parse request
        req_body = req.get_json()
        if not req_body or 'docx' not in req_body:
            return func.HttpResponse(
                json.dumps({'success': False, 'error': 'No DOCX data provided'}),
                status_code=400,
                mimetype='application/json'
            )

        # Decode base64 DOCX
        docx_bytes = base64.b64decode(req_body['docx'])
        logging.info(f'DOCX size: {len(docx_bytes)} bytes')

        # Convert using MarkItDown
        docx_stream = BytesIO(docx_bytes)
        md_converter = MarkItDown()
        result = md_converter.convert_stream(docx_stream, file_extension='.docx')

        markdown = result.text_content
        logging.info(f'Initial conversion complete: {len(markdown)} characters')

        # Clean up markdown
        markdown = cleanup_markdown(markdown, logging)

        # Extract title
        title = extract_title(markdown, logging)

        # Handle images from Word document
        # Note: MarkItDown preserves image references but doesn't extract them
        # We need to handle image uploads separately
        image_count = markdown.count('![')
        logging.info(f'Final markdown: {len(markdown)} chars, {image_count} images, title: {title}')

        # Build response
        response_data = {
            'success': True,
            'markdown': markdown,
            'title': title,
            'imageCount': image_count
        }

        return func.HttpResponse(
            json.dumps(response_data),
            status_code=200,
            mimetype='application/json',
            headers={'Access-Control-Allow-Origin': '*'}
        )

    except Exception as e:
        logging.error(f'Conversion failed: {str(e)}')
        import traceback
        logging.error(traceback.format_exc())

        return func.HttpResponse(
            json.dumps({'success': False, 'error': str(e)}),
            status_code=500,
            mimetype='application/json',
            headers={'Access-Control-Allow-Origin': '*'}
        )


def cleanup_markdown(markdown, logging):
    """Clean up the converted markdown"""

    # Remove table of contents
    markdown = re.sub(r'^#{1,3}\s*(Table\s+of\s+)?Contents\s*$', '', markdown, flags=re.MULTILINE | re.IGNORECASE)

    # Remove TOC links
    markdown = re.sub(r'\[.*?\]\(#.*?\)', '', markdown)

    # Remove TOC dotted lines
    markdown = re.sub(r'^\.{3,}.*$', '', markdown, flags=re.MULTILINE)
    markdown = re.sub(r'^_{3,}.*$', '', markdown, flags=re.MULTILINE)

    # Remove page numbers
    markdown = re.sub(r'^\d+\s*$', '', markdown, flags=re.MULTILINE)
    markdown = re.sub(r'^Page\s+\d+.*$', '', markdown, flags=re.MULTILINE | re.IGNORECASE)

    # Remove "read time" indicators
    markdown = re.sub(r'\d+\s*min(ute)?s?\s*read', '', markdown, flags=re.IGNORECASE)

    # Clean up headings - remove bold/italic formatting
    markdown = re.sub(r'^(#{1,6})\s*\*\*(.+?)\*\*\s*$', r'\1 \2', markdown, flags=re.MULTILINE)
    markdown = re.sub(r'^(#{1,6})\s*\*(.+?)\*\s*$', r'\1 \2', markdown, flags=re.MULTILINE)

    # Remove empty links
    markdown = re.sub(r'\[\]\(.*?\)', '', markdown)

    # Normalize spacing (max 2 consecutive newlines)
    markdown = re.sub(r'\n{3,}', '\n\n', markdown)

    # Remove leading/trailing whitespace
    markdown = markdown.strip()

    logging.info('Markdown cleanup complete')
    return markdown


def extract_title(markdown, logging):
    """Extract title from document"""
    lines = markdown.split('\n')

    for i, line in enumerate(lines[:15]):
        trimmed = line.strip()

        if not trimmed:
            continue

        # Skip if it's a heading
        if trimmed.startswith('#'):
            # If first heading is H1, use it as title
            if trimmed.startswith('# '):
                title = trimmed[2:].strip()
                logging.info(f'Title from H1: {title}')
                return title
            continue

        # Skip TOC-like content
        if 'content' in trimmed.lower():
            continue

        # Check if this looks like a title
        # - Between 2 and 10 words
        # - Less than 100 characters
        # - Not a full sentence (no period at end)
        word_count = len(trimmed.split())
        if 2 <= word_count <= 10 and len(trimmed) < 100 and not trimmed.endswith('.'):
            title = trimmed.replace('**', '').replace('*', '').strip()
            logging.info(f'Title extracted: {title}')
            return title

    logging.info('No title extracted')
    return ''
