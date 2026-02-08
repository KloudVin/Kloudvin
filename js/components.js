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

  // Admin Modal
  document.body.insertAdjacentHTML('beforeend', `
  <div class="admin-modal-overlay" id="adminModalOverlay">
    <div class="admin-modal">
      <button class="admin-modal-close" onclick="closeAdminLogin()"><i class="fas fa-xmark"></i></button>
      <div class="admin-modal-icon"><i class="fas fa-user-shield"></i></div>
      <h3>Admin Access</h3>
      <p>Enter your password to unlock the editor</p>
      <div class="error-msg" id="adminError">Incorrect password. Try again.</div>
      <input class="form-input" id="adminPassword" type="password" placeholder="••••••••">
      <button class="btn-glow primary" style="width:100%;justify-content:center;margin-top:.5rem" onclick="verifyAdmin()">
        <i class="fas fa-unlock"></i> Unlock
      </button>
    </div>
  </div>`);

  // Editor Panel
  document.body.insertAdjacentHTML('beforeend', `
  <div class="editor-overlay" id="editorOverlay" onclick="closeEditor()"></div>
  <div class="editor-panel" id="editorPanel">
    <div class="editor-header">
      <h2><i class="fas fa-pen-to-square"></i> New Article</h2>
      <button class="editor-close" onclick="closeEditor()"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="form-group">
      <label class="form-label">Article Title</label>
      <input class="form-input" id="artTitle" placeholder="e.g. How to Deploy EKS with Terraform">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-select" id="artCategory">
          <option value="Cloud">☁️ Cloud</option>
          <option value="DevOps">♾️ DevOps & CI/CD</option>
          <option value="Kubernetes">☸ Kubernetes</option>
          <option value="Networking">🔒 Networking & Security</option>
          <option value="Linux">🐧 Linux / Windows</option>
          <option value="IaC">📦 Infrastructure as Code</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Read Time</label>
        <select class="form-select" id="artReadTime">
          <option value="3 min read">3 min</option>
          <option value="5 min read">5 min</option>
          <option value="8 min read" selected>8 min</option>
          <option value="10 min read">10 min</option>
          <option value="15 min read">15 min</option>
          <option value="20 min read">20 min</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Short Description</label>
      <input class="form-input" id="artDesc" placeholder="A brief summary that appears on the blog card...">
    </div>
    <div class="form-group">
      <label class="form-label">Tags</label>
      <div class="tag-input-wrap" id="tagWrap">
        <input class="tag-input" id="tagInput" placeholder="Type tag & press Enter...">
      </div>
      <div class="form-hint"><i class="fas fa-circle-info"></i> Press Enter after each tag</div>
    </div>
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
      </div>
      <textarea class="form-textarea" id="artContent" placeholder="Write your article in Markdown...&#10;&#10;## Introduction&#10;Start writing here...&#10;&#10;\`\`\`bash&#10;kubectl apply -f deploy.yaml&#10;\`\`\`"></textarea>
      <div class="form-hint"><i class="fas fa-circle-info"></i> Supports Markdown: **bold**, *italic*, \`code\`, ## headings</div>
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
  const content = document.getElementById('artContent').value.trim() || 'No content yet...';
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
