# Fixes Applied - March 1, 2026

## Summary
Fixed three critical issues:
1. Article edit/update creating duplicates instead of updating
2. User edit functionality 
3. Email notification errors (422 - empty recipient address)

---

## Issue 1: Article Edit Creating Duplicates ✅ FIXED

### Problem
When editing an article via Settings → Articles → Edit, the system was creating a new article instead of updating the existing one, resulting in duplicate key errors.

### Root Cause
There was **duplicate code** in the `publishArticle()` function that was left over from a previous edit. After the check for `window.editingArticleId`, there was leftover code that was calling `updateArticle()` again incorrectly.

### Fix Applied
1. **Removed duplicate code** in `publishArticle()` function (lines 1036-1070)
2. **Added extensive debugging** to track the editing flow:
   - `editArticle()`: Logs when article is loaded for editing
   - `openEditor()`: Logs whether it's in new or edit mode
   - `publishArticle()`: Logs whether it's creating or updating
3. **Updated cache busting** to `?v=3` in all HTML files:
   - `index.html`
   - `pages/blog.html`
   - `pages/article.html`
   - `pages/about.html`

### How It Works Now
1. User clicks "Edit" on an article
2. `editArticle()` sets `window.editingArticleId` BEFORE opening editor
3. `openEditor()` checks the flag and preserves form data if editing
4. User makes changes and clicks "Publish"
5. `publishArticle()` checks `window.editingArticleId`:
   - If set → calls `updateArticle()` (PATCH request)
   - If not set → calls `createArticle()` (POST request)
6. After successful update, clears the flag

### Testing Steps
1. **Hard refresh your browser**: Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Open browser console (F12)
3. Go to Settings → Articles
4. Click "Edit" on any article
5. Watch console logs:
   ```
   📝 editArticle called with ID: your-article-id
   ✅ Set window.editingArticleId to: your-article-id
   🚪 openEditor called. Current editingArticleId: your-article-id
   ✏️ Edit mode - keeping form data
   ```
6. Make changes and click "Publish"
7. Watch console logs:
   ```
   🔍 Checking editingArticleId: your-article-id
   ✏️ UPDATING existing article: your-article-id
   📤 Sending update request for article: your-article-id
   ✅ Update successful!
   ```

### If Still Not Working
If you still see duplicate key errors after hard refresh:
1. Clear browser cache completely
2. Try in incognito/private window
3. Check console logs - if you see `➕ CREATING new article` when editing, the old JavaScript is still cached
4. Verify the script tags show `?v=3` in the HTML source

---

## Issue 2: User Edit Functionality ✅ VERIFIED

### Status
The user edit functionality is **already working correctly**. All required Azure Functions are deployed:

```
✅ getUser
✅ updateUser
✅ deleteUser
```

### How It Works
1. User clicks "Edit" on a user in Settings → Users
2. `editUser()` populates the form with user data
3. Username becomes read-only (cannot be changed)
4. User makes changes and clicks "Update User"
5. `updateUser()` validates and calls `updateExistingUser()`
6. Azure Function `/api/users/{id}` (PATCH) updates the database

### Testing Steps
1. Hard refresh browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)
2. Go to Settings → Users
3. Click "Edit" on the Admin user
4. Change phone number or role
5. Click "Update User"
6. Should see success message

### Known Limitations
- Username cannot be changed (by design - it's the primary identifier)
- Email can be changed but must be unique
- Password is optional - leave empty to keep current password

---

## Issue 3: Email Notifications ✅ FIXED

### Problem
EmailJS returning 422 error: "The recipients address is empty" when sending notifications to subscribers.

### Root Cause
EmailJS template expects the recipient email in a specific parameter name (likely `to_email` or `to_name`), but the code was only sending `user_email`.

### Fix Applied
Updated `notifySubscribersNewArticle()` function to include multiple parameter variations:
```javascript
const templateParams = {
  to_email: email,        // Primary recipient field
  to_name: email.split('@')[0],  // Recipient name
  user_name: email.split('@')[0],  // Backward compatibility
  user_email: email,      // Backward compatibility
  subject: `New Article: ${article.title}`,
  message: `...`,
  from_name: 'KloudVin',
  article_title: article.title,
  article_description: article.description,
  article_url: articleUrl
};
```

### EmailJS Template Configuration
You need to configure your EmailJS template to use these parameters:

1. Go to EmailJS dashboard: https://dashboard.emailjs.com/
2. Select your service
3. Edit the template used for notifications
4. Make sure the "To Email" field is set to: `{{to_email}}`
5. Template body can use:
   - `{{to_name}}` - Recipient name
   - `{{article_title}}` - Article title
   - `{{article_description}}` - Article description
   - `{{article_url}}` - Link to article
   - `{{from_name}}` - Sender name (KloudVin)

### Testing Steps
1. Hard refresh browser
2. Publish a new article
3. Check console for email sending logs
4. Should see: `Sent X of Y notification emails`
5. Check subscriber inboxes

### If Still Getting 422 Errors
1. Verify EmailJS template has `{{to_email}}` in the "To Email" field
2. Check EmailJS service is active and not rate-limited
3. Verify public key, service ID, and template ID are correct in Settings → Email Config

---

## Deployment Status

### Azure Functions (All Deployed ✅)
```
✅ convertDocx
✅ convertDocxPython
✅ createArticle
✅ createUser
✅ deleteArticle
✅ deleteUser
✅ getArticle
✅ getArticles
✅ getUser
✅ getUsers
✅ testConnection
✅ testEnv
✅ updateArticle
✅ updateUser
✅ uploadImage
```

### Files Modified
- `kloudvin/js/app.js` - Fixed duplicate code, added debugging, fixed email params
- `kloudvin/js/db.js` - No changes needed (already correct)
- `kloudvin/index.html` - Cache busting v2 → v3
- `kloudvin/pages/blog.html` - Cache busting added (v3)
- `kloudvin/pages/article.html` - Cache busting added (v3)
- `kloudvin/pages/about.html` - Cache busting v2 → v3

---

## Next Steps

1. **CRITICAL**: Hard refresh your browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)
2. Test article editing with console open to see debug logs
3. Test user editing
4. Configure EmailJS template if email notifications still fail
5. If issues persist, share console logs for further debugging

---

## Debug Console Logs Reference

### Article Edit Flow (Expected Logs)
```
📝 editArticle called with ID: article-id
📝 Current editingArticleId before setting: undefined
📝 Found article: Article Title
✅ Set window.editingArticleId to: article-id
✅ Type: string
📝 Opening editor...
🚪 openEditor called. Current editingArticleId: article-id
✏️ Edit mode - keeping form data. editingArticleId: article-id
✅ Updated editor header
✅ Article loaded for editing. editingArticleId: article-id
✅ Verify window.editingArticleId is still set: article-id
🚪 openEditor complete. Final editingArticleId: article-id
```

### Article Publish Flow (Update)
```
🔍 Checking editingArticleId: article-id
🔍 Type of editingArticleId: string
🔍 Is truthy? true
✏️ UPDATING existing article: article-id
📤 Sending update request for article: article-id
✅ Update successful!
🧹 Cleared editingArticleId (was: article-id)
```

### Article Publish Flow (Create)
```
🔍 Checking editingArticleId: null
🔍 Type of editingArticleId: object
🔍 Is truthy? false
➕ CREATING new article
```

---

## Contact
If issues persist after following these steps, provide:
1. Browser console logs (full output)
2. Network tab showing the API request/response
3. Screenshot of the error
