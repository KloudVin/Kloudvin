/* ================================================================
   KloudVin — Shared Components
   Dynamically injects navbar, footer, editor, admin modal, ambient BG
   Call: loadComponents(isSubPage) — set true if page is in /pages/
   ================================================================ */

function loadComponents(isSubPage) {
  const prefix = isSubPage ? '../' : '';
  const homeLink = isSubPage ? '../index.html' : 'index.html';
  const blogLink = isSubPage ? 'blog.html' : 'pages/blog.html';
  const aboutLink = isSubPage ? 'about.html' : 'pages/about.html';
  const topicsLink = isSubPage ? '../index.html#topics' : '#topics';
  const subLink = isSubPage ? '../index.html#subscribe' : '#subscribe';

  // Ambient BG
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="ambient">
      <div class="ambient-grid"></div>
      <div class="ambient-orb orb-a"></div>
      <div class="ambient-orb orb-b"></div>
      <div class="ambient-orb orb-c"></div>
    </div>
    <div class="scanline"></div>
  `);

  // Navbar
  const navHTML = `
  <nav class="navbar" id="navbar">
    <a href="${homeLink}" class="logo-link">
      <svg class="logo-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#00f0ff"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient>
          <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#00f0ff"/><stop offset="100%" style="stop-color:#3b82f6"/></linearGradient>
        </defs>
        <path d="M38 28H12a8 8 0 01-1.5-15.87A10 10 0 0130 14a6 6 0 018 5.68V22a6 6 0 010 12v-6z" stroke="url(#cg)" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="14" y="27" font-family="Fira Code,monospace" font-size="11" font-weight="700" fill="url(#tg)">&lt;/&gt;</text>
        <line x1="20" y1="36" x2="20" y2="32" stroke="#00f0ff" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
        <line x1="24" y1="38" x2="24" y2="32" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round" opacity=".4"/>
        <line x1="28" y1="36" x2="28" y2="32" stroke="#00f0ff" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
        <circle cx="20" cy="40" r="1.2" fill="#00f0ff" opacity=".6"/><circle cx="24" cy="42" r="1.2" fill="#8b5cf6" opacity=".5"/><circle cx="28" cy="40" r="1.2" fill="#00f0ff" opacity=".6"/>
      </svg>
      <span class="logo-text">KloudVin</span>
    </a>
    <ul class="nav-menu" id="navMenu">
      <li><a href="${homeLink}" id="nav-home">Home</a></li>
      <li><a href="${topicsLink}" id="nav-topics">Topics</a></li>
      <li><a href="${blogLink}" id="nav-blog">Blog</a></li>
      <li><a href="${aboutLink}" id="nav-about">About</a></li>
      <li><a href="${subLink}" id="nav-subscribe">Subscribe</a></li>
    </ul>
    <div class="nav-right">
      <span class="admin-badge" id="adminBadge"><i class="fas fa-shield"></i> Admin</span>
      <button class="nav-cta admin-only" onclick="openEditor()"><i class="fas fa-pen-to-square"></i> New Article</button>
      <button class="nav-cta administrator-only cms-gear-btn" id="cmsGearBtn" onclick="openCMSModal()" title="Site Settings"><i class="fas fa-gear"></i></button>
      <button class="nav-cta administrator-only" id="usersNavBtn" onclick="openUsersPanel()" style="background:rgba(16,185,129,.15);color:var(--neon-emerald);border:1px solid rgba(16,185,129,.25);font-size:.72rem;padding:.4rem .9rem"><i class="fas fa-users-gear"></i> Users</button>
      <button class="hamburger" onclick="document.getElementById('navMenu').classList.toggle('active')">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>`;

  const contentEl = document.querySelector('.content');
  if (contentEl) contentEl.insertAdjacentHTML('beforebegin', navHTML);

  // Footer
  const footerHTML = `
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="logo-text">KloudVin</span>
        <span>© 2026 KloudVin. All Things IT, One Platform.</span>
      </div>
      <div class="footer-nav">
        <a href="${homeLink}">Home</a>
        <a href="${blogLink}">Blog</a>
        <a href="${aboutLink}">About</a>
        <a href="#">Privacy</a>
        <a href="#">RSS</a>
      </div>
      <div class="footer-social">
        <a href="#"><i class="fab fa-linkedin-in"></i></a>
        <a href="#"><i class="fab fa-github"></i></a>
        <a href="#"><i class="fab fa-x-twitter"></i></a>
        <a href="#"><i class="fas fa-rss"></i></a>
        <button class="admin-lock" id="adminLock" onclick="openAdminLogin()" title="Admin"><i class="fas fa-lock"></i></button>
      </div>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML('beforeend', footerHTML);

  // ======== ADMIN MODAL (Multi-View: Login, Reset Password, Users) ========
  document.body.insertAdjacentHTML('beforeend', `
  <div class="admin-modal-overlay" id="adminModalOverlay">
    <div class="admin-modal" style="width:420px">
      <button class="admin-modal-close" onclick="closeAdminLogin()"><i class="fas fa-xmark"></i></button>
      
      <!-- ===== LOGIN VIEW ===== -->
      <div id="adminLoginView" style="display:none">
        <div class="admin-modal-icon"><i class="fas fa-user-shield"></i></div>
        <h3>Login</h3>
        <p>Enter your credentials to access the editor</p>
        <div class="error-msg" id="adminError">Invalid credentials</div>
        <div class="form-group" style="margin-bottom:.6rem">
          <input class="form-input" id="adminUsername" type="text" placeholder="Username" autocomplete="username">
        </div>
        <div class="form-group" style="margin-bottom:.6rem">
          <input class="form-input" id="adminPassword" type="password" placeholder="Password" autocomplete="current-password">
        </div>
        <button class="btn-glow primary" style="width:100%;justify-content:center;margin-top:.5rem" onclick="verifyAdmin()">
          <i class="fas fa-unlock"></i> Login
        </button>
        <div class="admin-modal-links">
          <a href="#" onclick="showAdminView('reset');return false"><i class="fas fa-key"></i> Forgot Password?</a>
        </div>
      </div>

      <!-- ===== PASSWORD RESET VIEW ===== -->
      <div id="adminResetView" style="display:none">
        <div class="admin-modal-icon" style="background:rgba(245,158,11,.06);border-color:rgba(245,158,11,.15)">
          <i class="fas fa-key" style="color:var(--neon-amber)"></i>
        </div>
        <h3>Reset Password</h3>
        <p>Enter your username to receive a verification code</p>
        <div class="error-msg" id="resetError">Error</div>
        
        <!-- Step 1: Enter username -->
        <div id="resetStep1">
          <div class="form-group" style="margin-bottom:.6rem">
            <input class="form-input" id="resetUsername" type="text" placeholder="Username">
          </div>
          <button class="btn-glow primary" style="width:100%;justify-content:center;margin-top:.5rem" onclick="sendResetCode()">
            <i class="fas fa-paper-plane"></i> Send Code via Email
          </button>
        </div>
        <!-- Step 2: Enter OTP -->
        <div id="resetStep2" style="display:none">
          <div class="form-group" style="margin-bottom:.6rem">
            <input class="form-input" id="resetOTP" type="text" placeholder="Enter 6-digit code" maxlength="6">
          </div>
          <div class="form-group" style="margin-bottom:.6rem">
            <input class="form-input" id="resetNewPassword" type="password" placeholder="New Password (min 6 chars)">
          </div>
          <div class="form-group" style="margin-bottom:.6rem">
            <input class="form-input" id="resetConfirmPassword" type="password" placeholder="Confirm New Password">
          </div>
          <button class="btn-glow primary" style="width:100%;justify-content:center;margin-top:.5rem" onclick="verifyOTPAndReset()">
            <i class="fas fa-check"></i> Reset Password
          </button>
        </div>

        <div class="admin-modal-links">
          <a href="#" onclick="showAdminView('login');return false"><i class="fas fa-arrow-left"></i> Back to Login</a>
        </div>
      </div>

      <!-- ===== USER MANAGEMENT VIEW (LIST) ===== -->
      <div id="adminUsersView" style="display:none">
        <div class="admin-modal-icon" style="background:rgba(139,92,246,.06);border-color:rgba(139,92,246,.15)">
          <i class="fas fa-users-gear" style="color:var(--neon-violet)"></i>
        </div>
        <h3>User Management</h3>
        <p>Manage admin users and their permissions</p>
        <div class="form-group" style="margin-bottom:.8rem">
          <div id="usersListContainer" class="manage-list" style="max-height:350px;overflow-y:auto"></div>
        </div>
        <button class="btn-glow primary" style="width:100%;justify-content:center;margin-top:.5rem" onclick="showUserForm('create')">
          <i class="fas fa-user-plus"></i> Add New User
        </button>
        <div class="admin-modal-links">
          <a href="#" onclick="closeAdminLogin();return false"><i class="fas fa-xmark"></i> Close</a>
        </div>
      </div>

      <!-- ===== USER FORM VIEW (CREATE/EDIT) ===== -->
      <div id="adminUserFormView" style="display:none">
        <div class="admin-modal-icon" style="background:rgba(139,92,246,.06);border-color:rgba(139,92,246,.15)">
          <i class="fas fa-user-edit" style="color:var(--neon-violet)"></i>
        </div>
        <h3 id="userFormTitle">Add New User</h3>
        <p id="userFormDesc">Create a new user account</p>
        <input type="hidden" id="editingUserId" value="">
        <div class="form-group" style="margin-bottom:.5rem">
          <input class="form-input" id="newUserUsername" type="text" placeholder="Username (min 3 chars)" required>
        </div>
        <div class="form-group" style="margin-bottom:.5rem">
          <input class="form-input" id="newUserEmail" type="email" placeholder="Email address" required>
        </div>
        <div class="form-group" style="margin-bottom:.5rem">
          <input class="form-input" id="newUserPassword" type="password" placeholder="Password (min 6 chars)" required>
        </div>
        <div class="form-group" style="margin-bottom:.5rem">
          <input class="form-input" id="newUserConfirmPassword" type="password" placeholder="Confirm Password" required>
        </div>
        <div class="form-group" style="margin-bottom:.5rem">
          <input class="form-input" id="newUserPhone" type="tel" placeholder="Phone with country code (e.g., +91 9876543210)" required title="Format: +CountryCode PhoneNumber (e.g., +91 9876543210)">
          <small style="color:var(--text-muted);font-size:.75rem;margin-top:.25rem;display:block">Format: +CountryCode PhoneNumber (e.g., +91 9876543210)</small>
        </div>
        <div class="form-group" style="margin-bottom:.5rem">
          <select class="form-select" id="newUserRole" required>
            <option value="">Select Role</option>
            <option value="Administrator">Administrator</option>
            <option value="Editor" selected>Editor</option>
          </select>
        </div>
        <div style="display:flex;gap:.5rem;margin-top:.8rem">
          <button class="btn-glow" style="flex:1;justify-content:center;background:rgba(107,114,128,.1);color:var(--text-muted);border-color:rgba(107,114,128,.2)" onclick="showUsersList()">
            <i class="fas fa-arrow-left"></i> Back
          </button>
          <button class="btn-glow primary" id="userFormSubmitBtn" style="flex:2;justify-content:center" onclick="submitUserForm()">
            <i class="fas fa-plus"></i> Create User
          </button>
        </div>
      </div>
    </div>
  </div>`);

  // ======== CMS SETTINGS MODAL ========
  document.body.insertAdjacentHTML('beforeend', `
  <div class="cms-modal-overlay" id="cmsModalOverlay" onclick="closeCMSModal()"></div>
  <div class="cms-modal" id="cmsModal">
    <div class="cms-modal-header">
      <h2><i class="fas fa-sliders"></i> Site Settings</h2>
      <button class="cms-modal-close" onclick="closeCMSModal()"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="cms-modal-body" id="cmsModalBody">
      <div class="cms-tabs">
        <button class="cms-tab active" onclick="switchCMSTab('emailjs')">
          <i class="fas fa-envelope"></i> EmailJS
        </button>
        <button class="cms-tab" onclick="switchCMSTab('site')">
          <i class="fas fa-globe"></i> Site Config
        </button>
        <button class="cms-tab" onclick="switchCMSTab('categories')">
          <i class="fas fa-tags"></i> Categories
        </button>
        <button class="cms-tab" onclick="switchCMSTab('articles')">
          <i class="fas fa-newspaper"></i> Articles
        </button>
      </div>
      
      <!-- EmailJS Tab -->
      <div id="cmsTabEmailJS" class="cms-tab-content active">
        <div class="cms-form-group">
          <label>Service ID</label>
          <input type="text" id="emailjsServiceId" placeholder="service_xxxxxxx">
          <div class="cms-form-help">Get from EmailJS dashboard</div>
        </div>
        <div class="cms-form-group">
          <label>Template ID - Password Reset OTP</label>
          <input type="text" id="emailjsTemplateOTP" placeholder="template_xxxxxxx">
          <div class="cms-form-help">Template for sending OTP to registered email for password reset</div>
        </div>
        <div class="cms-form-group">
          <label>Template ID - Welcome & Notifications</label>
          <input type="text" id="emailjsTemplateWelcome" placeholder="template_xxxxxxx">
          <div class="cms-form-help">Template for welcome email on subscription and new blog notifications</div>
        </div>
        <div class="cms-form-group">
          <label>Public Key</label>
          <input type="text" id="emailjsPublicKey" placeholder="Your public key">
        </div>
        <div class="cms-btn-group">
          <button class="cms-btn cms-btn-primary" onclick="saveEmailJSConfig()">
            <i class="fas fa-save"></i> Save EmailJS Config
          </button>
          <button class="cms-btn cms-btn-secondary" onclick="testEmailJS()">
            <i class="fas fa-paper-plane"></i> Test Email
          </button>
        </div>
      </div>
      
      <!-- Site Config Tab -->
      <div id="cmsTabSite" class="cms-tab-content">
        <div class="cms-form-group">
          <label>Site Title</label>
          <input type="text" id="siteTitle" placeholder="KloudVin">
        </div>
        <div class="cms-form-group">
          <label>Site Description</label>
          <textarea id="siteDescription" placeholder="Your site description"></textarea>
        </div>
        <div class="cms-form-group">
          <label>Azure Storage Account</label>
          <input type="text" id="azureStorageAccount" value="kloudvin" readonly>
          <div class="cms-form-help">Storage account for images</div>
        </div>
        <div class="cms-form-group">
          <label>Images Container</label>
          <input type="text" id="azureImagesContainer" value="images" readonly>
        </div>
        <div class="cms-btn-group">
          <button class="cms-btn cms-btn-primary" onclick="saveSiteConfig()">
            <i class="fas fa-save"></i> Save Site Config
          </button>
        </div>
      </div>
      
      <!-- Categories Tab -->
      <div id="cmsTabCategories" class="cms-tab-content">
        <div class="cms-form-group">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <div>
              <h3 style="margin:0;font-size:1.1rem;color:var(--text-primary)">Manage Categories</h3>
              <p style="margin:.25rem 0 0;font-size:.85rem;color:var(--text-muted)">Add, edit, or delete categories for article classification</p>
              <p style="margin:.5rem 0 0;font-size:.8rem;color:var(--neon-amber)">
                <i class="fas fa-info-circle"></i> Changes are saved automatically. Categories control the dropdown in New Article form.
              </p>
            </div>
            <button class="cms-btn cms-btn-primary" onclick="openAddCategoryModal()">
              <i class="fas fa-plus"></i> Add Category
            </button>
          </div>
          <div id="categoriesListContainer" style="max-height:450px;overflow-y:auto">
            <div style="text-align:center;padding:2rem;color:var(--text-muted)">
              <i class="fas fa-spinner fa-spin" style="font-size:2rem;margin-bottom:1rem;display:block"></i>
              Loading categories...
            </div>
          </div>
        </div>
      </div>
      
      <!-- Articles Tab -->
      <div id="cmsTabArticles" class="cms-tab-content">
        <div class="cms-form-group">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
            <div>
              <h3 style="margin:0;font-size:1.1rem;color:var(--text-primary)">Manage Articles</h3>
              <p style="margin:.25rem 0 0;font-size:.85rem;color:var(--text-muted)">Edit, delete, or view all published articles</p>
            </div>
            <button class="cms-btn cms-btn-primary" onclick="refreshArticlesList()">
              <i class="fas fa-sync"></i> Refresh
            </button>
          </div>
          <div id="articlesListContainer" style="max-height:450px;overflow-y:auto">
            <div style="text-align:center;padding:2rem;color:var(--text-muted)">
              <i class="fas fa-spinner fa-spin" style="font-size:2rem;margin-bottom:1rem;display:block"></i>
              Loading articles...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`);

  // Editor Panel
  document.body.insertAdjacentHTML('beforeend', `
  <div class="editor-overlay" id="editorOverlay" onclick="closeEditor()"></div>
  <div class="editor-panel" id="editorPanel">
    <div class="editor-header">
      <h2><i class="fas fa-pen-to-square"></i> New Article</h2>
      <div style="display:flex;gap:0.5rem;align-items:center">
        <button class="editor-help-btn" onclick="window.open('ARTICLE-CREATION-GUIDE.md', '_blank')" title="Help Guide">
          <i class="fas fa-circle-question"></i> Help
        </button>
        <button class="editor-close" onclick="closeEditor()"><i class="fas fa-xmark"></i></button>
      </div>
    </div>

    <!-- MODE TOGGLE -->
    <div class="editor-mode-toggle">
      <button class="mode-btn active" id="modeWrite" onclick="switchEditorMode('write')"><i class="fas fa-keyboard"></i> Write</button>
      <button class="mode-btn" id="modeUpload" onclick="switchEditorMode('upload')"><i class="fas fa-cloud-arrow-up"></i> Upload File</button>
    </div>

    <div class="form-group">
      <label class="form-label">Article Title</label>
      <input class="form-input" id="artTitle" placeholder="e.g. How to Deploy EKS with Terraform">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Category / Topic</label>
        <select class="form-select" id="artCategory">
          <!-- Categories will be loaded dynamically -->
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Short Description</label>
      <input class="form-input" id="artDesc" placeholder="A brief summary that appears on the blog card...">
    </div>

    <!-- ========== WRITE MODE ========== -->
    <div id="writeMode">
      <div class="form-group">
        <label class="form-label">Article Content</label>
        <div class="toolbar">
          <button title="Bold" onclick="insertMd('**','**')"><i class="fas fa-bold"></i></button>
          <button title="Italic" onclick="insertMd('*','*')"><i class="fas fa-italic"></i></button>
          <button title="Code" onclick="insertMd('\`','\`')"><i class="fas fa-code"></i></button>
          <div class="toolbar-sep"></div>
          <button title="Heading" onclick="insertMd('\\n## ','')"><i class="fas fa-heading"></i></button>
          <button title="Bullet list" onclick="insertMd('\\n- ','')"><i class="fas fa-list-ul"></i></button>
          <button title="Numbered list" onclick="insertMd('\\n1. ','')"><i class="fas fa-list-ol"></i></button>
          <div class="toolbar-sep"></div>
          <button title="Code block" onclick="insertMd('\\n\`\`\`\\n','\\n\`\`\`')"><i class="fas fa-terminal"></i></button>
          <button title="Link" onclick="insertMd('[','](url)')"><i class="fas fa-link"></i></button>
          <button title="Quote" onclick="insertMd('\\n> ','')"><i class="fas fa-quote-left"></i></button>
          <div class="toolbar-sep"></div>
          <button title="Upload Image" onclick="triggerImageUpload()"><i class="fas fa-image"></i></button>
        </div>
        <input type="file" id="imageUploadInput" accept="image/*" style="display:none" onchange="handleImageUpload(event)">
        <textarea class="form-textarea" id="artContent" placeholder="Write your article in Markdown...&#10;&#10;## Introduction&#10;Start writing here...&#10;&#10;\`\`\`bash&#10;kubectl apply -f deploy.yaml&#10;\`\`\`"></textarea>
        <div class="form-hint"><i class="fas fa-circle-info"></i> Supports Markdown: **bold**, *italic*, \`code\`, ## headings</div>
      </div>
    </div>

    <!-- ========== UPLOAD MODE ========== -->
    <div id="uploadMode" style="display:none">
      <div class="form-group">
        <label class="form-label">Upload Article File</label>
        <div class="upload-zone" id="uploadZone">
          <input type="file" id="fileInput" accept=".md,.txt,.html,.htm,.doc,.docx" style="display:none">
          <div class="upload-zone-inner" id="uploadZoneInner">
            <div class="upload-icon"><i class="fas fa-cloud-arrow-up"></i></div>
            <p class="upload-title">Drag & drop your file here</p>
            <p class="upload-sub">or <span class="upload-browse" onclick="document.getElementById('fileInput').click()">browse files</span></p>
            <div class="upload-formats"><i class="fas fa-file-lines"></i> .md &nbsp; <i class="fas fa-file-lines"></i> .txt &nbsp; <i class="fas fa-code"></i> .html &nbsp; <i class="fas fa-file-word"></i> .doc/.docx</div>
          </div>
        </div>
        <!-- File preview after upload -->
        <div class="upload-file-info" id="uploadFileInfo" style="display:none">
          <div class="upload-file-icon" id="uploadFileIcon"><i class="fas fa-file-lines"></i></div>
          <div class="upload-file-details">
            <span class="upload-file-name" id="uploadFileName">document.md</span>
            <span class="upload-file-size" id="uploadFileSize">12.4 KB</span>
          </div>
          <div class="upload-file-status" id="uploadFileStatus"><i class="fas fa-check-circle"></i> Ready</div>
          <button class="upload-file-remove" onclick="removeUploadedFile()" title="Remove file"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="form-hint"><i class="fas fa-circle-info"></i> Markdown (.md) and text (.txt) files are recommended. HTML is supported. For .docx, text content will be extracted.</div>
      </div>

      <!-- Content preview from uploaded file -->
      <div class="form-group" id="uploadPreviewGroup" style="display:none">
        <label class="form-label">Content Preview <span style="color:var(--neon-cyan);font-size:.7rem;text-transform:none;letter-spacing:0">(extracted from file)</span></label>
        <div class="upload-preview" id="uploadPreview"></div>
      </div>

      <!-- Image Upload Section -->
      <div class="form-group">
        <label class="form-label">Upload Images <span style="color:var(--neon-cyan);font-size:.7rem;text-transform:none;letter-spacing:0">(for use in your article)</span></label>
        <div class="image-upload-section">
          <input type="file" id="uploadModeImageInput" accept="image/*" style="display:none" onchange="handleUploadModeImageUpload(event)">
          <button class="btn-upload-image" onclick="document.getElementById('uploadModeImageInput').click()">
            <i class="fas fa-image"></i> Upload Image
          </button>
          <div class="form-hint" style="margin-top:8px">
            <i class="fas fa-circle-info"></i> Upload images and copy the URL to use in your markdown
          </div>
        </div>
        <!-- Uploaded images list -->
        <div id="uploadedImagesList" style="margin-top:12px"></div>
      </div>
    </div>

    <div class="editor-actions">
      <button class="btn-preview-ed" onclick="previewArticle()"><i class="fas fa-eye"></i> Preview</button>
      <button class="btn-publish" onclick="publishArticle()"><i class="fas fa-paper-plane"></i> Publish</button>
    </div>
  </div>`);

  // Toast
  document.body.insertAdjacentHTML('beforeend', `
  <div class="toast" id="toast"><i class="fas fa-check-circle"></i> <span id="toastMsg"></span></div>`);
}

function previewArticle() {
  const title = document.getElementById('artTitle').value.trim() || 'Untitled';
  let content;
  if (editorMode === 'upload' && uploadedFileContent) {
    content = uploadedFileContent;
  } else {
    content = document.getElementById('artContent').value.trim() || 'No content yet...';
  }
  const w = window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Sora:wght@600;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
  <style>body{background:#060a13;color:#e2e8f0;font-family:'DM Sans',sans-serif;max-width:750px;margin:0 auto;padding:3rem 2rem;line-height:1.8}
  h1{font-family:'Sora',sans-serif;font-size:2.2rem;background:linear-gradient(135deg,#00f0ff,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:2rem}
  h2{font-family:'Sora',sans-serif;color:#00f0ff;font-size:1.4rem;margin:2rem 0 .5rem;border-bottom:1px solid rgba(0,240,255,.15);padding-bottom:.4rem}
  p{margin-bottom:1rem;color:#cbd5e1}code{background:rgba(0,240,255,.06);padding:.15rem .4rem;border-radius:4px;font-family:'Fira Code',monospace;font-size:.85rem;color:#00f0ff}
  pre{background:#0b1120;border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:1.2rem;overflow-x:auto;margin:1rem 0}pre code{background:none;padding:0;color:#94a3b8}
  blockquote{border-left:3px solid #8b5cf6;padding:.5rem 1rem;background:rgba(139,92,246,.05);border-radius:0 8px 8px 0;margin:1rem 0}
  ul,ol{margin:1rem 0;padding-left:1.5rem}li{margin-bottom:.4rem;color:#cbd5e1}hr{border:none;border-top:1px solid rgba(255,255,255,.06);margin:2rem 0}a{color:#00f0ff}</style>
  </head><body><h1>${title}</h1>${renderMarkdown(content)}</body></html>`);
  w.document.close();
}
