# Article Creation Guide

Complete step-by-step guide for creating and publishing articles on KloudVin.

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Method 1: Write Mode (Manual)](#method-1-write-mode-manual)
3. [Method 2: Upload Mode (DOCX)](#method-2-upload-mode-docx)
4. [Working with Images](#working-with-images)
5. [Markdown Formatting Guide](#markdown-formatting-guide)
6. [Publishing Your Article](#publishing-your-article)
7. [Managing Published Articles](#managing-published-articles)

---

## Quick Start

**Prerequisites:**
- Login as Administrator or Editor
- Click the "New Article" button (top right)

**Two Ways to Create Articles:**
1. **Write Mode** - Write directly in Markdown
2. **Upload Mode** - Upload a Word document (.docx)

---

## Method 1: Write Mode (Manual)

### Step 1: Open New Article Editor
1. Login to your account
2. Click "New Article" button (top right corner)
3. The article editor modal will open
4. Select the "Write" tab (default)

### Step 2: Fill in Article Details

**Title:**
- Enter your article title
- Example: "Getting Started with Kubernetes"
- Keep it clear and descriptive

**Description:**
- Write a brief summary (1-2 sentences)
- This appears in article cards on the blog page
- Example: "Learn the fundamentals of Kubernetes container orchestration"

**Category:**
- Select from dropdown: Cloud, DevOps, Kubernetes, Networking, Linux, IaC
- Or create a new category in Site Settings

### Step 3: Write Your Content

**Using the Markdown Editor:**
- Write your article content in Markdown format
- Use the toolbar buttons for formatting:
  - **B** - Bold text
  - *I* - Italic text
  - **H** - Headings (H1, H2, H3)
  - **Link** - Insert hyperlinks
  - **Code** - Code blocks
  - **List** - Bullet/numbered lists
  - **📷** - Upload images

**Live Preview:**
- Switch to "Preview" tab to see how your article will look
- Switch back to "Write" tab to continue editing

### Step 4: Add Images (Optional)

**Upload Image:**
1. Click the 📷 (camera) icon in the toolbar
2. Select an image file from your computer
3. Wait for upload to complete
4. Image URL will be automatically inserted at cursor position

**Image Markdown Format:**
```markdown
![Alt text](https://kloudvin.blob.core.windows.net/images/your-image.png)
```

**Image Best Practices:**
- Use descriptive alt text
- Optimize images before upload (recommended: < 500KB)
- Supported formats: JPG, PNG, GIF, WebP

### Step 5: Publish Article
1. Review your content in Preview mode
2. Click "Publish Article" button
3. Article is saved to database
4. Article appears on blog page immediately

---

## Method 2: Upload Mode (DOCX)

### Step 1: Prepare Your Word Document

**Document Structure:**
```
Title of Your Article
[First line becomes the title]

Your article content starts here...

## Heading 2
Content under heading...

### Heading 3
More content...
```

**Formatting in Word:**
- Use Word's built-in heading styles (Heading 1, 2, 3)
- Bold and italic formatting will be preserved
- Lists (bullets and numbers) will be converted
- Images embedded in the document will be extracted

**What Gets Removed Automatically:**
- Table of Contents sections
- "Contents" headings
- Read time indicators
- Special characters from title (underscores, asterisks)
- Extra blank lines

### Step 2: Upload Your Document

1. Open New Article editor
2. Click "Upload" tab
3. Click "Choose File" or drag & drop your .docx file
4. Click "Convert & Load" button

**What Happens:**
- Document is uploaded to Azure Function
- Converted to Markdown format
- Images are extracted and uploaded to Azure Blob Storage
- Image URLs are automatically inserted in Markdown
- Content is loaded into the editor

### Step 3: Review Auto-Filled Content

**Title:**
- Automatically extracted from first line of document
- Edit if needed

**Description:**
- Auto-generated from first paragraph
- Edit to make it more concise

**Category:**
- Select appropriate category from dropdown

**Content:**
- Review the converted Markdown
- Check image placements
- Fix any formatting issues

### Step 4: Preview and Publish

1. Click "Preview" tab to see final result
2. Make any necessary edits in "Write" tab
3. Click "Publish Article" button

---

## Working with Images

### Uploading Images

**From Write Mode:**
1. Place cursor where you want the image
2. Click 📷 icon in toolbar
3. Select image file
4. Image URL is inserted automatically

**From Upload Mode:**
1. Click "Upload Image" button
2. Select image file
3. Copy the generated URL
4. Paste in your Markdown content

**Image Upload Locations:**
- All images stored in Azure Blob Storage
- Container: `images`
- Public URL: `https://kloudvin.blob.core.windows.net/images/`

### Image Markdown Syntax

**Basic Image:**
```markdown
![Description of image](https://kloudvin.blob.core.windows.net/images/image-name.png)
```

**Image with Title (tooltip):**
```markdown
![Alt text](image-url.png "Hover text")
```

**Linked Image (clickable):**
```markdown
[![Alt text](image-url.png)](https://link-destination.com)
```

### Image Best Practices

**File Size:**
- Recommended: < 500KB per image
- Use image compression tools before upload
- Large images slow down page load

**File Names:**
- Use descriptive names: `kubernetes-architecture.png`
- Avoid spaces: use hyphens or underscores
- Use lowercase for consistency

**Alt Text:**
- Always provide descriptive alt text
- Helps with accessibility and SEO
- Example: `![Kubernetes cluster architecture diagram](url)`

**Image Formats:**
- JPG: Photos and complex images
- PNG: Screenshots, diagrams, logos
- GIF: Simple animations
- WebP: Modern format, smaller file size

---

## Markdown Formatting Guide

### Headings

```markdown
# Heading 1 (Main Title)
## Heading 2 (Section)
### Heading 3 (Subsection)
#### Heading 4
```

**Best Practice:**
- Use H1 for article title only
- Use H2 for main sections
- Use H3 for subsections

### Text Formatting

```markdown
**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~
`Inline code`
```

### Links

```markdown
[Link text](https://example.com)
[Link with title](https://example.com "Hover text")
```

### Lists

**Bullet List:**
```markdown
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3
```

**Numbered List:**
```markdown
1. First item
2. Second item
3. Third item
```

### Code Blocks

**Inline Code:**
```markdown
Use `kubectl get pods` to list pods
```

**Code Block:**
````markdown
```bash
kubectl apply -f deployment.yaml
kubectl get pods
```
````

**Supported Languages:**
- bash, shell, sh
- python, py
- javascript, js
- yaml, yml
- json
- dockerfile
- sql
- And many more...

### Blockquotes

```markdown
> This is a quote
> It can span multiple lines
```

### Horizontal Rule

```markdown
---
```

### Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

---

## Publishing Your Article

### Pre-Publish Checklist

- [ ] Title is clear and descriptive
- [ ] Description summarizes the article (1-2 sentences)
- [ ] Category is selected
- [ ] Content is complete and proofread
- [ ] Images are uploaded and displaying correctly
- [ ] Code blocks have proper syntax highlighting
- [ ] Links are working
- [ ] Preview looks good

### Publishing Steps

1. **Review in Preview Mode:**
   - Click "Preview" tab
   - Scroll through entire article
   - Check formatting, images, code blocks

2. **Make Final Edits:**
   - Switch back to "Write" tab
   - Fix any issues found in preview

3. **Publish:**
   - Click "Publish Article" button
   - Wait for success message
   - Article is now live!

### After Publishing

**View Your Article:**
- Go to Blog page
- Your article appears at the top (newest first)
- Click to view full article

**Share Your Article:**
- Article URL: `https://kloudvin.com/pages/article.html?id=ARTICLE_ID`
- Share on social media
- Send to colleagues

---

## Managing Published Articles

### Viewing All Articles

1. Login as Administrator
2. Click gear icon (⚙️) - Site Settings
3. Go to "Articles" tab
4. See all published articles with:
   - Title
   - Category (color-coded)
   - Publication date
   - Tags

### Editing an Article

**Method 1: From Site Settings**
1. Site Settings → Articles tab
2. Find your article
3. Click "Edit" button (pencil icon)
4. Article loads in editor
5. Make changes
6. Click "Publish Article" to save

**Method 2: From Blog Page**
1. Go to Blog page
2. Find your article
3. Click to open full article
4. Click "Edit" button (if logged in as admin/editor)
5. Make changes and publish

### Deleting an Article

1. Site Settings → Articles tab
2. Find article to delete
3. Click "Delete" button (trash icon)
4. Confirm deletion
5. Article is permanently removed

**Warning:** Deletion is permanent and cannot be undone!

### Filtering Articles

**By Category:**
- Blog page has category filter buttons
- Click category to show only those articles
- Click "All" to show everything

**By Date:**
- Articles are sorted by newest first
- Older articles appear at the bottom

---

## Tips and Best Practices

### Writing Tips

1. **Start with an Outline:**
   - Plan your sections before writing
   - Use headings to structure content

2. **Keep Paragraphs Short:**
   - 3-5 sentences per paragraph
   - Makes content easier to read

3. **Use Examples:**
   - Include code examples
   - Show real-world use cases
   - Add screenshots/diagrams

4. **Break Up Text:**
   - Use headings, lists, code blocks
   - Add images to illustrate points
   - Use blockquotes for important notes

### SEO Best Practices

1. **Title:**
   - Include main keyword
   - Keep under 60 characters
   - Make it compelling

2. **Description:**
   - Include keywords naturally
   - Keep under 160 characters
   - Make it enticing to click

3. **Content:**
   - Use headings with keywords
   - Write comprehensive content (1000+ words)
   - Link to related articles

### Image Optimization

1. **Before Upload:**
   - Resize to appropriate dimensions
   - Compress to reduce file size
   - Use tools like TinyPNG, ImageOptim

2. **File Naming:**
   - Use descriptive names
   - Include keywords
   - Example: `kubernetes-pod-lifecycle.png`

3. **Alt Text:**
   - Describe the image content
   - Include keywords naturally
   - Keep under 125 characters

---

## Troubleshooting

### Upload Issues

**Problem:** DOCX upload fails
- **Solution:** Check file size (max 10MB)
- **Solution:** Ensure file is .docx format (not .doc)
- **Solution:** Try saving document as new .docx file

**Problem:** Images not uploading
- **Solution:** Check file size (recommended < 5MB)
- **Solution:** Check file format (JPG, PNG, GIF, WebP)
- **Solution:** Check internet connection

### Formatting Issues

**Problem:** Code blocks not highlighting
- **Solution:** Specify language after opening backticks
- **Example:** ` ```bash ` instead of just ` ``` `

**Problem:** Images not displaying
- **Solution:** Check image URL is complete
- **Solution:** Ensure image was uploaded successfully
- **Solution:** Check image URL starts with `https://`

**Problem:** Links not working
- **Solution:** Check URL format: `[text](url)`
- **Solution:** Ensure URL includes `https://`

### Publishing Issues

**Problem:** Publish button not working
- **Solution:** Fill in all required fields (title, description, category)
- **Solution:** Check for JavaScript errors in console (F12)
- **Solution:** Refresh page and try again

**Problem:** Article not appearing on blog
- **Solution:** Refresh blog page
- **Solution:** Clear browser cache
- **Solution:** Check article was published successfully

---

## Quick Reference

### Markdown Cheat Sheet

| Element | Syntax |
|---------|--------|
| Heading 1 | `# H1` |
| Heading 2 | `## H2` |
| Heading 3 | `### H3` |
| Bold | `**bold**` |
| Italic | `*italic*` |
| Code | `` `code` `` |
| Link | `[text](url)` |
| Image | `![alt](url)` |
| List | `- item` or `1. item` |
| Quote | `> quote` |
| Code Block | ` ```language ` |
| Horizontal Rule | `---` |

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Bold | Ctrl/Cmd + B |
| Italic | Ctrl/Cmd + I |
| Save | Ctrl/Cmd + S |
| Preview | Ctrl/Cmd + P |

---

## Support

**Need Help?**
- Check this guide first
- Review example articles on the blog
- Contact site administrator

**Found a Bug?**
- Note the steps to reproduce
- Check browser console for errors (F12)
- Report to administrator with details

---

**Last Updated:** February 2026  
**Version:** 1.0
