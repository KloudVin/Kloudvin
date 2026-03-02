# Image Browser Feature

## Overview
Added an image browser/gallery feature that allows you to browse and reuse previously uploaded images when creating or editing articles.

---

## Features

### 1. Browse Uploaded Images
- View all previously uploaded images in a grid gallery
- Search/filter images by filename
- See image thumbnails with hover effects

### 2. Insert Images
- Click "Insert" to add image directly to your article content
- Automatically generates markdown: `![alt-text](image-url)`
- Works in both Write and Upload modes

### 3. Copy URLs
- Quick copy button for each image
- Copies URL to clipboard for manual use

### 4. Persistent Storage
- Images are saved to browser localStorage
- Available across sessions
- Automatically saves new uploads

---

## How to Use

### Accessing the Image Browser

1. **Open Editor**: Click "New Article" or edit an existing article
2. **Go to Upload Mode**: Click the "Upload File" tab (or stay in Write mode)
3. **Click "Browse Uploaded"**: Button next to "Upload New"

### Browsing Images

1. **View Gallery**: All uploaded images appear in a grid
2. **Search**: Type in the search box to filter by filename
3. **Hover**: Hover over any image to see actions

### Inserting Images

**Method 1: Insert Button**
1. Hover over an image
2. Click "Insert" button
3. Image markdown is automatically added to your content

**Method 2: Copy URL**
1. Hover over an image
2. Click "Copy" button
3. Manually paste the URL where needed

### Where Images Are Inserted

**Write Mode**:
- Inserted at cursor position in the content editor
- Cursor moves to end of inserted markdown

**Upload Mode**:
- Appended to the uploaded file content
- Preview updates automatically

---

## UI Components

### Image Browser Modal

**Header**:
- Title: "Browse Uploaded Images"
- Close button (X)

**Search Bar**:
- Real-time filtering
- Searches by filename
- Case-insensitive

**Gallery Grid**:
- Responsive grid layout
- Square thumbnails (aspect ratio 1:1)
- Hover effects with overlay

**Image Card**:
- Thumbnail preview
- Filename (truncated if long)
- Two action buttons:
  - **Insert**: Adds to content
  - **Copy**: Copies URL

### Buttons in Editor

**Upload New** (left button):
- Icon: Cloud upload
- Opens file picker
- Uploads new image

**Browse Uploaded** (right button):
- Icon: Multiple images
- Opens image browser modal
- Purple/violet theme

---

## Technical Details

### Storage
- Uses browser `localStorage`
- Key: `uploadedImages`
- Format: JSON array of objects
  ```json
  [
    {
      "filename": "architecture.png",
      "url": "https://cdn-url/architecture.png",
      "date": "2026-03-01T12:00:00.000Z"
    }
  ]
  ```

### Functions

**`openImageBrowser()`**
- Opens the modal
- Loads images from localStorage
- Renders gallery

**`closeImageBrowser()`**
- Closes the modal
- Clears search filter

**`loadUploadedImages()`**
- Reads from localStorage
- Merges with current session images
- Saves back to localStorage

**`renderImageGallery(images)`**
- Creates grid layout
- Renders image cards
- Handles empty state

**`filterImageGallery(searchTerm)`**
- Filters images by filename
- Re-renders gallery
- Case-insensitive search

**`insertImageFromBrowser(url, filename)`**
- Generates markdown
- Inserts into content (Write or Upload mode)
- Closes modal
- Shows success toast

**`copyImageUrlFromBrowser(url)`**
- Copies URL to clipboard
- Shows success toast

**`saveImageToStorage(filename, url)`**
- Saves image metadata to localStorage
- Prevents duplicates
- Called automatically on upload

---

## Styling

### Colors
- Primary: Violet/Purple (`--neon-violet`)
- Background: Dark card (`--bg-card`)
- Border: Subtle (`--border-subtle`)
- Hover: Violet glow

### Animations
- Modal: Scale + fade in
- Close button: Rotate on hover
- Image cards: Lift + glow on hover
- Overlay: Fade in from bottom

### Responsive
- Grid: Auto-fill, min 150px per column
- Modal: 90% width, max 900px
- Max height: 80vh with scroll

---

## User Experience

### Empty State
When no images are uploaded:
```
[Icon: Images]
No images uploaded yet
Upload images to see them here
```

### Loading State
While loading:
```
[Spinner] Loading images...
```

### Search Results
If search returns no results:
- Shows empty state
- Clear search to see all images

---

## Benefits

1. **Reusability**: Use the same image in multiple articles
2. **Efficiency**: No need to re-upload images
3. **Organization**: See all your images in one place
4. **Quick Access**: Search and filter capabilities
5. **Convenience**: One-click insert or copy

---

## Limitations

### Storage
- Uses browser localStorage (typically 5-10MB limit)
- Only stores metadata (filename, URL, date)
- Actual images are on Azure CDN

### Scope
- Per-browser storage (not synced across devices)
- Clearing browser data removes the list
- Images on CDN remain accessible via URL

### Search
- Searches filename only (not alt text or tags)
- No advanced filters (date, size, etc.)

---

## Future Enhancements (Optional)

1. **Server-Side Storage**: Store image list in database
2. **Image Tags**: Add tags/categories to images
3. **Bulk Operations**: Select multiple images
4. **Image Details**: Show upload date, size, dimensions
5. **Delete Images**: Remove from CDN and list
6. **Drag & Drop**: Drag images into content
7. **Image Editing**: Crop, resize, filters
8. **Folders**: Organize images into folders
9. **Sync**: Sync across devices via account

---

## Troubleshooting

### Images Not Showing
**Cause**: localStorage is empty or cleared

**Solution**:
1. Upload new images
2. They'll automatically appear in browser
3. Check browser console for errors

### Can't Insert Image
**Cause**: Editor not in focus or content area not found

**Solution**:
1. Make sure you're in Write or Upload mode
2. Click in the content area first
3. Try again

### Search Not Working
**Cause**: JavaScript error or modal not fully loaded

**Solution**:
1. Close and reopen the modal
2. Hard refresh browser
3. Check console for errors

### Images Disappeared
**Cause**: Browser data was cleared

**Solution**:
- Images are still on CDN (accessible via URL)
- Re-upload or manually add URLs
- Consider backing up localStorage

---

## Testing Checklist

- [ ] Open image browser modal
- [ ] See previously uploaded images
- [ ] Search for images by filename
- [ ] Insert image into Write mode
- [ ] Insert image into Upload mode
- [ ] Copy image URL
- [ ] Close modal with X button
- [ ] Close modal by clicking outside
- [ ] Upload new image and see it in browser
- [ ] Refresh page and images persist

---

## Files Modified

### JavaScript
- `kloudvin/js/app.js`
  - Added `openImageBrowser()`
  - Added `closeImageBrowser()`
  - Added `loadUploadedImages()`
  - Added `renderImageGallery()`
  - Added `filterImageGallery()`
  - Added `insertImageFromBrowser()`
  - Added `copyImageUrlFromBrowser()`
  - Added `saveImageToStorage()`
  - Updated `addUploadedImageToList()`

- `kloudvin/js/components.js`
  - Added "Browse Uploaded" button
  - Added image browser modal HTML

### CSS
- `kloudvin/css/style.css`
  - Added `.image-browser-overlay`
  - Added `.image-browser-modal`
  - Added `.image-browser-header`
  - Added `.image-browser-search`
  - Added `.image-browser-content`
  - Added `.image-gallery`
  - Added `.image-gallery-item`
  - Added `.image-gallery-item-overlay`
  - Added `.image-gallery-item-actions`
  - Added `.image-gallery-empty`

### HTML
- All HTML files: Cache busting v8

---

## Cache Busting

All files updated to `?v=8`:
- `kloudvin/index.html`
- `kloudvin/pages/blog.html`
- `kloudvin/pages/article.html`
- `kloudvin/pages/about.html`

**IMPORTANT**: Hard refresh browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)

---

## Summary

The image browser feature provides a convenient way to manage and reuse uploaded images across articles. It's fully integrated into the editor workflow and requires no additional configuration. Simply upload images as usual, and they'll automatically appear in the browser for future use!
