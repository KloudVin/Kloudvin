# Kloudvin Azure Functions

This folder contains Azure Functions for image upload and DOCX conversion.

## Functions

1. **uploadImage** - Uploads images to Azure Blob Storage
2. **convertDocx** - Converts DOCX files to Markdown and extracts images

## Setup

1. Install dependencies:
   ```bash
   cd kloudvin-api
   npm install
   ```

2. Update `local.settings.json` with your storage connection string

3. Test locally:
   ```bash
   npm start
   ```

## Deployment via VS Code

1. Install "Azure Functions" extension in VS Code
2. Open this folder in VS Code
3. Click Azure icon in left sidebar
4. Sign in to Azure
5. Click "Deploy to Function App" icon
6. Select your Function App: `kloudvin-functions`
7. Confirm deployment

## Testing

### Test uploadImage locally
```bash
curl -X POST http://localhost:7071/api/uploadImage \
  -F "image=@test-image.jpg"
```

### Test convertDocx locally
```bash
# Convert DOCX to base64 first
base64 test.docx > docx-base64.txt

# Then test
curl -X POST http://localhost:7071/api/convertDocx \
  -H "Content-Type: application/json" \
  -d '{"docx":"BASE64_STRING_HERE"}'
```

## Production URLs

After deployment, your functions will be available at:
- `https://kloudvin-functions.azurewebsites.net/api/uploadImage`
- `https://kloudvin-functions.azurewebsites.net/api/convertDocx`
