import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getArticles, createArticle, deleteArticle, getCategories, createCategory, deleteCategory, getSubscribers } from '../api';

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(d => d.msg || JSON.stringify(d)).join(' ') : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card" data-testid="login-card">
      <h2>Login</h2>
      <p>Enter your credentials to access the editor</p>
      {error && <div className="form-error" data-testid="login-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required data-testid="login-email" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required data-testid="login-password" />
        </div>
        <button type="submit" className="btn-full btn-cyan" disabled={loading} data-testid="login-submit">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

function ArticleForm({ categories, onCreated }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createArticle({ title, category, description, content });
      setTitle(''); setCategory(''); setDescription(''); setContent('');
      onCreated();
    } catch (err) {
      setError('Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="article-form" onSubmit={handleSubmit} data-testid="article-form">
      <h3>New Article</h3>
      {error && <div className="form-error">{error}</div>}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} required data-testid="article-title-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)} required data-testid="article-category-select">
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            <option value="General">General</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Short Description</label>
        <input className="form-input" value={description} onChange={e => setDescription(e.target.value)} required data-testid="article-desc-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Content (Markdown)</label>
        <textarea className="form-textarea" rows={12} value={content} onChange={e => setContent(e.target.value)} required style={{ minHeight: '300px' }} data-testid="article-content-input" />
      </div>
      <div className="form-buttons">
        <button type="submit" className="btn-primary" disabled={loading} data-testid="article-publish-btn">
          {loading ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </form>
  );
}

export default function AdminPage() {
  const { user, checking, logout } = useAuth();
  const [tab, setTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatSubs, setNewCatSubs] = useState('');

  const loadData = () => {
    getArticles(null).then(setArticles).catch(console.error);
    getCategories().then(setCategories).catch(console.error);
    getSubscribers().then(setSubscribers).catch(console.error);
  };

  useEffect(() => {
    if (user && user.role) loadData();
  }, [user]);

  if (checking) {
    return <div className="admin-page"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  }

  if (!user || !user.role) {
    return <div className="admin-page"><LoginForm /></div>;
  }

  const handleDeleteArticle = async (slug) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await deleteArticle(slug);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await createCategory({
        name: newCatName,
        icon: newCatIcon || 'Cloud',
        description: newCatDesc,
        subcategories: newCatSubs.split(',').map(s => s.trim()).filter(Boolean),
      });
      setNewCatName(''); setNewCatIcon(''); setNewCatDesc(''); setNewCatSubs('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="admin-page" data-testid="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</span>
          <button className="btn-sm" onClick={logout} data-testid="admin-logout-btn">Logout</button>
        </div>
      </div>

      <div className="admin-tabs" data-testid="admin-tabs">
        {['articles', 'new-article', 'categories', 'subscribers'].map(t => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
            data-testid={`admin-tab-${t}`}
          >
            {t === 'new-article' ? 'New Article' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Articles Tab */}
      {tab === 'articles' && (
        <div data-testid="admin-articles-list">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Read Time</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.slug}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.title}</td>
                  <td><span className="article-category-badge">{a.category}</span></td>
                  <td>{a.read_time || 'N/A'}</td>
                  <td>{new Date(a.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-actions">
                      <button className="btn-sm danger" onClick={() => handleDeleteArticle(a.slug)} data-testid={`delete-article-${a.slug}`}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {articles.length === 0 && <div className="empty-state">No articles yet</div>}
        </div>
      )}

      {/* New Article Tab */}
      {tab === 'new-article' && (
        <ArticleForm categories={categories} onCreated={() => { setTab('articles'); loadData(); }} />
      )}

      {/* Categories Tab */}
      {tab === 'categories' && (
        <div data-testid="admin-categories-list">
          <form className="article-form" onSubmit={handleCreateCategory} style={{ marginBottom: '1.5rem' }}>
            <h3>Add Category</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={newCatName} onChange={e => setNewCatName(e.target.value)} required data-testid="cat-name-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Icon Name</label>
                <input className="form-input" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} placeholder="Cloud, Shield, Terminal..." data-testid="cat-icon-input" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} required data-testid="cat-desc-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Subcategories (comma-separated)</label>
              <input className="form-input" value={newCatSubs} onChange={e => setNewCatSubs(e.target.value)} placeholder="AWS, Azure, GCP" data-testid="cat-subs-input" />
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn-primary" data-testid="cat-create-btn">Add Category</button>
            </div>
          </form>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Subcategories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</td>
                  <td>{c.description}</td>
                  <td>{(c.subcategories || []).join(', ')}</td>
                  <td>
                    <button className="btn-sm danger" onClick={() => handleDeleteCategory(c.id)} data-testid={`delete-cat-${c.id}`}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subscribers Tab */}
      {tab === 'subscribers' && (
        <div data-testid="admin-subscribers-list">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)' }}>{s.email}</td>
                  <td>{new Date(s.subscribed_at).toLocaleDateString()}</td>
                  <td style={{ color: s.active ? '#22c55e' : '#ef4444' }}>{s.active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {subscribers.length === 0 && <div className="empty-state">No subscribers yet</div>}
        </div>
      )}
    </div>
  );
}
