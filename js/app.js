/* ================================================================
   KloudVin — Main JavaScript
   Admin System, Articles, Editor, Utilities
   ================================================================ */

// ---- ADMIN PASSWORD (Change this!) ----
const ADMIN_PASSWORD = 'kloudvin@2026';

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
let articles = JSON.parse(localStorage.getItem('kloudvin_articles')) || [
  {
    id: 'multi-cloud-strategy',
    title: "Multi-Cloud Strategy: When and How to Go Beyond a Single Provider",
    desc: "A practical guide to designing multi-cloud architectures without the complexity overhead.",
    category: "Cloud", readTime: "8 min read",
    tags: ["AWS","Azure","GCP","Architecture"],
    date: "Feb 5, 2026",
    content: "## Introduction\n\nMulti-cloud is no longer a buzzword — it's a reality for most enterprises. But when should you actually adopt it, and how do you avoid the pitfalls?\n\n## Why Multi-Cloud?\n\nThere are several legitimate reasons to go multi-cloud:\n\n- **Avoid vendor lock-in** — reduce dependency on a single provider\n- **Best-of-breed services** — use the best service from each cloud\n- **Compliance requirements** — data residency laws may require it\n- **Disaster recovery** — true cross-cloud DR\n\n## Architecture Patterns\n\n### Pattern 1: Workload Segregation\n\nRun different workloads on different clouds based on strengths:\n\n```\nAWS  → Data/ML workloads (SageMaker, Redshift)\nAzure → Enterprise apps (.NET, Active Directory)\nGCP   → Analytics & BigQuery workloads\n```\n\n### Pattern 2: Active-Active\n\nRun the same workload across clouds for resilience. This is complex but provides true HA.\n\n## Key Considerations\n\n> The biggest mistake teams make is treating multi-cloud as running the same thing everywhere. Instead, play to each cloud's strengths.\n\n## Conclusion\n\nMulti-cloud done right is powerful. Multi-cloud done wrong is expensive chaos. Start with a clear strategy."
  },
  {
    id: 'production-kubernetes',
    title: "Production-Ready Kubernetes: Lessons from 50+ Deployments",
    desc: "Battle-tested patterns, anti-patterns, and things documentation doesn't tell you.",
    category: "Kubernetes", readTime: "12 min read",
    tags: ["K8s","Docker","Helm","Production"],
    date: "Jan 28, 2026",
    content: "## Introduction\n\nAfter deploying Kubernetes in production across 50+ projects, I've compiled the lessons that documentation doesn't teach you.\n\n## Lesson 1: Resource Limits Are Non-Negotiable\n\nAlways set resource requests AND limits:\n\n```yaml\nresources:\n  requests:\n    memory: \"256Mi\"\n    cpu: \"250m\"\n  limits:\n    memory: \"512Mi\"\n    cpu: \"500m\"\n```\n\n## Lesson 2: Namespaces Are Your Friend\n\nUse namespaces for environment separation:\n\n- `production`\n- `staging`\n- `monitoring`\n- `ingress`\n\n## Lesson 3: Don't Skip Health Checks\n\nLiveness and readiness probes save you from silent failures.\n\n> 90% of production K8s incidents I've seen could have been prevented with proper health checks and resource limits.\n\n## Conclusion\n\nKubernetes is powerful but unforgiving. Respect the fundamentals."
  },
  {
    id: 'terraform-vs-pulumi',
    title: "Terraform vs Pulumi in 2026: Which IaC Tool Should You Pick?",
    desc: "An honest comparison from someone who uses both daily in enterprise environments.",
    category: "IaC", readTime: "10 min read",
    tags: ["Terraform","Pulumi","IaC","DevOps"],
    date: "Jan 15, 2026",
    content: "## Introduction\n\nThe IaC landscape has evolved significantly. Let me share my experience using both Terraform and Pulumi in production.\n\n## Terraform: The Industry Standard\n\n**Pros:**\n- Massive community & ecosystem\n- HCL is easy to learn\n- Huge provider catalog\n- Battle-tested at scale\n\n**Cons:**\n- HCL limitations for complex logic\n- State management complexity\n- No real programming constructs\n\n```hcl\nresource \"aws_instance\" \"web\" {\n  ami           = \"ami-0c55b159cbfafe1f0\"\n  instance_type = \"t3.micro\"\n}\n```\n\n## Pulumi: The Developer-Friendly Choice\n\n**Pros:**\n- Real programming languages (Python, TypeScript, Go)\n- Better testing capabilities\n- Rich abstractions\n\n**Cons:**\n- Smaller community\n- Learning curve for ops teams\n- Fewer providers\n\n## My Recommendation\n\n> Use Terraform for platform teams and shared infrastructure. Use Pulumi when your team is developer-heavy and needs complex logic.\n\n## Conclusion\n\nBoth tools are excellent. The right choice depends on your team's DNA."
  }
];

function saveArticles() {
  localStorage.setItem('kloudvin_articles', JSON.stringify(articles));
}

// ---- RENDER POST CARDS ----
function renderPosts(containerId, limit) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
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
          <span class="pcard-date">${a.date}</span>
        </div>
        <h3>${a.title}</h3>
        <p>${a.desc}</p>
        <div class="pcard-foot">
          <span class="pcard-time"><i class="far fa-clock"></i> ${a.readTime}</span>
          <span class="pcard-read">Read <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  initReveals();
}

// For sub-pages (relative path adjustment)
function renderPostsSub(containerId, limit) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
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
          <span class="pcard-date">${a.date}</span>
        </div>
        <h3>${a.title}</h3>
        <p>${a.desc}</p>
        <div class="pcard-foot">
          <span class="pcard-time"><i class="far fa-clock"></i> ${a.readTime}</span>
          <span class="pcard-read">Read <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  initReveals();
}

// ---- ADMIN SYSTEM ----
let isAdmin = false;

function openAdminLogin() {
  if (isAdmin) { logoutAdmin(); return; }
  const overlay = document.getElementById('adminModalOverlay');
  if (overlay) {
    overlay.classList.add('open');
    const pwd = document.getElementById('adminPassword');
    if (pwd) { pwd.value = ''; setTimeout(() => pwd.focus(), 300); }
    const err = document.getElementById('adminError');
    if (err) err.classList.remove('show');
  }
}

function closeAdminLogin() {
  const overlay = document.getElementById('adminModalOverlay');
  if (overlay) overlay.classList.remove('open');
}

function verifyAdmin() {
  const pwd = document.getElementById('adminPassword');
  if (pwd && pwd.value === ADMIN_PASSWORD) {
    isAdmin = true;
    document.body.classList.add('admin-mode');
    const badge = document.getElementById('adminBadge');
    if (badge) badge.classList.add('show');
    const lock = document.getElementById('adminLock');
    if (lock) { lock.classList.add('unlocked'); lock.innerHTML = '<i class="fas fa-lock-open"></i>'; lock.title = 'Logout Admin'; }
    closeAdminLogin();
    showToast('Welcome back, Vinod! Editor unlocked 🔓');
  } else {
    const err = document.getElementById('adminError');
    if (err) err.classList.add('show');
    if (pwd) { pwd.value = ''; pwd.focus(); }
  }
}

function logoutAdmin() {
  isAdmin = false;
  document.body.classList.remove('admin-mode');
  const badge = document.getElementById('adminBadge');
  if (badge) badge.classList.remove('show');
  const lock = document.getElementById('adminLock');
  if (lock) { lock.classList.remove('unlocked'); lock.innerHTML = '<i class="fas fa-lock"></i>'; lock.title = 'Admin'; }
  showToast('Logged out of admin mode');
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
  // Use a simple zip-based approach to extract text from docx
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const arrayBuffer = e.target.result;
      extractDocxText(arrayBuffer).then(function(text) {
        uploadedFileContent = text;
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Ready';
        statusEl.className = 'upload-file-status';
        showUploadPreview(text);
        autoFillFromContent(text);
        showToast('DOCX content extracted! ✅');
      }).catch(function(err) {
        // Fallback: read as text
        uploadedFileContent = '[Could not fully parse DOCX. Please use .md or .txt format for best results.]';
        statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Partial';
        statusEl.className = 'upload-file-status processing';
        showUploadPreview(uploadedFileContent);
        showToast('DOCX parsing limited. Try .md or .txt for best results.', true);
      });
    } catch(err) {
      statusEl.innerHTML = '<i class="fas fa-times-circle"></i> Error';
      statusEl.className = 'upload-file-status error';
      showToast('Failed to read DOCX file', true);
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
  // If title is empty, try extracting first heading
  const titleInput = document.getElementById('artTitle');
  if (titleInput && !titleInput.value.trim()) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    const h2Match = content.match(/^##\s+(.+)$/m);
    const firstLine = content.split('\n').find(function(l) { return l.trim().length > 5; });
    if (h1Match) titleInput.value = h1Match[1].trim();
    else if (h2Match) titleInput.value = h2Match[1].trim();
    else if (firstLine && firstLine.length < 120) titleInput.value = firstLine.trim();
  }

  // If description is empty, try extracting first paragraph
  const descInput = document.getElementById('artDesc');
  if (descInput && !descInput.value.trim()) {
    const lines = content.split('\n').filter(function(l) {
      const t = l.trim();
      return t.length > 20 && !t.startsWith('#') && !t.startsWith('```') && !t.startsWith('>') && !t.startsWith('-');
    });
    if (lines.length) {
      const firstPara = lines[0].trim();
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
  const panel = document.getElementById('editorPanel');
  const overlay = document.getElementById('editorOverlay');
  if (panel) panel.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Reset to write mode and clear upload state
  switchEditorMode('write');
  removeUploadedFile();
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

function publishArticle() {
  const title = document.getElementById('artTitle').value.trim();
  const category = document.getElementById('artCategory').value;
  const readTime = document.getElementById('artReadTime').value;
  const desc = document.getElementById('artDesc').value.trim();

  // Get content from either write mode or upload mode
  let content;
  if (editorMode === 'upload') {
    if (!uploadedFileContent) { showToast('Please upload a file first!', true); return; }
    content = uploadedFileContent;
  } else {
    content = document.getElementById('artContent').value.trim();
  }

  if (!title) { showToast('Please enter an article title!', true); return; }
  if (!desc) { showToast('Please enter a short description!', true); return; }
  if (!content) { showToast('Please add article content — write or upload a file!', true); return; }

  const now = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/,'');

  articles.unshift({ id, title, desc, category, readTime, tags:[...currentTags], date:dateStr, content });
  saveArticles();

  // Reset form
  document.getElementById('artTitle').value = '';
  document.getElementById('artDesc').value = '';
  document.getElementById('artContent').value = '';
  currentTags = [];
  renderTags();
  removeUploadedFile();
  switchEditorMode('write');
  closeEditor();
  showToast('Article published to "' + category + '" topic! 🎉');

  // Re-render
  const postsGrid = document.getElementById('postsGrid');
  if (postsGrid) {
    if (window.location.pathname.includes('pages/')) renderPostsSub('postsGrid');
    else renderPosts('postsGrid');
  }
}

// ---- MARKDOWN RENDERER ----
function renderMarkdown(md) {
  if (!md) return '<p>No content yet.</p>';
  let html = md
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^- (.+)$/gm, '<ul><li>$1</li></ul>')
    .replace(/^\d+\. (.+)$/gm, '<ol><li>$1</li></ol>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  // Merge consecutive ul/ol
  html = html.replace(/<\/ul>\s*<ul>/g, '').replace(/<\/ol>\s*<ol>/g, '');
  // Wrap loose lines in <p>
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.match(/^<(h[1-6]|pre|code|blockquote|li|hr|ul|ol|img|strong|em|a|div|section)/))
      return `<p>${trimmed}</p>`;
    return line;
  }).join('\n');
  // Clean empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  return html;
}

// ---- TOAST ----
function showToast(msg, isError) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.style.borderColor = isError ? 'var(--neon-rose)' : 'var(--neon-emerald)';
  toast.style.color = isError ? 'var(--neon-rose)' : 'var(--neon-emerald)';
  toast.querySelector('i').className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
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
}

document.addEventListener('DOMContentLoaded', initApp);
