# Title Edit Debugging Guide

## Issue
Cannot modify the article title when editing an article.

## Changes Made

### Enhanced Debugging
Added extensive console logging to the `editArticle()` function to diagnose why the title field might not be editable.

### Explicit Editability Settings
The code now:
1. Sets `readOnly = false`
2. Sets `disabled = false`
3. Removes `readonly` attribute
4. Removes `disabled` attribute
5. Sets proper CSS styles (opacity, cursor, pointer-events)
6. Focuses the field to test editability
7. Logs all properties and computed styles

---

## Testing Steps

### Step 1: Hard Refresh Browser
Press **`Ctrl+Shift+R`** (Windows/Linux) or **`Cmd+Shift+R`** (Mac)

Cache busting updated to `?v=6`

### Step 2: Open Console
Press **F12** to open browser developer tools and go to Console tab.

### Step 3: Edit an Article
1. Go to Settings (gear icon)
2. Click "Articles" tab
3. Click "Edit" (pencil icon) on any article
4. Watch the console logs

### Step 4: Check Console Output

You should see detailed logs like:

```
📝 editArticle called with ID: your-article-id
📝 Found article: Your Article Title
✅ Set window.editingArticleId to: your-article-id
📝 Opening editor...
🚪 openEditor called. Current editingArticleId: your-article-id
✏️ Edit mode - keeping form data. editingArticleId: your-article-id
✅ Updated editor header
📝 Title element found: <input>
📝 Title element readonly before: false/true
📝 Title element disabled before: false/true
📝 Title element readonly after: false
📝 Title element disabled after: false
📝 Title element value: Your Article Title
📝 Title element attributes: {readonly: null, disabled: null, contenteditable: null}
📝 Title element computed style: {pointerEvents: "auto", userSelect: "text", cursor: "text"}
✅ Focused title field
```

### Step 5: Try Editing the Title
1. Click in the title field
2. Try typing
3. Check if you can select text
4. Check if cursor appears

---

## Diagnostic Information

### What to Look For in Console

#### 1. Element Found?
```
📝 Title element found: <input>
```
If you see `❌ Title element not found!`, the DOM isn't ready yet.

#### 2. Initial State
```
📝 Title element readonly before: true
📝 Title element disabled before: true
```
If these are `true`, something is setting them before we can fix it.

#### 3. After Fix
```
📝 Title element readonly after: false
📝 Title element disabled after: false
```
These should ALWAYS be `false`.

#### 4. Attributes
```
📝 Title element attributes: {readonly: null, disabled: null, contenteditable: null}
```
All should be `null` (not set).

#### 5. Computed Styles
```
📝 Title element computed style: {
  pointerEvents: "auto",
  userSelect: "text", 
  cursor: "text"
}
```
- `pointerEvents` should be `"auto"` (not `"none"`)
- `userSelect` should be `"text"` (not `"none"`)
- `cursor` should be `"text"` (not `"not-allowed"` or `"default"`)

---

## Common Issues and Solutions

### Issue 1: Element Not Found
**Console shows**: `❌ Title element not found!`

**Cause**: DOM not ready when trying to populate form

**Solution**: Already fixed with `setTimeout()` - if still happening, increase delay

### Issue 2: Readonly/Disabled Still True
**Console shows**: `readonly after: true` or `disabled after: true`

**Cause**: Something is re-setting these properties after we fix them

**Solution**: Check for other JavaScript that might be interfering

### Issue 3: Pointer Events None
**Console shows**: `pointerEvents: "none"`

**Cause**: CSS is blocking all mouse interactions

**Solution**: Check for CSS rules on `.form-input` or `#artTitle`

### Issue 4: User Select None
**Console shows**: `userSelect: "none"`

**Cause**: CSS is preventing text selection

**Solution**: Check for CSS rules preventing selection

### Issue 5: Can Click But Can't Type
**Symptoms**: Cursor appears but typing doesn't work

**Possible Causes**:
- Event listener preventing input
- Browser extension interfering
- Form validation blocking input

**Debug Steps**:
1. Try in incognito mode (disables extensions)
2. Check for `input` or `keydown` event listeners
3. Try different browser

---

## Manual Testing in Console

If the title still isn't editable, try these commands in the browser console:

### Test 1: Get the Element
```javascript
const titleEl = document.getElementById('artTitle');
console.log('Element:', titleEl);
console.log('ReadOnly:', titleEl.readOnly);
console.log('Disabled:', titleEl.disabled);
```

### Test 2: Force Enable
```javascript
const titleEl = document.getElementById('artTitle');
titleEl.readOnly = false;
titleEl.disabled = false;
titleEl.removeAttribute('readonly');
titleEl.removeAttribute('disabled');
console.log('Forced enable. Try typing now.');
```

### Test 3: Check Event Listeners
```javascript
const titleEl = document.getElementById('artTitle');
console.log('Event listeners:', getEventListeners(titleEl));
```

### Test 4: Set Value Programmatically
```javascript
const titleEl = document.getElementById('artTitle');
titleEl.value = 'TEST TITLE';
console.log('New value:', titleEl.value);
```

If Test 4 works but you still can't type, it's an event listener issue.

---

## Browser-Specific Issues

### Chrome/Edge
- Check if "Autofill" is interfering
- Disable extensions in incognito mode
- Check for "Content Security Policy" errors

### Firefox
- Check "Enhanced Tracking Protection"
- Try disabling "Resist Fingerprinting"

### Safari
- Check "Prevent Cross-Site Tracking"
- Try disabling "Intelligent Tracking Prevention"

---

## Next Steps

1. **Hard refresh** browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)
2. **Open console** (F12)
3. **Edit an article**
4. **Copy all console logs** and share them

The logs will tell us exactly what's preventing the title from being editable!

---

## Workaround (Temporary)

If you need to edit the title urgently while we debug:

1. Edit the article
2. Open browser console (F12)
3. Run this command:
   ```javascript
   document.getElementById('artTitle').readOnly = false;
   document.getElementById('artTitle').disabled = false;
   ```
4. Try editing the title now

---

## Files Modified
- `kloudvin/js/app.js` - Enhanced `editArticle()` with debugging
- All HTML files - Cache busting v6
