# DOCX Conversion Issues - Complete Analysis

**Status:** 🔴 NEEDS IMMEDIATE FIX
**Date:** 2026-02-15

---

## 🚨 Current Problems Reported

1. **Formatting is not good** - Content structure is broken
2. **Title changed** - Document title appearing in wrong place
3. **Images are missing** - Images from Word not showing in article

---

## 🔍 Root Cause Analysis

### Problem #1: Title Handling

**What's happening:**
- Word document has "Branching Strategy for Azure DevOps" as the document title
- Mammoth includes this in the converted content
- This creates duplicate/wrong title in the article

**Why it's happening:**
- We're not extracting the title separately
- The title field in the upload form should auto-populate from document title
- But instead, the title appears in the content body

### Problem #2: Images Missing

**Two possible causes:**

**Cause A: Image Extraction Failing**
- The `convertImage` callback in mammoth might be throwing errors
- Azure Blob Storage connection might be failing
- Images embedded in Word need proper extraction

**Cause B: AZURE_STORAGE_CONNECTION_STRING Not Set**
- Function App environment variable missing
- Need to check: `process.env.AZURE_STORAGE_CONNECTION_STRING`

### Problem #3: Formatting Issues

**List formatting:**
- Nested numbered lists not rendering properly
- Indentation lost
- Bullet points inconsistent

**Bold/Underline:**
- Underlined text converting to `__` instead of `**`
- Already attempted fix but may need more work

---

## ✅ Fixes Needed

### Fix #1: Storage Connection String

**Check if set:**
```bash
az functionapp config appsettings list \
  --name kloudvin-functions \
  --resource-group Kloudvin \
  --query "[?name=='AZURE_STORAGE_CONNECTION_STRING']"
```

**If missing, set it:**
```bash
az functionapp config appsettings set \
  --name kloudvin-functions \
  --resource-group Kloudvin \
  --settings "AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=kloudvin;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net"
```

### Fix #2: Better Error Handling in convertDocx

Add comprehensive logging to see where it's failing:

```javascript
context.log('Starting DOCX conversion');
context.log('Connection string present:', !!connectionString);
context.log('Buffer size:', docxBuffer.length);

// In image conversion:
convertImage: mammoth.images.imgElement(async function(image) {
    try {
        context.log('Processing image:', image.contentType);
        const imageBuffer = await image.read();
        context.log('Image buffer size:', imageBuffer.length);

        // ... rest of code

        context.log('Image uploaded successfully:', blockBlobClient.url);
        return { src: blockBlobClient.url };
    } catch (imgError) {
        context.log.error('Image extraction FAILED:', imgError.message);
        context.log.error('Stack:', imgError.stack);
        return { src: '' };  // This causes missing images
    }
})
```

### Fix #3: Title Extraction

Extract title from first heading or document properties:

```javascript
// After mammoth conversion
const lines = markdown.split('\n');
let extractedTitle = '';
let contentLines = [];

// Check if first non-empty line is the title (not a heading)
for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;

    // If first line is plain text (not heading), treat as title
    if (!line.startsWith('#') && extractedTitle === '') {
        extractedTitle = line;
        continue;  // Skip this line in content
    }

    contentLines.push(lines[i]);
}

// Return both title and content
context.res = {
    body: {
        success: true,
        markdown: contentLines.join('\n'),
        title: extractedTitle,  // NEW: extracted title
        imageCount: ...
    }
};
```

### Fix #4: Frontend Title Handling

Update the upload handler to use extracted title:

```javascript
// In js/app.js - handleFileUpload function
if (result.title && !document.getElementById('artTitle').value) {
    document.getElementById('artTitle').value = result.title;
}
```

---

## 🧪 Testing Plan

### Test 1: Check Storage Connection

```bash
az functionapp config appsettings list \
  --name kloudvin-functions \
  --resource-group Kloudvin \
  | grep AZURE_STORAGE_CONNECTION_STRING
```

### Test 2: Upload Document with Logging

1. Open browser console (F12)
2. Upload "Branching Strategy for Azure DevOps.docx"
3. Check Function App logs for errors

### Test 3: Verify Image Extraction

1. Check if images appear in content preview
2. Verify blob storage has images: https://kloudvin.blob.core.windows.net/images/
3. Check image URLs in markdown

---

## 📋 Action Items

**Immediate:**
- [ ] Check AZURE_STORAGE_CONNECTION_STRING in Function App
- [ ] Add detailed logging to convertDocx function
- [ ] Test with actual document to see exact error
- [ ] Check Function App logs after upload

**After identifying root cause:**
- [ ] Implement title extraction
- [ ] Fix image extraction errors
- [ ] Improve list formatting
- [ ] Deploy and test

---

## 🔧 Quick Diagnostic

Run this to see all Function App settings:

```bash
az functionapp config appsettings list \
  --name kloudvin-functions \
  --resource-group Kloudvin \
  --output table
```

Check for:
- `AZURE_STORAGE_CONNECTION_STRING`
- `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

---

## 📝 Next Steps

1. **User to provide:** Screenshot or copy-paste of the badly formatted article
2. **Check:** Function App environment variables
3. **Test:** Upload document and capture Function App logs
4. **Fix:** Based on actual error messages
5. **Deploy:** Comprehensive fix

---

**WAITING FOR:**
- Exact error details
- Screenshot of bad formatting
- Article ID with issues
- Function App logs during upload
