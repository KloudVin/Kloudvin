/* ================================================================
   KloudVin — Main JavaScript
   Admin System, Articles, Editor, Utilities
   ================================================================ */

// ---- CATEGORY CONFIG ----
const categoryColors = {
  Cloud:      { bg:'rgba(0,240,255,.08)', color:'#00f0ff', thumb:'linear-gradient(135deg,#0b1a30,#0f2847)' },
  DevOps:     { bg:'rgba(139,92,246,.08)', color:'#8b5cf6', thumb:'linear-gradient(135deg,#150a2e,#251545)' },
  Kubernetes: { bg:'rgba(56,189,248,.08)', color:'#38bdf8', thumb:'linear-gradient(135deg,#0a1928,#0f2d4a)' },
  Networking: { bg:'rgba(245,158,11,.08)', color:'#f59e0b', thumb:'linear-gradient(135deg,#1a1408,#2d2210)' },
  Linux:      { bg:'rgba(16,185,129,.08)', color:'#10b981', thumb:'linear-gradient(135deg,#081a14,#0f2d20)' },
  IaC:        { bg:'rgba(244,63,94,.08)',  color:'#f43f5e', thumb:'linear-gradient(135deg,#1a0a10,#2d1520)' }
};

const categoryIcons = {
  Cloud:'fa-cloud', DevOps:'fa-infinity', Kubernetes:'fa-dharmachakra',
  Networking:'fa-shield-halved', Linux:'fa-server', IaC:'fa-code-branch'
};

// ---- ARTICLES DATA ----
let articles = [];

// Load articles from database on page load
async function loadArticles() {
  articles = await getArticles();
  return articles;
}

// Initialize default articles if database is empty
async function initializeDefaultArticles() {
  const defaultArticles = [
    {
      id: 'multi-cloud-strategy',
      title: "Multi-Cloud Strategy: When and How to Go Beyond a Single Provider",
      description: "A practical guide to designing multi-cloud architectures without the complexity overhead.",
      category: "Cloud", 
      read_time: "8 min read",
      tags: ["AWS","Azure","GCP","Architecture"],
      date_published: "Feb 5, 2026",
      content: "## Introduction\n\nMulti-cloud is no longer a buzzword — it's a reality for most enterprises. But when should you actually adopt it, and how do you avoid the pitfalls?\n\n## Why Multi-Cloud?\n\nThere are several legitimate reasons to go multi-cloud:\n\n- **Avoid vendor lock-in** — reduce dependency on a single provider\n- **Best-of-breed services** — use the best service from each cloud\n- **Compliance requirements** — data residency laws may require it\n- **Disaster recovery** — true cross-cloud DR\n\n## Architecture Patterns\n\n### Pattern 1: Workload Segregation\n\nRun different workloads on different clouds based on strengths:\n\n```\nAWS  → Data/ML workloads (SageMaker, Redshift)\nAzure → Enterprise apps (.NET, Active Directory)\nGCP   → Analytics & BigQuery workloads\n```\n\n### Pattern 2: Active-Active\n\nRun the same workload across clouds for resilience. This is complex but provides true HA.\n\n## Key Considerations\n\n> The biggest mistake teams make is treating multi-cloud as running the same thing everywhere. Instead, play to each cloud's strengths.\n\n## Conclusion\n\nMulti-cloud done right is powerful. Multi-cloud done wrong is expensive chaos. Start with a clear strategy."
    },
    {
      id: 'production-kubernetes',
      title: "Production-Ready Kubernetes: Lessons from 50+ Deployments",
      description: "Battle-tested patterns, anti-patterns, and things documentation doesn't tell you.",
      category: "Kubernetes", 
      read_time: "12 min read",
      tags: ["K8s","Docker","Helm","Production"],
      date_published: "Jan 28, 2026",
      content: "## Introduction\n\nAfter deploying Kubernetes in production across 50+ projects, I've compiled the lessons that documentation doesn't teach you.\n\n## Lesson 1: Resource Limits Are Non-Negotiable\n\nAlways set resource requests AND limits:\n\n```yaml\nresources:\n  requests:\n    memory: \"256Mi\"\n    cpu: \"250m\"\n  limits:\n    memory: \"512Mi\"\n    cpu: \"500m\"\n```\n\n## Lesson 2: Namespaces Are Your Friend\n\nUse namespaces for environment separation:\n\n- `production`\n- `staging`\n- `monitoring`\n- `ingress`\n\n## Lesson 3: Don't Skip Health Checks\n\nLiveness and readiness probes save you from silent failures.\n\n> 90% of production K8s incidents I've seen could have been prevented with proper health checks and resource limits.\n\n## Conclusion\n\nKubernetes is powerful but unforgiving. Respect the fundamentals."
    },
    {
      id: 'terraform-vs-pulumi',
      title: "Terraform vs Pulumi in 2026: Which IaC Tool Should You Pick?",
      description: "An honest comparison from someone who uses both daily in enterprise environments.",
      category: "IaC", 
      read_time: "10 min read",
      tags: ["Terraform","Pulumi","IaC","DevOps"],
      date_published: "Jan 15, 2026",
      content: "## Introduction\n\nThe IaC landscape has evolved significantly. Let me share my experience using both Terraform and Pulumi in production.\n\n## Terraform: The Industry Standard\n\n**Pros:**\n- Massive community & ecosystem\n- HCL is easy to learn\n- Huge provider catalog\n- Battle-tested at scale\n\n**Cons:**\n- HCL limitations for complex logic\n- State management complexity\n- No real programming constructs\n\n```hcl\nresource \"aws_instance\" \"web\" {\n  ami           = \"ami-0c55b159cbfafe1f0\"\n  instance_type = \"t3.micro\"\n}\n```\n\n## Pulumi: The Developer-Friendly Choice\n\n**Pros:**\n- Real programming languages (Python, TypeScript, Go)\n- Better testing capabilities\n- Rich abstractions\n\n**Cons:**\n- Smaller community\n- Learning curve for ops teams\n- Fewer providers\n\n## My Recommendation\n\n> Use Terraform for platform teams and shared infrastructure. Use Pulumi when your team is developer-heavy and needs complex logic.\n\n## Conclusion\n\nBoth tools are excellent. The right choice depends on your team's DNA."
    }
  ];

  for (const article of defaultArticles) {
    try {
      await createArticle(article);
    } catch (error) {
      console.error('Error creating default article:', error);
    }
  }
}

// ---- RENDER POST CARDS ----
async function renderPosts(containerId, limit) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  
  // Show loading state
  grid.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--neon-cyan)"><i class="fas fa-spinner fa-spin"></i> Loading articles...</div>';
  
  // Load articles from database
  await loadArticles();
  
  grid.innerHTML = '';
  const list = limit ? articles.slice(0, limit) : articles;
  list.forEach((a, i) => {
    const cc = categoryColors[a.category] || categoryColors.Cloud;
    const icon = categoryIcons[a.category] || 'fa-file-alt';
    const card = document.createElement('div');
    card.className = 'pcard reveal' + (i < 9 ? ' vis' : '');
    card.onclick = () => window.location.href = `pages/article.html?id=${a.id}`;
    card.innerHTML = `
      <div class="pcard-thumb" style="background:${cc.thumb};color:${cc.color}">
        <i class="fas ${icon}"></i>
      </div>
      <div class="pcard-body">
        <div class="pcard-meta">
          <span class="pcard-cat" style="background:${cc.bg};color:${cc.color}">${a.category}</span>
          <span class="pcard-date">${a.date_published || a.date}</span>
        </div>
        <h3>${a.title}</h3>
        <p>${a.description || a.desc}</p>
        <div class="pcard-foot">
          <span class="pcard-time"><i class="far fa-clock"></i> ${a.read_time || a.readTime}</span>
          <span class="pcard-read">Read <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  initReveals();
}

// For sub-pages (relative path adjustment)
async function renderPostsSub(containerId, limit) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  
  // Show loading state
  grid.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--neon-cyan)"><i class="fas fa-spinner fa-spin"></i> Loading articles...</div>';
  
  // Load articles from database
  await loadArticles();
  
  grid.innerHTML = '';
  const list = limit ? articles.slice(0, limit) : articles;
  list.forEach((a, i) => {
    const cc = categoryColors[a.category] || categoryColors.Cloud;
    const icon = categoryIcons[a.category] || 'fa-file-alt';
    const card = document.createElement('div');
    card.className = 'pcard reveal' + (i < 9 ? ' vis' : '');
    card.onclick = () => window.location.href = `article.html?id=${a.id}`;
    card.innerHTML = `
      <div class="pcard-thumb" style="background:${cc.thumb};color:${cc.color}">
        <i class="fas ${icon}"></i>
      </div>
      <div class="pcard-body">
        <div class="pcard-meta">
          <span class="pcard-cat" style="background:${cc.bg};color:${cc.color}">${a.category}</span>
          <span class="pcard-date">${a.date_published || a.date}</span>
        </div>
        <h3>${a.title}</h3>
        <p>${a.description || a.desc}</p>
        <div class="pcard-foot">
          <span class="pcard-time"><i class="far fa-clock"></i> ${a.read_time || a.readTime}</span>
          <span class="pcard-read">Read <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  initReveals();
}

// ---- ADMIN SYSTEM ----
let isAdmin = false;
let currentUser = null;

function closeAdminLogin() {
  const overlay = document.getElementById('adminModalOverlay');
  if (overlay) overlay.classList.remove('open');
}

async function verifyAdmin() {
  const usernameInput = document.getElementById('adminUsername');
  const pwd = document.getElementById('adminPassword');
  const username = usernameInput ? usernameInput.value.trim() : 'admin';
  const password = pwd ? pwd.value : '';
  
  if (!password) {
    const err = document.getElementById('adminError');
    if (err) { err.textContent = 'Please enter a password'; err.classList.add('show'); }
    return;
  }
  
  try {
    // Fetch user from database
    console.log('Attempting to fetch user:', username);
    const user = await getUserByUsername(username);
    console.log('User fetched:', user);
    console.log('Password entered:', password);
    console.log('Password in DB:', user ? user.password_hash : 'NO USER');
    
    // Check for temporary password (from password reset)
    const tempPasswordKey = `temp_password_${user?.id}`;
    const tempPassword = localStorage.getItem(tempPasswordKey);
    
    if (user && (user.password_hash === password || tempPassword === password)) {
      // If using temp password, clear it
      if (tempPassword === password) {
        localStorage.removeItem(tempPasswordKey);
        console.log('Logged in with temporary password');
      }
      
      // Successful login
      isAdmin = user.is_admin;
      currentUser = user;
      
      // Store session
      setUserSession(user);
      
      // Show/hide admin-only buttons based on is_admin flag
      console.log('Login - User is_admin:', user.is_admin, 'Type:', typeof user.is_admin);
      
      if (user.is_admin === true || user.is_admin === 1) {
        // Administrator - add administrator-mode class
        console.log('Administrator login');
        document.body.classList.add('administrator-mode');
      } else {
        // Editor - add editor-mode class
        console.log('Editor login');
        document.body.classList.add('editor-mode');
        document.body.classList.remove('administrator-mode');
      }
      
      // Enable editor mode for all logged-in users
      document.body.classList.add('admin-mode');
      const badge = document.getElementById('adminBadge');
      if (badge) {
        badge.classList.add('show');
        // Show username and role
        badge.innerHTML = `<i class="fas fa-shield"></i> ${user.username}`;
        badge.title = `Role: ${user.role}`;
      }
      const lock = document.getElementById('adminLock');
      if (lock) { 
        lock.classList.add('unlocked'); 
        lock.innerHTML = '<i class="fas fa-lock-open"></i>'; 
        lock.title = 'Logout'; 
      }
      closeAdminLogin();
      showToast('Welcome back, ' + user.username + '! 🔓');
    } else {
      const err = document.getElementById('adminError');
      if (err) { 
        err.textContent = 'Invalid username or password'; 
        err.classList.add('show'); 
      }
      if (pwd) { pwd.value = ''; pwd.focus(); }
    }
  } catch (error) {
    console.error('Login error:', error);
    const err = document.getElementById('adminError');
    if (err) { 
      err.textContent = 'Login failed. Please try again.'; 
      err.classList.add('show'); 
    }
  }
}

function logoutAdmin() {
  isAdmin = false;
  currentUser = null;
  clearUserSession();
  
  document.body.classList.remove('admin-mode');
  document.body.classList.remove('administrator-mode');
  document.body.classList.remove('editor-mode');
  const badge = document.getElementById('adminBadge');
  if (badge) badge.classList.remove('show');
  const lock = document.getElementById('adminLock');
  if (lock) { 
    lock.classList.remove('unlocked'); 
    lock.innerHTML = '<i class="fas fa-lock"></i>'; 
    lock.title = 'Login'; 
  }
  showToast('Logged out successfully');
}

// ---- EDITOR ----
let currentTags = [];
let editorMode = 'write'; // 'write' or 'upload'
let uploadedFileContent = null; // stores parsed content from uploaded file

function switchEditorMode(mode) {
  editorMode = mode;
  const writeEl = document.getElementById('writeMode');
  const uploadEl = document.getElementById('uploadMode');
  const btnW = document.getElementById('modeWrite');
  const btnU = document.getElementById('modeUpload');
  if (!writeEl || !uploadEl) return;

  if (mode === 'write') {
    writeEl.style.display = '';
    uploadEl.style.display = 'none';
    btnW.classList.add('active'); btnU.classList.remove('active');
    
    // If switching from upload mode with content, transfer it to the write editor
    if (uploadedFileContent) {
      const contentEl = document.getElementById('artContent');
      if (contentEl && !contentEl.value.trim()) {
        contentEl.value = uploadedFileContent;
        showToast('Content loaded into editor. You can now edit it! ✏️');
      }
    }
  } else {
    writeEl.style.display = 'none';
    uploadEl.style.display = '';
    btnU.classList.add('active'); btnW.classList.remove('active');
    initUploadZone();
  }
}

function initUploadZone() {
  const zone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  if (!zone || zone._initialized) return;
  zone._initialized = true;

  // Click to browse
  zone.addEventListener('click', function(e) {
    if (e.target.closest('.upload-browse') || e.target === zone || e.target.closest('.upload-zone-inner')) {
      fileInput.click();
    }
  });

  // File input change
  fileInput.addEventListener('change', function() {
    if (this.files.length) handleFileUpload(this.files[0]);
  });

  // Drag & Drop
  zone.addEventListener('dragover', function(e) { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', function() { zone.classList.remove('dragover'); });
  zone.addEventListener('drop', function(e) {
    e.preventDefault(); zone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files[0]);
  });
}

function handleFileUpload(file) {
  const allowedExts = ['.md','.txt','.html','.htm','.doc','.docx'];
  const ext = '.' + file.name.split('.').pop().toLowerCase();

  if (!allowedExts.includes(ext)) {
    showToast('Unsupported file type. Use .md, .txt, .html, or .docx', true);
    return;
  }

  // Show file info card
  const zone = document.getElementById('uploadZone');
  const info = document.getElementById('uploadFileInfo');
  const nameEl = document.getElementById('uploadFileName');
  const sizeEl = document.getElementById('uploadFileSize');
  const statusEl = document.getElementById('uploadFileStatus');
  const iconEl = document.getElementById('uploadFileIcon');

  zone.style.display = 'none';
  info.style.display = 'flex';
  nameEl.textContent = file.name;
  sizeEl.textContent = formatFileSize(file.size);
  statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  statusEl.className = 'upload-file-status processing';

  // Set icon based on type
  const iconMap = { '.md':'fa-file-lines', '.txt':'fa-file-lines', '.html':'fa-code', '.htm':'fa-code', '.doc':'fa-file-word', '.docx':'fa-file-word' };
  iconEl.innerHTML = '<i class="fas ' + (iconMap[ext] || 'fa-file') + '"></i>';

  // Read file content
  if (ext === '.docx' || ext === '.doc') {
    readDocxFile(file, statusEl);
  } else {
    readTextFile(file, ext, statusEl);
  }
}

function readTextFile(file, ext, statusEl) {
  const reader = new FileReader();
  reader.onload = function(e) {
    let content = e.target.result;

    // If HTML, extract body text and convert to basic markdown
    if (ext === '.html' || ext === '.htm') {
      content = htmlToMarkdown(content);
    }

    uploadedFileContent = content;
    statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Ready';
    statusEl.className = 'upload-file-status';

    // Check for local image references in markdown
    if (ext === '.md') {
      detectLocalImages(content);
    }

    // Show preview
    showUploadPreview(content);

    // Auto-fill title if empty
    autoFillFromContent(content);

    showToast('File loaded successfully! ✅');
  };
  reader.onerror = function() {
    statusEl.innerHTML = '<i class="fas fa-times-circle"></i> Error';
    statusEl.className = 'upload-file-status error';
    showToast('Failed to read file', true);
  };
  reader.readAsText(file);
}

function readDocxFile(file, statusEl) {
  // Use Azure Function to convert DOCX to Markdown with image extraction
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const arrayBuffer = e.target.result;
      
      // Convert to base64
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      console.log('DOCX file size:', file.size, 'bytes');
      console.log('Base64 size:', base64.length, 'characters');
      
      // Call Azure Function
      statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting DOCX...';
      statusEl.className = 'upload-file-status processing';
      
      const response = await fetch('https://kloudvin-functions-geftgkb3dehxhag7.centralus-01.azurewebsites.net/api/convertDocx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docx: base64 })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error('Conversion failed: ' + response.status);
      }
      
      const result = await response.json();
      console.log('Conversion result:', result);
      console.log('Markdown content:', result.markdown ? result.markdown.substring(0, 200) + '...' : 'UNDEFINED');
      console.log('Success flag:', result.success);
      
      if (result.success && result.markdown) {
        uploadedFileContent = result.markdown;
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Ready';
        statusEl.className = 'upload-file-status';
        showUploadPreview(result.markdown);
        autoFillFromContent(result.markdown);
        showToast('DOCX converted with images extracted! ✅');
      } else {
        throw new Error(result.error || 'Conversion failed - no markdown returned');
      }
    } catch(err) {
      console.error('DOCX conversion error:', err);
      console.error('Error details:', err.message);
      // Fallback to basic extraction
      try {
        const arrayBuffer = e.target.result;
        const text = await extractDocxText(arrayBuffer);
        uploadedFileContent = text;
        statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Basic';
        statusEl.className = 'upload-file-status processing';
        showUploadPreview(text);
        autoFillFromContent(text);
        showToast('DOCX text extracted (images not supported in fallback mode)', true);
      } catch(fallbackErr) {
        statusEl.innerHTML = '<i class="fas fa-times-circle"></i> Error';
        statusEl.className = 'upload-file-status error';
        showToast('Failed to read DOCX file', true);
      }
    }
  };
  reader.readAsArrayBuffer(file);
}

// Basic DOCX text extraction using JSZip-like manual approach
async function extractDocxText(arrayBuffer) {
  // DOCX is a ZIP containing XML files. We'll extract document.xml text.
  const bytes = new Uint8Array(arrayBuffer);

  // Find the PK zip entries and locate word/document.xml
  const text = await new Promise(function(resolve, reject) {
    try {
      // Use the simpler approach: parse XML directly from the blob
      const blob = new Blob([arrayBuffer], { type: 'application/zip' });

      // Try using the browser's built-in decompression if available
      if (typeof DecompressionStream !== 'undefined') {
        // Modern approach - but DOCX needs zip extraction, not just decompression
      }

      // Fallback: basic text extraction by scanning for readable content between XML tags
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const rawText = decoder.decode(bytes);

      // Extract text from w:t tags (Word's text tags)
      const matches = rawText.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (matches && matches.length > 0) {
        let extracted = '';
        let prevWasSpace = false;
        matches.forEach(function(m) {
          const inner = m.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
          if (inner === ' ' && prevWasSpace) return;
          extracted += inner;
          prevWasSpace = (inner === ' ');
        });

        // Try to add paragraph breaks where XML shows paragraph markers
        const withParagraphs = rawText.replace(/<w:p [^>]*\/>/g, '\n').replace(/<w:p[ >]/g, '\n<w:p ');
        const pMatches = withParagraphs.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
        if (pMatches) {
          let result = '';
          let pos = 0;
          const pBreaks = [];
          let searchText = withParagraphs;
          let pIdx = searchText.indexOf('\n<w:p ');
          while (pIdx !== -1) {
            pBreaks.push(pIdx);
            pIdx = searchText.indexOf('\n<w:p ', pIdx + 1);
          }

          // Simple: just use the extracted text with line breaks from paragraphs
          resolve(extracted.replace(/(.{80,}?[\.\!\?])\s/g, '$1\n\n'));
          return;
        }

        resolve(extracted);
      } else {
        reject(new Error('No text content found in DOCX'));
      }
    } catch(e) {
      reject(e);
    }
  });

  return text;
}

function htmlToMarkdown(html) {
  // Extract body content if present
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : html;

  // Strip style/script tags
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Convert common HTML to Markdown
  content = content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  content = content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  content = content.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  content = content.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  content = content.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  content = content.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  content = content.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  content = content.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  content = content.replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```\n');
  content = content.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  content = content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  content = content.replace(/<br\s*\/?>/gi, '\n');
  content = content.replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n');
  content = content.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n');

  // Strip remaining HTML tags
  content = content.replace(/<[^>]+>/g, '');

  // Clean up whitespace
  content = content.replace(/\n{3,}/g, '\n\n').trim();

  return content;
}

function detectLocalImages(content) {
  // Detect local image references in markdown: ![alt](./image.png) or ![alt](image.png)
  const localImageRegex = /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g;
  const matches = [];
  let match;
  
  while ((match = localImageRegex.exec(content)) !== null) {
    matches.push({
      fullMatch: match[0],
      alt: match[1],
      path: match[2]
    });
  }
  
  if (matches.length > 0) {
    console.log('📷 Local images detected in markdown:');
    matches.forEach(m => console.log(`  - ${m.path}`));
    console.log('\n📝 To use images in your article:');
    console.log('1. Click the 📷 button in Write mode to upload each image');
    console.log('2. Copy the returned Azure Blob URL');
    console.log('3. Replace local paths with: https://kloudvin.blob.core.windows.net/images/[filename]');
    
    showToast(
      `⚠️ Found ${matches.length} local image(s). Check console for details and upload instructions.`,
      false,
      5000
    );
  }
}

function showUploadPreview(content) {
  const group = document.getElementById('uploadPreviewGroup');
  const preview = document.getElementById('uploadPreview');
  if (!group || !preview) return;
  group.style.display = '';
  // Show first 2000 chars with ellipsis
  const truncated = content.length > 2000 ? content.substring(0, 2000) + '\n\n... (' + content.length + ' total characters)' : content;
  preview.textContent = truncated;
}

function autoFillFromContent(content) {
  // Check if content is valid
  if (!content || typeof content !== 'string') {
    console.warn('autoFillFromContent: invalid content', content);
    return;
  }
  
  // If title is empty, try extracting document title
  const titleInput = document.getElementById('artTitle');
  if (titleInput && titleInput.value !== undefined && titleInput.value !== null && !titleInput.value.trim()) {
    const lines = content.split('\n');
    let extractedTitle = '';
    let titleLineIndex = -1;
    
    // Look for the first non-empty line that's NOT a heading (document title)
    for (let i = 0; i < lines.length && i < 10; i++) {
      const line = lines[i].trim();
      if (line.length > 5 && !line.startsWith('#') && line.length < 120) {
        extractedTitle = line;
        titleLineIndex = i;
        break;
      }
    }
    
    // If no document title found, fall back to first heading
    if (!extractedTitle) {
      const h1Match = content.match(/^#\s+(.+)$/m);
      const h2Match = content.match(/^##\s+(.+)$/m);
      if (h1Match && h1Match[1]) extractedTitle = h1Match[1].trim();
      else if (h2Match && h2Match[1]) extractedTitle = h2Match[1].trim();
    }
    
    // Clean up the title - remove markdown formatting
    if (extractedTitle) {
      extractedTitle = extractedTitle
        .replace(/^__(.+?)__$/, '$1')  // Remove surrounding underscores
        .replace(/^\*\*(.+?)\*\*$/, '$1')  // Remove surrounding asterisks
        .replace(/__/g, '')  // Remove any remaining underscores
        .replace(/\*\*/g, '')  // Remove any remaining asterisks
        .replace(/_/g, '')  // Remove single underscores
        .replace(/\*/g, '')  // Remove single asterisks
        .trim();
      titleInput.value = extractedTitle;
      
      // Remove the title line from content if found
      if (titleLineIndex >= 0) {
        lines.splice(titleLineIndex, 1);
        uploadedFileContent = lines.join('\n').trim();
      }
    }
  }

  // If description is empty, try extracting first paragraph
  const descInput = document.getElementById('artDesc');
  if (descInput && descInput.value !== undefined && descInput.value !== null && !descInput.value.trim()) {
    const lines = content.split('\n').filter(function(l) {
      const t = l.trim();
      // Skip headings, code blocks, quotes, lists, and "Contents"
      return t.length > 20 && 
             !t.startsWith('#') && 
             !t.startsWith('```') && 
             !t.startsWith('>') && 
             !t.startsWith('-') &&
             !t.match(/^Contents$/i);
    });
    if (lines.length && lines[0]) {
      let firstPara = lines[0].trim();
      // Clean up markdown formatting from description
      firstPara = firstPara
        .replace(/__/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/_/g, '');
      descInput.value = firstPara.length > 160 ? firstPara.substring(0, 157) + '...' : firstPara;
    }
  }
}

function removeUploadedFile() {
  uploadedFileContent = null;
  const zone = document.getElementById('uploadZone');
  const info = document.getElementById('uploadFileInfo');
  const previewGroup = document.getElementById('uploadPreviewGroup');
  const fileInput = document.getElementById('fileInput');
  if (zone) zone.style.display = '';
  if (info) info.style.display = 'none';
  if (previewGroup) previewGroup.style.display = 'none';
  if (fileInput) fileInput.value = '';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function openEditor() {
  console.log('🚪 openEditor called. Current editingArticleId:', window.editingArticleId);
  
  const panel = document.getElementById('editorPanel');
  const overlay = document.getElementById('editorOverlay');
  if (panel) panel.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  
  // Only clear editing flag and reset form if NOT editing an existing article
  if (!window.editingArticleId) {
    console.log('🆕 New article mode - clearing form');
    
    // Reset header for new article
    const editorHeader = document.querySelector('.editor-header h2');
    if (editorHeader) {
      editorHeader.innerHTML = '<i class="fas fa-pen-to-square"></i> New Article';
    }
    
    // Reset to write mode and clear upload state for new articles
    switchEditorMode('write');
    removeUploadedFile();
    
    // Clear form fields for new article
    const titleEl = document.getElementById('artTitle');
    const descEl = document.getElementById('artDesc');
    const contentEl = document.getElementById('artContent');
    if (titleEl) titleEl.value = '';
    if (descEl) descEl.value = '';
    if (contentEl) contentEl.value = '';
    currentTags = [];
    renderTags();
  } else {
    console.log('✏️ Edit mode - keeping form data. editingArticleId:', window.editingArticleId);
  }
  
  // Populate category dropdown
  updateCategoryDropdowns();
  
  console.log('🚪 openEditor complete. Final editingArticleId:', window.editingArticleId);
}

function closeEditor() {
  const panel = document.getElementById('editorPanel');
  const overlay = document.getElementById('editorOverlay');
  if (panel) panel.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function initTagInput() {
  const input = document.getElementById('tagInput');
  if (!input) return;
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && this.value.trim()) {
      e.preventDefault();
      addTag(this.value.trim());
      this.value = '';
    }
  });
}

function addTag(text) {
  if (currentTags.includes(text)) return;
  currentTags.push(text);
  renderTags();
}

function removeTag(text) {
  currentTags = currentTags.filter(t => t !== text);
  renderTags();
}

function renderTags() {
  const wrap = document.getElementById('tagWrap');
  const input = document.getElementById('tagInput');
  if (!wrap || !input) return;
  wrap.querySelectorAll('.tag-pill').forEach(p => p.remove());
  currentTags.forEach(t => {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.innerHTML = `${t} <button onclick="removeTag('${t}')">&times;</button>`;
    wrap.insertBefore(pill, input);
  });
}

function insertMd(before, after) {
  const ta = document.getElementById('artContent');
  if (!ta) return;
  const start = ta.selectionStart, end = ta.selectionEnd;
  const selected = ta.value.substring(start, end);
  const replacement = before + (selected || 'text') + after;
  ta.value = ta.value.substring(0, start) + replacement + ta.value.substring(end);
  ta.focus();
  ta.setSelectionRange(start + before.length, start + before.length + (selected || 'text').length);
}

// ---- IMAGE UPLOAD ----
function triggerImageUpload() {
  const input = document.getElementById('imageUploadInput');
  if (input) input.click();
}

async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file', true);
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image size must be less than 5MB', true);
    return;
  }
  
  try {
    showToast('Uploading image...');
    
    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    
    // Upload to Azure Function
    const response = await fetch('https://kloudvin-functions-geftgkb3dehxhag7.centralus-01.azurewebsites.net/api/uploadImage', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const result = await response.json();
    
    if (result.success) {
      // Insert markdown image syntax at cursor position
      const imageMarkdown = `\n![${file.name}](${result.url})\n`;
      const ta = document.getElementById('artContent');
      if (ta) {
        const start = ta.selectionStart;
        ta.value = ta.value.substring(0, start) + imageMarkdown + ta.value.substring(start);
        ta.focus();
        ta.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
      }
      showToast('Image uploaded successfully! ✅');
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    showToast('Failed to upload image. Please try again.', true);
  } finally {
    // Reset file input
    event.target.value = '';
  }
}

// ---- IMAGE UPLOAD IN UPLOAD MODE ----
async function handleUploadModeImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file', true);
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image size must be less than 5MB', true);
    return;
  }
  
  try {
    showToast('Uploading image...');
    
    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    
    // Upload to Azure Function
    const response = await fetch('https://kloudvin-functions-geftgkb3dehxhag7.centralus-01.azurewebsites.net/api/uploadImage', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const result = await response.json();
    
    if (result.success) {
      // Add to uploaded images list
      addUploadedImageToList(file.name, result.url);
      showToast('Image uploaded successfully! ✅');
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    showToast('Failed to upload image. Please try again.', true);
  } finally {
    // Reset file input
    event.target.value = '';
  }
}

function addUploadedImageToList(filename, url) {
  const listContainer = document.getElementById('uploadedImagesList');
  if (!listContainer) return;
  
  const item = document.createElement('div');
  item.className = 'uploaded-image-item';
  item.innerHTML = `
    <img src="${url}" alt="${filename}" class="uploaded-image-thumb">
    <div class="uploaded-image-info">
      <div class="uploaded-image-name">${filename}</div>
      <div class="uploaded-image-url">${url}</div>
    </div>
    <div class="uploaded-image-actions">
      <button class="btn-copy-url" onclick="copyImageUrl('${url}')">
        <i class="fas fa-copy"></i> Copy URL
      </button>
    </div>
  `;
  listContainer.appendChild(item);
}

function copyImageUrl(url) {
  navigator.clipboard.writeText(url).then(() => {
    showToast('URL copied to clipboard! ✅');
  }).catch(() => {
    showToast('Failed to copy URL', true);
  });
}

async function publishArticle() {
  const titleEl = document.getElementById('artTitle');
  const categoryEl = document.getElementById('artCategory');
  const descEl = document.getElementById('artDesc');
  const contentEl = document.getElementById('artContent');

  if (!titleEl || !categoryEl || !descEl) {
    showToast('Form elements not found. Please refresh the page.', true);
    return;
  }

  const title = (titleEl.value || '').trim();
  const category = categoryEl.value || '';
  const desc = (descEl.value || '').trim();

  // Get content from either write mode or upload mode
  let content;
  if (editorMode === 'upload') {
    if (!uploadedFileContent) { showToast('Please upload a file first!', true); return; }
    content = uploadedFileContent;
  } else {
    if (!contentEl) {
      showToast('Content editor not found. Please refresh the page.', true);
      return;
    }
    content = (contentEl.value || '').trim();
  }

  if (!title) { showToast('Please enter an article title!', true); return; }
  if (!desc) { showToast('Please enter a short description!', true); return; }
  if (!content) { showToast('Please add article content — write or upload a file!', true); return; }

  // Check if we're editing an existing article
  console.log('🔍 Checking editingArticleId:', window.editingArticleId);
  console.log('🔍 Type of editingArticleId:', typeof window.editingArticleId);
  console.log('🔍 Is truthy?', !!window.editingArticleId);
  
  if (window.editingArticleId) {
    console.log('✏️ UPDATING existing article:', window.editingArticleId);
    try {
      const updates = {
        title,
        description: desc,
        category,
        content,
        tags: currentTags.join(',')
      };
      
      console.log('📤 Sending update request for article:', window.editingArticleId);
      await updateArticle(window.editingArticleId, updates);
      console.log('✅ Update successful!');
      
      // Reset form
      document.getElementById('artTitle').value = '';
      document.getElementById('artDesc').value = '';
      document.getElementById('artContent').value = '';
      currentTags = [];
      renderTags();
      removeUploadedFile();
      switchEditorMode('write');
      closeEditor();
      
      // Clear editing flag
      const oldId = window.editingArticleId;
      window.editingArticleId = null;
      console.log('🧹 Cleared editingArticleId (was:', oldId, ')');
      
      showToast('Article updated successfully! ✅');
      
      // Refresh article list
      refreshArticlesList();
      
      // Re-render posts
      const postsGrid = document.getElementById('postsGrid');
      if (postsGrid) {
        if (window.location.pathname.includes('pages/')) await renderPostsSub('postsGrid');
        else await renderPosts('postsGrid');
      }
      
      return;
    } catch (error) {
      console.error('❌ Error updating article:', error);
      showToast('Failed to update article: ' + (error.message || 'Unknown error'), true);
      return;
    }
  }

  console.log('➕ CREATING new article');

  const now = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  
  // Generate ID from title
  let baseId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  
  // If ID is empty or too short, use a timestamp
  if (!baseId || baseId.length < 3) {
    baseId = 'article-' + Date.now();
  }
  
  let id = baseId;
  let attempt = 0;
  const MAX_ATTEMPTS = 5;

  // Build the article object (id will be updated on each retry)
  const article = {
    title,
    description: desc,
    category,
    date_published: dateStr,
    content,
    author_id: currentUser ? currentUser.id : null
  };

  try {
    let savedArticle = null;

    // Retry loop: if the slug already exists, append -2, -3, … up to MAX_ATTEMPTS
    while (attempt < MAX_ATTEMPTS) {
      id = attempt === 0 ? baseId : `${baseId}-${attempt + 1}`;
      article.id = id;

      try {
        savedArticle = await createArticle(article);
        break; // success — exit retry loop
      } catch (err) {
        if (err.code === 'DUPLICATE_ID' && attempt < MAX_ATTEMPTS - 1) {
          attempt++;
          continue; // try next suffix
        }
        throw err; // non-duplicate error or exhausted retries — bubble up
      }
    }

    // Add to local array for immediate display
    articles.unshift({ ...article, ...(savedArticle || {}) });

    // Reset form
    document.getElementById('artTitle').value = '';
    document.getElementById('artDesc').value = '';
    document.getElementById('artContent').value = '';
    removeUploadedFile();
    switchEditorMode('write');
    closeEditor();
    showToast('Article published to "' + category + '" topic! 🎉');

    // Send notification emails to subscribers
    notifySubscribersNewArticle(article).then(result => {
      if (result.success && result.count > 0) {
        console.log(`Notification emails sent to ${result.count} subscribers`);
        showToast(`📧 Notified ${result.count} subscriber${result.count > 1 ? 's' : ''}!`);
      }
    }).catch(error => {
      console.error('Error sending notification emails:', error);
    });

    // Re-render
    const postsGrid = document.getElementById('postsGrid');
    if (postsGrid) {
      if (window.location.pathname.includes('pages/')) await renderPostsSub('postsGrid');
      else await renderPosts('postsGrid');
    }
  } catch (error) {
    console.error('Error publishing article:', error);
    if (error.code === 'DUPLICATE_ID') {
      showToast('Could not generate a unique article ID after several attempts. Please change the title slightly and try again.', true);
    } else {
      showToast('Failed to publish article: ' + (error.message || 'Unknown error'), true);
    }
  }
}

// ---- MARKDOWN RENDERER ----
function renderMarkdown(md) {
  if (!md) return '<p>No content yet.</p>';
  let html = md
    // Code blocks (must be first)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headings
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold - handle both ** and __
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic - handle both * and _
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    .replace(/^___$/gm, '<hr>')
    .replace(/^\*\*\*$/gm, '<hr>')
    // Lists
    .replace(/^- (.+)$/gm, '<ul><li>$1</li></ul>')
    .replace(/^\* (.+)$/gm, '<ul><li>$1</li></ul>')
    .replace(/^\d+\. (.+)$/gm, '<ol><li>$1</li></ol>')
    // Images (must be before links)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;height:auto;margin:1rem 0">')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Merge consecutive ul/ol
  html = html.replace(/<\/ul>\s*<ul>/g, '').replace(/<\/ol>\s*<ol>/g, '');
  
  // Merge consecutive blockquotes
  html = html.replace(/<\/blockquote>\s*<blockquote>/g, '');
  
  // Wrap loose lines in <p>
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.match(/^<(h[1-6]|pre|code|blockquote|li|hr|ul|ol|img|strong|em|a|div|section|table)/))
      return `<p>${trimmed}</p>`;
    return line;
  }).join('\n');
  
  // Clean empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  // Clean up extra whitespace
  html = html.replace(/\n{3,}/g, '\n\n');
  
  return html;
}

// ---- TOAST ----
function showToast(msg, isError, duration) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.style.borderColor = isError ? 'var(--neon-rose)' : 'var(--neon-emerald)';
  toast.style.color = isError ? 'var(--neon-rose)' : 'var(--neon-emerald)';
  toast.querySelector('i').className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration || 3000);
}

// ---- NAVBAR SCROLL ----
function initNavScroll() {
  const nav = document.getElementById('navbar');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('compact', window.scrollY > 60));
}

// ---- REVEAL ON SCROLL ----
let revealObserver;
function initReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('vis'), i * 80);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
  }
  document.querySelectorAll('.reveal:not(.vis)').forEach(el => revealObserver.observe(el));
}

// ---- SMOOTH SCROLL ----
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const t = document.querySelector(href);
      if (t) { t.scrollIntoView({ behavior:'smooth' }); }
      const menu = document.getElementById('navMenu');
      if (menu) menu.classList.remove('active');
    });
  });
}

// ---- HAMBURGER ----
function initHamburger() {
  const btn = document.querySelector('.hamburger');
  if (btn) btn.addEventListener('click', () => {
    document.getElementById('navMenu').classList.toggle('active');
  });
}

// ---- ADMIN MODAL OVERLAY CLICK ----
function initAdminModal() {
  const overlay = document.getElementById('adminModalOverlay');
  if (overlay) overlay.addEventListener('click', function(e) { if (e.target === this) closeAdminLogin(); });
  const pwd = document.getElementById('adminPassword');
  if (pwd) pwd.addEventListener('keydown', function(e) { if (e.key === 'Enter') verifyAdmin(); });
}

// ---- INIT ALL ----
function initApp() {
  initNavScroll();
  initReveals();
  initSmoothScroll();
  initHamburger();
  initTagInput();
  initAdminModal();
  checkUserSession(); // Check if user is already logged in
  renderTopicCards(); // Render dynamic topic cards on homepage
  renderBlogFilters(); // Render dynamic filter buttons on blog page
}

document.addEventListener('DOMContentLoaded', initApp);


// ================================================================
// MULTI-VIEW ADMIN MODAL SYSTEM
// ================================================================

let currentAdminView = 'login'; // 'login', 'reset', 'users'
let resetUserData = null; // Stores user data during password reset

function showAdminView(view) {
  currentAdminView = view;
  const loginView = document.getElementById('adminLoginView');
  const resetView = document.getElementById('adminResetView');
  const usersView = document.getElementById('adminUsersView');
  const userFormView = document.getElementById('adminUserFormView');
  
  if (loginView) loginView.style.display = 'none';
  if (resetView) resetView.style.display = 'none';
  if (usersView) usersView.style.display = 'none';
  if (userFormView) userFormView.style.display = 'none';
  
  if (view === 'login' && loginView) {
    loginView.style.display = '';
    const uInput = document.getElementById('adminUsername');
    if (uInput) { uInput.value = ''; setTimeout(() => uInput.focus(), 300); }
    const pInput = document.getElementById('adminPassword');
    if (pInput) pInput.value = '';
    const err = document.getElementById('adminError');
    if (err) err.classList.remove('show');
  } else if (view === 'reset' && resetView) {
    resetView.style.display = '';
    // Reset to step 1
    document.getElementById('resetStep1').style.display = '';
    document.getElementById('resetStep2').style.display = 'none';
    const emailInput = document.getElementById('resetEmail');
    if (emailInput) { emailInput.value = ''; setTimeout(() => emailInput.focus(), 300); }
    const phoneInput = document.getElementById('resetPhone');
    if (phoneInput) phoneInput.value = '';
    const err = document.getElementById('resetError');
    if (err) err.classList.remove('show');
  } else if (view === 'users' && usersView) {
    // Only Administrators can access user management
    const session = getUserSession();
    if (!session || session.role !== 'Administrator') {
      showToast('Only Administrators can manage users', true);
      return;
    }
    usersView.style.display = '';
    renderUsersList();
  }
}

// Update openAdminLogin to show login view
function openAdminLogin() {
  // If any user is logged in, logout
  if (currentUser) { logoutAdmin(); return; }
  // Otherwise show login
  const overlay = document.getElementById('adminModalOverlay');
  if (!overlay) return;
  showAdminView('login');
  overlay.classList.add('open');
}

// Separate function for opening Users panel
function openUsersPanel() {
  // Close CMS modal if open
  closeCMSModal();
  
  const overlay = document.getElementById('adminModalOverlay');
  if (!overlay) return;
  showAdminView('users');
  overlay.classList.add('open');
}

// ================================================================
// PASSWORD RESET WITH OTP (EmailJS + Firebase)
// ================================================================

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send reset code via email
async function sendResetCode() {
  const username = document.getElementById('resetUsername').value.trim();
  const errEl = document.getElementById('resetError');
  
  if (!username) {
    if (errEl) { errEl.textContent = 'Please enter your username'; errEl.classList.add('show'); }
    return;
  }
  
  try {
    // Find user by username
    const user = await getUserByUsername(username);
    if (!user) {
      if (errEl) { errEl.textContent = 'No account found with this username'; errEl.classList.add('show'); }
      return;
    }
    
    // Check if user has email
    if (!user.email) {
      if (errEl) { errEl.textContent = 'No email address registered for this account'; errEl.classList.add('show'); }
      return;
    }
    
    // Generate OTP
    const otpCode = generateOTP();
    resetUserData = { ...user, otpCode };
    
    // Save OTP to database
    await updateUserOTP(user.id, otpCode, 'email');
    
    // Send OTP via email
    await sendOTPEmail(user.email, user.username, otpCode);
    showToast('Verification code sent to ' + maskEmail(user.email));
    
    // Move to step 2
    document.getElementById('resetStep1').style.display = 'none';
    document.getElementById('resetStep2').style.display = '';
    setTimeout(() => document.getElementById('resetOTP').focus(), 300);
    
  } catch (error) {
    console.error('Error sending reset code:', error);
    if (errEl) { errEl.textContent = 'Failed to send code. Please try again.'; errEl.classList.add('show'); }
  }
}

// Helper functions to mask email/phone for privacy
function maskEmail(email) {
  if (!email) return '';
  const [name, domain] = email.split('@');
  const maskedName = name.charAt(0) + '***' + name.charAt(name.length - 1);
  return maskedName + '@' + domain;
}

function maskPhone(phone) {
  if (!phone) return '';
  return '***-***-' + phone.slice(-4);
}

// Verify OTP and reset password
async function verifyOTPAndReset() {
  const otpInput = document.getElementById('resetOTP').value.trim();
  const newPassword = document.getElementById('resetNewPassword').value;
  const confirmPassword = document.getElementById('resetConfirmPassword').value;
  const errEl = document.getElementById('resetError');
  
  if (!otpInput) {
    if (errEl) { errEl.textContent = 'Please enter the verification code'; errEl.classList.add('show'); }
    return;
  }
  
  if (!newPassword) {
    if (errEl) { errEl.textContent = 'Please enter a new password'; errEl.classList.add('show'); }
    return;
  }
  
  if (newPassword.length < 6) {
    if (errEl) { errEl.textContent = 'Password must be at least 6 characters'; errEl.classList.add('show'); }
    return;
  }
  
  if (newPassword !== confirmPassword) {
    if (errEl) { errEl.textContent = 'Passwords do not match'; errEl.classList.add('show'); }
    return;
  }
  
  if (!resetUserData || otpInput !== resetUserData.otpCode) {
    if (errEl) { errEl.textContent = 'Invalid verification code'; errEl.classList.add('show'); }
    return;
  }
  
  try {
    // Reset password in database
    const success = await resetUserPassword(resetUserData.id, newPassword);
    
    if (success) {
      showToast('Password reset successfully! Please login with your new password.');
      resetUserData = null;
      showAdminView('login');
    } else {
      if (errEl) { errEl.textContent = 'Failed to reset password. Please try again.'; errEl.classList.add('show'); }
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    if (errEl) { errEl.textContent = 'An error occurred. Please try again.'; errEl.classList.add('show'); }
  }
}

// Send OTP via EmailJS
async function sendOTPEmail(email, username, otpCode) {
  console.log('sendOTPEmail called:', { email, username, otpCode });
  
  // Get EmailJS config from localStorage
  const stored = localStorage.getItem('emailjs_config');
  if (!stored) {
    console.error('EmailJS not configured. Please configure in Site Settings.');
    showToast('EmailJS not configured', true);
    // For development, show OTP in console
    console.log('🔐 OTP Code (dev):', otpCode);
    return;
  }
  
  try {
    const config = JSON.parse(stored);
    console.log('EmailJS config loaded:', { serviceId: config.serviceId, templateOTP: config.templateOTP });
    
    if (!config.serviceId || !config.templateOTP || !config.publicKey) {
      console.error('EmailJS configuration incomplete');
      showToast('EmailJS configuration incomplete', true);
      console.log('🔐 OTP Code (dev):', otpCode);
      return;
    }
    
    // Check if EmailJS library is loaded
    if (typeof emailjs === 'undefined') {
      console.error('EmailJS library not loaded. Loading now...');
      
      // Load EmailJS library
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      script.onload = async () => {
        console.log('EmailJS library loaded');
        emailjs.init(config.publicKey);
        await sendEmailJSMessage(config, email, username, otpCode);
      };
      document.head.appendChild(script);
      return;
    }
    
    // Initialize EmailJS with public key
    emailjs.init(config.publicKey);
    await sendEmailJSMessage(config, email, username, otpCode);
    
  } catch (error) {
    console.error('Error sending OTP email:', error);
    showToast('Failed to send email', true);
    console.log('🔐 OTP Code (dev):', otpCode);
  }
}

async function sendEmailJSMessage(config, email, username, otpCode) {
  const templateParams = {
    to_email: email,
    to_name: username,
    user_name: username,
    otp_code: otpCode,
    verification_code: otpCode,
    code: otpCode
  };
  
  console.log('Sending email with params:', templateParams);
  
  try {
    const response = await emailjs.send(config.serviceId, config.templateOTP, templateParams);
    console.log('Email sent successfully:', response);
    showToast('Verification code sent to email!');
  } catch (error) {
    console.error('EmailJS send error:', error);
    showToast('Failed to send email: ' + error.text, true);
    console.log('🔐 OTP Code (dev):', otpCode);
  }
}

// Site Configuration
// USER MANAGEMENT
// ================================================================

async function renderUsersList() {
  const list = document.getElementById('usersListContainer');
  if (!list) return;
  
  list.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-muted)"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  
  const users = await getAllUsers();
  const session = getUserSession();
  
  list.innerHTML = '';
  
  users.forEach(u => {
    const isCurrentUser = session && session.userId === u.id;
    const item = document.createElement('div');
    item.className = 'manage-item';
    item.innerHTML = `
      <div class="manage-item-info">
        <div class="manage-item-title">
          ${u.username}${isCurrentUser ? ' <span style="color:var(--neon-emerald);font-size:.65rem">(you)</span>' : ''}
        </div>
        <div class="manage-item-meta">
          <span class="manage-item-cat" style="background:${u.role === 'Administrator' ? 'rgba(0,240,255,.08);color:#00f0ff' : 'rgba(139,92,246,.08);color:#8b5cf6'}">${u.role}</span>
          ${u.phone ? ' · <i class="fas fa-phone" style="font-size:.7rem;opacity:.7"></i> ' + u.phone : ''}
          · Created ${new Date(u.created_at).toLocaleDateString()}
        </div>
      </div>
      <div class="manage-item-actions">
        ${isCurrentUser ? '' : `
          <button class="manage-btn manage-btn-edit" data-id="${u.id}" title="Edit user"><i class="fas fa-edit"></i></button>
          <button class="manage-btn manage-btn-del" data-id="${u.id}" title="Delete user"><i class="fas fa-trash"></i></button>
        `}
      </div>`;
    list.appendChild(item);
  });
  
  // Attach delete events
  list.querySelectorAll('.manage-btn-del').forEach(btn => {
    btn.addEventListener('click', async function() {
      if (!confirm('Delete this user permanently?')) return;
      
      const userId = parseInt(this.dataset.id);
      const success = await deleteUser(userId);
      
      if (success) {
        showToast('User deleted');
        renderUsersList();
      } else {
        showToast('Failed to delete user', true);
      }
    });
  });
  
  // Attach edit events
  list.querySelectorAll('.manage-btn-edit').forEach(btn => {
    btn.addEventListener('click', function() {
      const userId = parseInt(this.dataset.id);
      const user = users.find(u => u.id === userId);
      if (user) {
        editUser(user);
      }
    });
  });
}

function editUser(user) {
  // Populate form with user data
  const usernameInput = document.getElementById('newUserUsername');
  const emailInput = document.getElementById('newUserEmail');
  
  usernameInput.value = user.username;
  emailInput.value = user.email;
  document.getElementById('newUserPhone').value = user.phone || '';
  document.getElementById('newUserRole').value = user.role || 'Editor';
  document.getElementById('newUserPassword').value = '';
  document.getElementById('newUserConfirmPassword').value = '';
  document.getElementById('newUserPassword').placeholder = 'Leave empty to keep current password';
  
  // Make username read-only (email can be edited)
  usernameInput.readOnly = true;
  usernameInput.style.opacity = '0.6';
  usernameInput.style.cursor = 'not-allowed';
  
  // Change button text and set onclick with proper closure
  const btn = document.querySelector('#adminUsersView .btn-glow');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-save"></i> Update User';
    // Clone and replace to remove all event listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    // Set new onclick handler
    document.querySelector('#adminUsersView .btn-glow').onclick = function() { updateUser(user.id); };
  }
  
  showToast('Edit mode: Username and email cannot be changed');
}

function cancelEdit() {
  // Clear form
  const usernameInput = document.getElementById('newUserUsername');
  const emailInput = document.getElementById('newUserEmail');
  
  usernameInput.value = '';
  emailInput.value = '';
  document.getElementById('newUserPhone').value = '';
  document.getElementById('newUserRole').value = 'Editor';
  document.getElementById('newUserPassword').value = '';
  document.getElementById('newUserConfirmPassword').value = '';
  document.getElementById('newUserPassword').placeholder = 'Password (min 6 chars)';
  
  // Re-enable username and email fields
  usernameInput.readOnly = false;
  emailInput.readOnly = false;
  usernameInput.style.opacity = '1';
  emailInput.style.opacity = '1';
  usernameInput.style.cursor = 'text';
  emailInput.style.cursor = 'text';
  
  // Reset button - use removeAttribute and setAttribute for clean reset
  const btn = document.querySelector('#adminUsersView .btn-glow');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-plus"></i> Create User';
    // Clone and replace to remove all event listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.onclick = addNewUser;
  }
}

async function updateUser(userId) {
  const username = document.getElementById('newUserUsername').value.trim();
  const email = document.getElementById('newUserEmail').value.trim();
  const password = document.getElementById('newUserPassword').value;
  const confirmPassword = document.getElementById('newUserConfirmPassword').value;
  const phone = document.getElementById('newUserPhone').value.trim();
  const role = document.getElementById('newUserRole').value;
  
  // Validation
  if (!username) { showToast('Please enter a username', true); return; }
  if (username.length < 3) { showToast('Username must be at least 3 characters', true); return; }
  if (!email) { showToast('Please enter an email address', true); return; }
  if (!phone) { showToast('Please enter a phone number', true); return; }
  if (!role) { showToast('Please select a role', true); return; }
  
  // Phone validation
  const phoneRegex = /^\+\d{1,3}\s?\d{10}$/;
  if (!phoneRegex.test(phone)) {
    showToast('Invalid phone format. Use: +CountryCode PhoneNumber (e.g., +91 9876543210)', true);
    return;
  }
  
  // Password validation (only if provided)
  if (password || confirmPassword) {
    if (password !== confirmPassword) {
      showToast('Passwords do not match', true);
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', true);
      return;
    }
  }
  
  try {
    const result = await updateExistingUser(userId, username, email, password, role, phone);
    
    if (result.success) {
      showToast(`User "${username}" updated successfully!`);
      cancelEdit(); // Clear form and reset button
      await renderUsersList(); // Refresh user list
    } else {
      showToast(result.message || 'Failed to update user', true);
    }
  } catch (error) {
    console.error('Error in updateUser:', error);
    showToast('Failed to update user', true);
  }
}

async function addNewUser() {
  const username = document.getElementById('newUserUsername').value.trim();
  const email = document.getElementById('newUserEmail').value.trim();
  const password = document.getElementById('newUserPassword').value;
  const confirmPassword = document.getElementById('newUserConfirmPassword').value;
  const phone = document.getElementById('newUserPhone').value.trim();
  const role = document.getElementById('newUserRole').value;
  
  // Validation
  if (!username) { showToast('Please enter a username', true); return; }
  if (username.length < 3) { showToast('Username must be at least 3 characters', true); return; }
  if (!email) { showToast('Please enter an email address', true); return; }
  if (!password) { showToast('Please enter a password', true); return; }
  if (password.length < 6) { showToast('Password must be at least 6 characters', true); return; }
  if (!confirmPassword) { showToast('Please confirm your password', true); return; }
  if (password !== confirmPassword) { showToast('Passwords do not match', true); return; }
  if (!phone) { showToast('Please enter a phone number', true); return; }
  if (!role) { showToast('Please select a role', true); return; }
  
  // Phone validation: Must start with + followed by country code and 10 digits
  const phoneRegex = /^\+\d{1,3}\s?\d{10}$/;
  if (!phoneRegex.test(phone)) {
    showToast('Invalid phone format. Use: +CountryCode PhoneNumber (e.g., +91 9876543210)', true);
    return;
  }
  
  const isAdmin = role === 'Administrator';
  const result = await createNewUser(username, email, password, role, isAdmin, phone);
  
  if (result.success) {
    showToast(`User "${username}" created successfully!`);
    document.getElementById('newUserUsername').value = '';
    document.getElementById('newUserEmail').value = '';
    document.getElementById('newUserPassword').value = '';
    document.getElementById('newUserConfirmPassword').value = '';
    document.getElementById('newUserPhone').value = '';
    document.getElementById('newUserRole').value = 'Editor';
    renderUsersList();
  } else {
    showToast(result.message || 'Failed to create user', true);
  }
}

// ================================================================
// CMS SETTINGS MODAL
// ================================================================

function openCMSModal() {
  // Close admin modal if open
  closeAdminLogin();
  
  const overlay = document.getElementById('cmsModalOverlay');
  const modal = document.getElementById('cmsModal');
  if (!overlay || !modal) return;
  
  overlay.style.display = 'block';
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  
  // Load configurations
  loadEmailJSConfig();
}

function closeCMSModal() {
  const overlay = document.getElementById('cmsModalOverlay');
  const modal = document.getElementById('cmsModal');
  if (!overlay || !modal) return;
  
  overlay.style.display = 'none';
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

// CMS Tab Switching
function switchCMSTab(tabName) {
  console.log('switchCMSTab called:', tabName);
  
  // Update tab buttons
  document.querySelectorAll('.cms-tab').forEach(tab => tab.classList.remove('active'));
  event.target.closest('.cms-tab').classList.add('active');
  
  // Update tab content - remove active class and clear inline styles
  document.querySelectorAll('.cms-tab-content').forEach(content => {
    content.classList.remove('active');
    content.style.display = ''; // Clear inline style to let CSS take over
    console.log('Removed active from:', content.id);
  });
  
  // Fix case sensitivity for tab IDs
  let targetId;
  if (tabName === 'emailjs') {
    targetId = 'cmsTabEmailJS'; // Special case: EmailJS has capital JS
  } else {
    targetId = `cmsTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
  }
  
  const targetContent = document.getElementById(targetId);
  
  console.log('Looking for tab:', targetId, 'Found:', !!targetContent);
  
  if (targetContent) {
    targetContent.classList.add('active');
    console.log('Added active to:', targetId);
    // Don't set inline style - let CSS handle it via .active class
  }
  
  // Load data when specific tabs are opened
  if (tabName === 'articles') {
    refreshArticlesList();
  } else if (tabName === 'categories') {
    refreshCategoriesList();
  } else if (tabName === 'emailjs') {
    setTimeout(() => loadEmailJSConfig(), 100);
  }
}

// EmailJS Configuration
function getEmailJSConfig() {
  const stored = localStorage.getItem('emailjs_config');
  if (!stored) {
    return {
      serviceId: null,
      templateOTP: null,
      templateIdWelcome: null,
      templateWelcome: null,
      publicKey: null
    };
  }

  try {
    const config = JSON.parse(stored);
    // Ensure templateIdWelcome is set (alias for templateWelcome)
    config.templateIdWelcome = config.templateWelcome || config.templateIdWelcome;
    return config;
  } catch (error) {
    console.error('Error parsing EmailJS config:', error);
    return {
      serviceId: null,
      templateOTP: null,
      templateIdWelcome: null,
      templateWelcome: null,
      publicKey: null
    };
  }
}

function loadEmailJSConfig() {
  console.log('loadEmailJSConfig called');
  const stored = localStorage.getItem('emailjs_config');
  console.log('Stored EmailJS config:', stored);
  
  if (!stored) {
    console.log('No EmailJS config found in localStorage');
    return;
  }
  
  try {
    const config = JSON.parse(stored);
    console.log('Parsed EmailJS config:', config);
    
    const serviceIdEl = document.getElementById('emailjsServiceId');
    const templateOTPEl = document.getElementById('emailjsTemplateOTP');
    const templateWelcomeEl = document.getElementById('emailjsTemplateWelcome');
    const publicKeyEl = document.getElementById('emailjsPublicKey');
    
    console.log('Form elements found:', {
      serviceId: !!serviceIdEl,
      templateOTP: !!templateOTPEl,
      templateWelcome: !!templateWelcomeEl,
      publicKey: !!publicKeyEl
    });
    
    if (serviceIdEl) serviceIdEl.value = config.serviceId || '';
    if (templateOTPEl) templateOTPEl.value = config.templateOTP || config.templateId || '';
    if (templateWelcomeEl) templateWelcomeEl.value = config.templateWelcome || '';
    if (publicKeyEl) publicKeyEl.value = config.publicKey || '';
    
    console.log('EmailJS config loaded successfully');
  } catch (error) {
    console.error('Error loading EmailJS config:', error);
  }
}

function saveEmailJSConfig() {
  console.log('saveEmailJSConfig called');
  const serviceIdEl = document.getElementById('emailjsServiceId');
  const templateOTPEl = document.getElementById('emailjsTemplateOTP');
  const templateWelcomeEl = document.getElementById('emailjsTemplateWelcome');
  const publicKeyEl = document.getElementById('emailjsPublicKey');
  
  if (!serviceIdEl || !templateOTPEl || !templateWelcomeEl || !publicKeyEl) {
    console.error('Form elements not found');
    showToast('Form elements not found', true);
    return;
  }
  
  const config = {
    serviceId: serviceIdEl.value.trim(),
    templateOTP: templateOTPEl.value.trim(),
    templateWelcome: templateWelcomeEl.value.trim(),
    publicKey: publicKeyEl.value.trim()
  };
  
  console.log('EmailJS config:', config);
  
  if (!config.serviceId || !config.publicKey) {
    showToast('Service ID and Public Key are required', true);
    return;
  }
  
  if (!config.templateOTP && !config.templateWelcome) {
    showToast('Please configure at least one template', true);
    return;
  }
  
  localStorage.setItem('emailjs_config', JSON.stringify(config));
  console.log('EmailJS config saved to localStorage');
  showToast('EmailJS configuration saved! ✅');
}

function testEmailJS() {
  const stored = localStorage.getItem('emailjs_config');
  if (!stored) {
    showToast('Please configure EmailJS first', true);
    return;
  }
  
  try {
    const config = JSON.parse(stored);
    if (!config.serviceId || !config.publicKey) {
      showToast('EmailJS configuration is incomplete', true);
      return;
    }
    
    if (!config.templateOTP && !config.templateWelcome) {
      showToast('Please configure at least one template', true);
      return;
    }
    
    // Test email functionality would go here
    // For now, just show success message
    let message = 'EmailJS config is valid.\n';
    if (config.templateOTP) message += '✓ OTP template configured\n';
    if (config.templateWelcome) message += '✓ Welcome template configured';
    
    showToast(message, false, 4000);
  } catch (error) {
    showToast('Invalid EmailJS configuration', true);
  }
}

// Site Configuration
function saveSiteConfig() {
  const config = {
    title: document.getElementById('siteTitle').value,
    description: document.getElementById('siteDescription').value,
    storageAccount: document.getElementById('azureStorageAccount').value,
    imagesContainer: document.getElementById('azureImagesContainer').value
  };
  
  localStorage.setItem('site_config', JSON.stringify(config));
  alert('Site configuration saved!');
}

// ================================================================
// ARTICLE MANAGEMENT
// ================================================================

async function refreshArticlesList() {
  const container = document.getElementById('articlesListContainer');
  if (!container) return;
  
  container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted)"><i class="fas fa-spinner fa-spin"></i> Loading articles...</div>';
  
  try {
    const articles = await getArticles();
    
    if (!articles || articles.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted)"><i class="fas fa-inbox" style="font-size:2rem;margin-bottom:1rem;display:block;opacity:0.5"></i>No articles found</div>';
      return;
    }
    
    container.innerHTML = '';
    
    articles.forEach(article => {
      const item = document.createElement('div');
      item.className = 'manage-item';
      item.style.marginBottom = '0.75rem';
      
      const categoryColors = {
        Cloud: '#00f0ff',
        DevOps: '#8b5cf6',
        Kubernetes: '#38bdf8',
        Networking: '#f59e0b',
        Linux: '#10b981',
        IaC: '#f43f5e'
      };
      
      const color = categoryColors[article.category] || '#00f0ff';
      
      item.innerHTML = `
        <div class="manage-item-info">
          <div class="manage-item-title">${article.title}</div>
          <div class="manage-item-meta">
            <span class="manage-item-cat" style="background:${color}15;color:${color}">${article.category}</span>
            · ${article.date_published || article.date || 'No date'}
            · ${article.read_time || '5 min read'}
            ${article.tags && article.tags.length > 0 ? ' · ' + article.tags.slice(0, 3).join(', ') : ''}
          </div>
        </div>
        <div class="manage-item-actions">
          <button class="manage-btn manage-btn-view" data-article-id="${article.id}" title="View article">
            <i class="fas fa-eye"></i>
          </button>
          <button class="manage-btn manage-btn-edit" data-article-id="${article.id}" title="Edit article">
            <i class="fas fa-edit"></i>
          </button>
          <button class="manage-btn manage-btn-del" data-article-id="${article.id}" data-article-title="${article.title}" title="Delete article">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      
      container.appendChild(item);
    });
    
    // Attach event listeners after adding to DOM
    container.querySelectorAll('.manage-btn-view').forEach(btn => {
      btn.addEventListener('click', function() {
        viewArticle(this.dataset.articleId);
      });
    });
    
    container.querySelectorAll('.manage-btn-edit').forEach(btn => {
      btn.addEventListener('click', function() {
        editArticle(this.dataset.articleId);
      });
    });
    
    container.querySelectorAll('.manage-btn-del').forEach(btn => {
      btn.addEventListener('click', function() {
        deleteArticleConfirm(this.dataset.articleId, this.dataset.articleTitle);
      });
    });
    
  } catch (error) {
    console.error('Error loading articles:', error);
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--neon-rose)"><i class="fas fa-exclamation-triangle"></i> Failed to load articles</div>';
  }
}

function viewArticle(articleId) {
  // Open article in new tab
  const isSubPage = window.location.pathname.includes('pages/');
  const url = isSubPage ? `article.html?id=${articleId}` : `pages/article.html?id=${articleId}`;
  window.open(url, '_blank');
}

async function editArticle(articleId) {
  try {
    console.log('📝 editArticle called with ID:', articleId);
    console.log('📝 Current editingArticleId before setting:', window.editingArticleId);
    
    // Load the article
    const articles = await getArticles();
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
      showToast('Article not found', true);
      return;
    }
    
    console.log('📝 Found article:', article.title);
    
    // Store original ID for update BEFORE opening editor
    window.editingArticleId = articleId;
    console.log('✅ Set window.editingArticleId to:', window.editingArticleId);
    console.log('✅ Type:', typeof window.editingArticleId);
    
    // Close CMS modal
    closeCMSModal();
    
    // Open editor
    console.log('📝 Opening editor...');
    openEditor();
    
    // Update editor header to show "Edit Article"
    const editorHeader = document.querySelector('.editor-header h2');
    if (editorHeader) {
      editorHeader.innerHTML = '<i class="fas fa-edit"></i> Edit Article';
      console.log('✅ Updated editor header');
    }
    
    // Populate form
    document.getElementById('artTitle').value = article.title;
    document.getElementById('artDesc').value = article.description || article.desc || '';
    document.getElementById('artCategory').value = article.category;
    document.getElementById('artContent').value = article.content;
    
    // Set tags
    currentTags = article.tags || [];
    renderTags();
    
    console.log('✅ Article loaded for editing. editingArticleId:', window.editingArticleId);
    console.log('✅ Verify window.editingArticleId is still set:', window.editingArticleId);
    showToast('Editing article: ' + article.title);
    
  } catch (error) {
    console.error('❌ Error loading article for edit:', error);
    showToast('Failed to load article', true);
  }
}

async function deleteArticleConfirm(articleId, articleTitle) {
  if (!confirm(`Delete article "${articleTitle}"?\n\nThis action cannot be undone.`)) {
    return;
  }
  
  try {
    await deleteArticle(articleId);
    showToast('Article deleted successfully');
    refreshArticlesList();
    
    // Refresh home page if open
    const postsGrid = document.getElementById('postsGrid');
    if (postsGrid) {
      if (window.location.pathname.includes('pages/')) await renderPostsSub('postsGrid');
      else await renderPosts('postsGrid');
    }
  } catch (error) {
    console.error('Error deleting article:', error);
    showToast('Failed to delete article', true);
  }
}

// ================================================================
// CATEGORY MANAGEMENT
// ================================================================

// Default categories
const defaultCategories = [
  { 
    id: 'cloud', 
    name: 'Cloud', 
    icon: '☁️', 
    description: 'Cloud computing and services',
    color: 'var(--neon-cyan)',
    tags: ['AWS', 'Azure', 'GCP', 'Multi-Cloud']
  },
  { 
    id: 'devops', 
    name: 'DevOps', 
    icon: '♾️', 
    description: 'DevOps & CI/CD practices',
    color: 'var(--neon-violet)',
    tags: ['Jenkins', 'GitHub Actions', 'ArgoCD', 'GitOps']
  },
  { 
    id: 'kubernetes', 
    name: 'Kubernetes', 
    icon: '☸', 
    description: 'Container orchestration',
    color: 'var(--neon-sky)',
    tags: ['Docker', 'K8s', 'Helm', 'Istio']
  },
  { 
    id: 'networking', 
    name: 'Networking', 
    icon: '🔒', 
    description: 'Networking & Security',
    color: 'var(--neon-amber)',
    tags: ['VPC', 'Zero Trust', 'IAM', 'SSL/TLS']
  },
  { 
    id: 'linux', 
    name: 'Linux', 
    icon: '🐧', 
    description: 'Linux / Windows systems',
    color: 'var(--neon-emerald)',
    tags: ['Linux', 'Bash', 'PowerShell', 'Windows Server']
  },
  { 
    id: 'iac', 
    name: 'IaC', 
    icon: '📦', 
    description: 'Infrastructure as Code',
    color: 'var(--neon-rose)',
    tags: ['Terraform', 'Pulumi', 'Ansible', 'CloudFormation']
  }
];

function getCategories() {
  const stored = localStorage.getItem('site_categories');
  return stored ? JSON.parse(stored) : defaultCategories;
}

function saveCategories(categories) {
  localStorage.setItem('site_categories', JSON.stringify(categories));
}

async function refreshCategoriesList() {
  const container = document.getElementById('categoriesListContainer');
  if (!container) return;
  
  const categories = getCategories();
  
  if (categories.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:3rem;color:var(--text-muted)">
        <i class="fas fa-tags" style="font-size:3rem;margin-bottom:1rem;opacity:.3"></i>
        <p>No categories yet. Click "Add Category" to create one.</p>
      </div>
    `;
    return;
  }
  
  let html = '<div style="display:grid;gap:12px">';
  categories.forEach(cat => {
    html += `
      <div class="category-item" style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:8px;padding:16px;display:flex;align-items:center;gap:16px">
        <div style="font-size:2rem;width:50px;height:50px;display:flex;align-items:center;justify-content:center;background:var(--bg-void);border-radius:8px">${cat.icon}</div>
        <div style="flex:1">
          <div style="font-size:1rem;font-weight:600;color:var(--text-white);margin-bottom:4px">${cat.name}</div>
          <div style="font-size:.85rem;color:var(--text-muted)">${cat.description}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="cms-btn cms-btn-secondary" onclick="editCategory('${cat.id}')" style="padding:8px 12px">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="cms-btn cms-btn-danger" onclick="deleteCategory('${cat.id}')" style="padding:8px 12px">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

// Comprehensive emoji library - ALL categories
const allEmojis = [
  // Smileys & Emotion
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇',
  '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝',
  '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
  '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
  '🥵', '🥶', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳',
  '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓',
  '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️',

  // Robots & AI
  '🤖', '🦾', '🦿', '👾', '🎮', '🕹️', '💻', '🖥️', '⌨️', '🖱️', '🖨️', '💾', '💿',
  '📀', '🧠', '🔬', '🔭', '⚗️', '🧪', '🧬', '🔌', '💡', '🔦', '🕯️',

  // Cloud & Weather
  '☁️', '🌩️', '⛈️', '🌦️', '🌧️', '⛅', '🌤️', '🌥️', '💨', '🌪️', '🌫️', '🌬️',

  // Rockets & Space
  '🚀', '🛸', '🛰️', '🌌', '🌠', '🌟', '⭐', '✨', '💫', '⚡', '🔥', '💥',

  // Technical & Engineering
  '⚙️', '🔧', '🔩', '🛠️', '⚒️', '🔨', '⛏️', '🪛', '🪚', '⚡', '🔌', '💡', '🔦',

  // Security & Protection
  '🔒', '🔓', '🔑', '🗝️', '🔐', '🛡️', '⚔️', '🗡️',

  // Construction & Building
  '🏗️', '🏭', '🏢', '🏛️', '🏰', '🏚️', '🏘️', '🌆', '🌇', '🌃', '🌉', '🌁',
  '🧱', '🪵', '🪨', '🚧', '⚠️', '🚨', '⛔', '🛑',

  // Containers & Storage
  '🐳', '📦', '📮', '📫', '📪', '📬', '📭', '📄', '📃', '📑', '🗃️', '🗄️', '📁', '📂',

  // Charts & Analytics
  '📊', '📈', '📉', '💹', '💱', '💲', '💰', '💳', '🧾', '📋',

  // Devices & Computers
  '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📱', '📲',
  '☎️', '📞', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️',

  // Network & Communication
  '🌐', '🌍', '🌎', '🌏', '🗺️', '📡', '📶', '📳', '📴', '🛰️',

  // Code & Development
  '💾', '📝', '📄', '📃', '📋', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️',

  // Tools & Objects
  '⚙️', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪛', '🪚', '🔩', '⚡', '🔌', '💡', '🔦',

  // Fire & Energy
  '🔥', '💥', '💫', '✨', '⚡', '🌟', '💫', '⭐',

  // Design & Art
  '🎨', '🖌️', '🖍️', '🖊️', '🖋️', '✏️', '✒️', '📐', '📏', '📌', '📍', '✂️',

  // Communication & Mail
  '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '📢', '📣',
  '📯', '🔔', '🔕', '💌', '💬', '💭', '🗨️', '🗯️',

  // Games & Entertainment
  '🎮', '🕹️', '🎯', '🎲', '♠️', '♥️', '♦️', '♣️', '🃏', '🎰', '🎳', '🎪',

  // Flags & Symbols
  '🚩', '🏁', '🏴', '🏳️', '🏳️‍🌈', '⚠️', '🔰', '♻️', '⚛️', '🕉️', '✡️', '☸️',
  '☯️', '✝️', '☦️', '☪️', '☮️', '🕎', '🔯', '♈', '♉', '♊', '♋', '♌', '♍',

  // Science & Medicine
  '🧪', '🧬', '🔬', '🔭', '⚗️', '🧮', '🩺', '💉', '💊', '🩹', '🩼', '⚕️',

  // Transportation
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛',
  '🚜', '🏍️', '🛵', '🚲', '🛴', '✈️', '🛩️', '🚁', '🚂', '🚊', '🚝', '🚄', '🚅',

  // Nature & Animals
  '🌳', '🌲', '🌴', '🌵', '🌾', '🌿', '🍀', '🎋', '🎍', '🍃', '🍂', '🍁', '🌱',
  '🐕', '🐶', '🐩', '🐈', '🐱', '🦁', '🐯', '🐅', '🐆', '🦒', '🦓', '🐘', '🦏',

  // Food & Drink
  '🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '☕', '🍵', '🥤', '🧃', '🧉', '🍺', '🍻',

  // Sports & Activities
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒',

  // Objects & Tools
  '📱', '💻', '⌚', '⏰', '⏱️', '⏲️', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡',
  '🔦', '🕯️', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳',

  // Arrows & Symbols
  '⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️',
  '⤴️', '⤵️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '✅', '☑️', '❌', '❎',
  '➕', '➖', '➗', '✖️', '♾️', '‼️', '⁉️', '❓', '❔', '❕', '❗', '〰️',

  // Misc Symbols
  '©️', '®️', '™️', '💯', '🔠', '🔡', '🔢', '🔣', '🔤', '🆗', '🆕', '🆙', '🆒',
  '🆓', '🆔', '⭕', '✔️', '☑️', '✅', '❌', '❎', '➰', '➿', '〽️', '✳️', '✴️',
  '❇️', '‼️', '⁉️', '❓', '❔', '❕', '❗', '©️', '®️', '™️', '#️⃣', '*️⃣', '0️⃣',
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'
];

let filteredEmojis = [...allEmojis];

let currentSubcategories = [];

function openAddCategoryModal() {
  openCategoryModal('add');
}

function openCategoryModal(mode, categoryId = null) {
  const overlay = document.getElementById('categoryModalOverlay');
  const modal = document.getElementById('categoryModal');
  const title = document.getElementById('categoryModalTitle');

  // Reset form
  document.getElementById('categoryName').value = '';
  document.getElementById('categoryIcon').value = '';
  document.getElementById('categoryDescription').value = '';
  document.getElementById('editingCategoryId').value = '';
  currentSubcategories = [];
  renderSubcategories();

  if (mode === 'edit' && categoryId) {
    const categories = getCategories();
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    title.innerHTML = '<i class="fas fa-edit"></i> Edit Category';
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryIcon').value = category.icon;
    document.getElementById('categoryDescription').value = category.description || '';
    document.getElementById('editingCategoryId').value = category.id;
    currentSubcategories = category.tags || [];
    renderSubcategories();
  } else {
    title.innerHTML = '<i class="fas fa-tag"></i> Add Category';
  }

  // Show modal
  overlay.classList.add('show');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';

  // Initialize emoji picker
  initEmojiPicker();
}

function closeCategoryModal() {
  const overlay = document.getElementById('categoryModalOverlay');
  const modal = document.getElementById('categoryModal');

  overlay.classList.remove('show');
  modal.classList.remove('show');
  document.body.style.overflow = '';

  // Hide emoji picker
  document.getElementById('emojiPicker').style.display = 'none';
}

function initEmojiPicker() {
  renderEmojiGrid(allEmojis);
}

function renderEmojiGrid(emojis) {
  const grid = document.getElementById('emojiGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (emojis.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:1rem">No emojis found</div>';
    return;
  }

  emojis.forEach(emoji => {
    const item = document.createElement('div');
    item.className = 'emoji-item';
    item.textContent = emoji;
    item.onclick = () => selectEmoji(emoji);
    grid.appendChild(item);
  });
}

function filterEmojis(searchTerm) {
  // For now, we'll just filter by visual similarity since emoji names aren't available
  // In a production app, you'd map emojis to keywords
  const term = searchTerm.toLowerCase().trim();

  if (!term) {
    renderEmojiGrid(allEmojis);
    return;
  }

  // Comprehensive keyword-based filtering
  const emojiKeywords = {
    // Emotions & Faces
    'smile': ['😀', '😃', '😄', '😁', '😆', '😅', '😊', '🙂', '🙃', '😉'],
    'happy': ['😀', '😃', '😄', '😁', '😆', '🤩', '😍', '🥰'],
    'love': ['😍', '🥰', '😘', '😗', '💕', '💖', '💗', '💘', '💝'],
    'laugh': ['😂', '🤣', '😅', '😆'],
    'think': ['🤔', '🤨', '🧐'],
    'cool': ['😎', '🤓', '😏'],

    // Technology & Devices
    'robot': ['🤖', '🦾', '🦿', '👾'],
    'ai': ['🤖', '🧠', '💻', '⚙️'],
    'computer': ['💻', '🖥️', '⌨️', '🖱️', '🖨️'],
    'phone': ['📱', '📲', '☎️', '📞'],
    'tech': ['⚙️', '🔧', '🔩', '🛠️', '⚡', '🔌', '💡'],

    // Cloud & Weather
    'cloud': ['☁️', '🌩️', '⛈️', '🌦️', '🌧️', '⛅'],
    'weather': ['☁️', '🌩️', '⛈️', '🌦️', '🌧️', '🌪️'],

    // Space & Stars
    'rocket': ['🚀', '🛸', '🛰️'],
    'space': ['🚀', '🛸', '🛰️', '🌌', '🌠'],
    'star': ['⭐', '✨', '💫', '🌟', '🌠'],

    // Security
    'lock': ['🔒', '🔓', '🔑', '🛡️', '🔐', '🗝️'],
    'security': ['🔒', '🔓', '🔑', '🛡️', '🔐', '🗝️'],

    // Containers & Build
    'docker': ['🐳'],
    'container': ['🐳', '📦', '🗃️'],
    'build': ['🏗️', '🏭', '🧱', '🔨', '🛠️'],
    'construction': ['🏗️', '🚧', '🧱', '🔨', '⚒️', '🛠️'],

    // Data & Analytics
    'chart': ['📊', '📈', '📉', '💹'],
    'data': ['📊', '📈', '📉', '💾', '💿', '📀'],
    'analytics': ['📊', '📈', '📉', '💹'],

    // Network
    'network': ['🌐', '🌍', '🌎', '🌏', '📡', '📶'],
    'globe': ['🌐', '🌍', '🌎', '🌏'],

    // Code & Development
    'code': ['💾', '📝', '📄', '📃', '📋', '💻', '⌨️'],
    'dev': ['💻', '🖥️', '⌨️', '💾', '📝'],

    // Fire & Energy
    'fire': ['🔥', '💥', '⚡', '🔥'],
    'energy': ['⚡', '🔋', '🔌', '💡'],

    // Design & Art
    'design': ['🎨', '🖌️', '🖍️', '✏️'],
    'art': ['🎨', '🖌️', '🖍️', '🎭'],

    // Communication
    'mail': ['📧', '📨', '💌', '📮', '📫'],
    'email': ['📧', '📨', '💌'],
    'message': ['💬', '💭', '🗨️'],

    // Games
    'game': ['🎮', '🕹️', '🎯', '🎲'],

    // Science
    'science': ['🧪', '🧬', '🔬', '🔭', '⚗️'],
    'lab': ['🧪', '🧬', '🔬', '⚗️'],

    // Tools
    'tool': ['🔧', '🔨', '⚒️', '🛠️', '⚙️'],
    'wrench': ['🔧', '🛠️'],
    'hammer': ['🔨', '⚒️'],

    // Arrows & Navigation
    'arrow': ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'],
    'up': ['⬆️', '↗️', '🔝', '🔺'],
    'down': ['⬇️', '↘️', '🔻'],

    // Status & Checks
    'check': ['✅', '☑️', '✔️'],
    'cross': ['❌', '❎'],
    'warning': ['⚠️', '🚨', '⛔'],

    // Misc
    'heart': ['❤️', '💕', '💖', '💗', '💘', '💝'],
    'money': ['💰', '💵', '💴', '💶', '💷', '💸']
  };

  let filtered = [];

  // Search in keywords
  for (const [keyword, emojis] of Object.entries(emojiKeywords)) {
    if (keyword.includes(term)) {
      filtered.push(...emojis);
    }
  }

  // If no matches, show all (user might be typing an emoji directly)
  if (filtered.length === 0) {
    filtered = allEmojis.filter(emoji => emoji.includes(searchTerm));
  }

  // Remove duplicates
  filtered = [...new Set(filtered)];

  renderEmojiGrid(filtered.length > 0 ? filtered : allEmojis);
}

function toggleEmojiPicker() {
  const picker = document.getElementById('emojiPicker');
  picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
}

function selectEmoji(emoji) {
  document.getElementById('categoryIcon').value = emoji;
  document.getElementById('emojiPicker').style.display = 'none';
}

function addSubcategory() {
  const input = document.getElementById('subcategoryInput');
  const value = input.value.trim();

  if (!value) return;

  if (currentSubcategories.includes(value)) {
    showToast('Subcategory already added', true);
    return;
  }

  currentSubcategories.push(value);
  renderSubcategories();
  input.value = '';
  input.focus();
}

function removeSubcategory(index) {
  currentSubcategories.splice(index, 1);
  renderSubcategories();
}

function renderSubcategories() {
  const list = document.getElementById('subcategoriesList');
  if (!list) return;

  if (currentSubcategories.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);font-size:.85rem;padding:.5rem 0">No subcategories added yet</div>';
    return;
  }

  list.innerHTML = '';
  currentSubcategories.forEach((sub, index) => {
    const tag = document.createElement('div');
    tag.className = 'subcategory-tag';
    tag.innerHTML = `
      ${sub}
      <button onclick="removeSubcategory(${index})" title="Remove">
        <i class="fas fa-times"></i>
      </button>
    `;
    list.appendChild(tag);
  });
}

function saveCategoryFromModal() {
  const name = document.getElementById('categoryName').value.trim();
  const icon = document.getElementById('categoryIcon').value.trim();
  const description = document.getElementById('categoryDescription').value.trim();
  const editingId = document.getElementById('editingCategoryId').value;

  // Validation
  if (!name) {
    showToast('Please enter a category name', true);
    return;
  }

  if (!icon) {
    showToast('Please select an icon', true);
    return;
  }

  if (!description) {
    showToast('Please enter a description', true);
    return;
  }

  const categories = getCategories();
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (editingId) {
    // Edit existing category
    const category = categories.find(c => c.id === editingId);
    if (!category) {
      showToast('Category not found', true);
      return;
    }

    category.name = name;
    category.icon = icon;
    category.description = description;
    category.tags = currentSubcategories;

    showToast('Category updated successfully! ✅');
  } else {
    // Add new category
    if (categories.find(c => c.id === id)) {
      showToast('Category with this name already exists', true);
      return;
    }

    const colors = ['var(--neon-cyan)', 'var(--neon-violet)', 'var(--neon-sky)', 'var(--neon-amber)', 'var(--neon-emerald)', 'var(--neon-rose)'];
    const color = colors[categories.length % colors.length];

    categories.push({
      id,
      name,
      icon,
      description,
      color,
      tags: currentSubcategories
    });

    showToast('Category added successfully! ✅');
  }

  saveCategories(categories);
  refreshCategoriesList();
  updateCategoryDropdowns();
  renderTopicCards();
  renderBlogFilters();
  closeCategoryModal();
}

function editCategory(categoryId) {
  openCategoryModal('edit', categoryId);
}

function deleteCategory(categoryId) {
  if (!confirm('Delete this category?\n\nArticles using this category will not be affected.')) {
    return;
  }
  
  let categories = getCategories();
  categories = categories.filter(c => c.id !== categoryId);
  saveCategories(categories);
  refreshCategoriesList();
  updateCategoryDropdowns();
  renderTopicCards();
  renderBlogFilters();
  showToast('Category deleted successfully');
}

function updateCategoryDropdowns() {
  const categories = getCategories();
  const dropdown = document.getElementById('artCategory');
  if (!dropdown) return;
  
  dropdown.innerHTML = '';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.name;
    option.textContent = `${cat.icon} ${cat.name}`;
    dropdown.appendChild(option);
  });
}

function renderTopicCards() {
  const container = document.getElementById('topicsWrap');
  if (!container) return;
  
  const categories = getCategories();
  const colors = ['var(--neon-cyan)', 'var(--neon-violet)', 'var(--neon-sky)', 'var(--neon-amber)', 'var(--neon-emerald)', 'var(--neon-rose)'];
  
  container.innerHTML = '';
  categories.forEach((cat, index) => {
    const color = cat.color || colors[index % colors.length];
    const tags = cat.tags || [];
    
    const card = document.createElement('div');
    card.className = 'tcard reveal';
    card.style.setProperty('--c', color);
    card.onclick = () => window.location.href = `pages/blog.html?category=${cat.name}`;
    
    let tagsHtml = '';
    if (tags.length > 0) {
      tagsHtml = '<div class="tcard-tags">' + tags.map(tag => `<span>${tag}</span>`).join('') + '</div>';
    }
    
    card.innerHTML = `
      <div class="tcard-icon">${cat.icon}</div>
      <h3>${cat.name}</h3>
      <p>${cat.description}</p>
      ${tagsHtml}
    `;
    
    container.appendChild(card);
  });
  
  // Re-initialize reveal animations
  if (typeof initReveals === 'function') {
    initReveals();
  }
}

function renderBlogFilters() {
  const container = document.getElementById('filterBtns');
  if (!container) return;
  
  const categories = getCategories();
  
  // Keep "All" button
  let html = '<button class="filter-btn active" data-cat="all">All Topics</button>';
  
  // Add category buttons
  categories.forEach(cat => {
    html += `<button class="filter-btn" data-cat="${cat.name}">${cat.icon} ${cat.name}</button>`;
  });
  
  container.innerHTML = html;
  
  // Re-attach event listeners
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const cat = this.getAttribute('data-cat');
      if (typeof filterPosts === 'function') {
        filterPosts(cat);
      }
    });
  });
}

// ================================================================
// UPDATE ADMIN ACTIVATION TO SHOW USERS BUTTON
// ================================================================

// Update checkUserSession to show Users button for Administrators
function checkUserSession() {
  currentUser = getUserSession();
  if (currentUser) {
    isAdmin = currentUser.is_admin;
    document.body.classList.add('admin-mode');
    const badge = document.getElementById('adminBadge');

    if (badge) {
      badge.classList.add('show');
      badge.innerHTML = `<i class="fas fa-shield"></i> ${currentUser.username}`;
      badge.title = `Role: ${currentUser.role}`;
    }
    const lock = document.getElementById('adminLock');
    if (lock) { 
      lock.classList.add('unlocked'); 
      lock.innerHTML = '<i class="fas fa-lock-open"></i>'; 
      lock.title = 'Logout'; 
    }
    
    // Add role-specific class
    if (currentUser.is_admin === true || currentUser.is_admin === 1) {
      document.body.classList.add('administrator-mode');
    } else {
      document.body.classList.add('editor-mode');
      document.body.classList.remove('administrator-mode');
    }
  }
}

// ================================================================
// NEWSLETTER / SUBSCRIPTION FUNCTIONALITY
// ================================================================

/**
 * Get all subscribers from localStorage
 */
function getSubscribers() {
  const stored = localStorage.getItem('site_subscribers');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save subscribers to localStorage
 */
function saveSubscribers(subscribers) {
  localStorage.setItem('site_subscribers', JSON.stringify(subscribers));
}

/**
 * Add a new subscriber
 */
function addSubscriber(email) {
  const subscribers = getSubscribers();

  if (subscribers.includes(email)) {
    return { success: false, message: 'You are already subscribed!' };
  }

  subscribers.push(email);
  saveSubscribers(subscribers);

  return { success: true, message: 'Successfully subscribed!' };
}

/**
 * Handle subscribe button click
 */
async function handleSubscribe() {
  const emailInput = document.getElementById('subscribeEmail');
  const messageDiv = document.getElementById('subscribeMessage');
  const email = emailInput.value.trim();

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showSubscribeMessage('Please enter your email address', 'error');
    return;
  }

  if (!emailRegex.test(email)) {
    showSubscribeMessage('Please enter a valid email address', 'error');
    return;
  }

  // Add to subscribers
  const result = addSubscriber(email);

  if (!result.success) {
    showSubscribeMessage(result.message, 'warning');
    return;
  }

  // Send welcome email
  const emailSent = await sendWelcomeEmail(email);

  if (emailSent) {
    showSubscribeMessage('✅ Subscribed successfully! Check your email for confirmation.', 'success');
    emailInput.value = '';
  } else {
    showSubscribeMessage('✅ Subscribed! (Note: Email notification failed, but you are subscribed)', 'success');
    emailInput.value = '';
  }
}

/**
 * Show subscribe message
 */
function showSubscribeMessage(message, type) {
  const messageDiv = document.getElementById('subscribeMessage');
  if (!messageDiv) return;

  messageDiv.style.display = 'block';
  messageDiv.textContent = message;

  // Style based on type
  if (type === 'success') {
    messageDiv.style.color = 'var(--neon-emerald)';
  } else if (type === 'error') {
    messageDiv.style.color = 'var(--neon-rose)';
  } else if (type === 'warning') {
    messageDiv.style.color = 'var(--neon-amber)';
  }

  // Hide after 5 seconds
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

/**
 * Send welcome email using EmailJS
 */
async function sendWelcomeEmail(email) {
  try {
    const config = getEmailJSConfig();

    if (!config.serviceId || !config.templateIdWelcome || !config.publicKey) {
      console.warn('EmailJS not configured. Skipping welcome email.');
      return false;
    }

    // Initialize EmailJS
    emailjs.init(config.publicKey);

    const templateParams = {
      user_name: email.split('@')[0],
      user_email: email,
      subject: 'Welcome to KloudVin!',
      message: 'Thank you for subscribing to KloudVin! You will receive notifications when new technical articles are published. Stay tuned for deep-dive articles on Cloud Architecture, DevOps, Kubernetes, IaC, and more.',
      from_name: 'KloudVin'
    };

    const response = await emailjs.send(
      config.serviceId,
      config.templateIdWelcome,
      templateParams
    );

    console.log('Welcome email sent:', response);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

/**
 * Send notification emails to all subscribers when a new article is published
 */
async function notifySubscribersNewArticle(article) {
  try {
    const config = getEmailJSConfig();
    const subscribers = getSubscribers();

    if (!config.serviceId || !config.templateIdWelcome || !config.publicKey) {
      console.warn('EmailJS not configured. Skipping subscriber notifications.');
      return { success: false, count: 0 };
    }

    if (subscribers.length === 0) {
      console.log('No subscribers to notify');
      return { success: true, count: 0 };
    }

    // Initialize EmailJS
    emailjs.init(config.publicKey);

    let successCount = 0;

    // Send email to each subscriber
    for (const email of subscribers) {
      try {
        const articleUrl = `${window.location.origin}/pages/article.html?id=${article.id}`;

        const templateParams = {
          to_email: email,  // Changed from user_email to to_email
          to_name: email.split('@')[0],  // Changed from user_name to to_name
          user_name: email.split('@')[0],  // Keep for backward compatibility
          user_email: email,  // Keep for backward compatibility
          subject: `New Article: ${article.title}`,
          message: `A new article has been published on KloudVin!\n\nTitle: ${article.title}\n\nDescription: ${article.description}\n\nRead the full article here: ${articleUrl}\n\nHappy reading!`,
          from_name: 'KloudVin',
          article_title: article.title,
          article_description: article.description,
          article_url: articleUrl
        };

        await emailjs.send(
          config.serviceId,
          config.templateIdWelcome,
          templateParams
        );

        successCount++;

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error sending notification to ${email}:`, error);
      }
    }

    console.log(`Sent ${successCount} of ${subscribers.length} notification emails`);
    return { success: true, count: successCount, total: subscribers.length };
  } catch (error) {
    console.error('Error in notifySubscribersNewArticle:', error);
    return { success: false, count: 0 };
  }
}
