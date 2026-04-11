import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import ArticleCard from '../components/ArticleCard';
import { getArticles, getCategories, subscribe } from '../api';

export default function HomePage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState(null);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    getArticles().then(setArticles).catch(console.error);
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubLoading(true);
    setSubMsg(null);
    try {
      const result = await subscribe(email);
      setSubMsg({ type: 'success', text: result.message });
      setEmail('');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setSubMsg({ type: 'error', text: typeof detail === 'string' ? detail : 'Subscription failed. Please try again.' });
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="hero" data-testid="hero-section">
        <div className="hero-terminal" data-testid="hero-terminal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          ~/kloudvin $ <span className="cursor"></span>
        </div>
        <h1>
          Where <span className="gradient-text">Cloud Meets Code</span>
          <br />& Infrastructure Speaks
        </h1>
        <p className="hero-desc">
          Deep-dive technical articles on Cloud Architecture, DevOps, Kubernetes, IaC, and everything IT — by a Senior Cloud Architect with 22+ years in enterprise environments.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => navigate('/blog')} data-testid="hero-explore-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            Explore Articles
          </button>
          <button className="btn-outline" onClick={() => navigate('/about')} data-testid="hero-about-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            About Vinod
          </button>
        </div>
        <div className="hero-stats" data-testid="hero-stats">
          <div className="stat-item">
            <div className="stat-value">22+</div>
            <div className="stat-label">Years in IT</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">$11M+</div>
            <div className="stat-label">Cost Savings</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">99.99%</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" id="categories" data-testid="categories-section">
        <div className="section-label">// categories</div>
        <h2 className="section-title">What I Write About</h2>
        <p className="section-desc">From cloud foundations to cutting-edge DevOps — the full IT stack covered</p>
        <div className="categories-grid">
          {categories.map(cat => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      <section className="section" data-testid="featured-section">
        <div className="section-label">// latest articles</div>
        <h2 className="section-title">Featured Posts</h2>
        <p className="section-desc">Practical, real-world technical guides from production experience</p>
        <div className="articles-grid">
          {articles.slice(0, 3).map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
        {articles.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn-outline" onClick={() => navigate('/blog')} data-testid="view-all-articles-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              View All Articles
            </button>
          </div>
        )}
      </section>

      {/* Subscribe */}
      <section className="subscribe-section" id="subscribe" data-testid="subscribe-section">
        <div className="subscribe-card">
          <h2>Stay in the <span className="gradient-text">Loop</span></h2>
          <p>Get notified when new articles drop. No spam — just quality tech content.</p>
          <form className="subscribe-form" onSubmit={handleSubscribe} data-testid="subscribe-form">
            <input
              type="email"
              className="subscribe-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="subscribe-email-input"
            />
            <button type="submit" className="btn-primary" disabled={subLoading} data-testid="subscribe-submit-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              {subLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {subMsg && (
            <div className={`subscribe-msg ${subMsg.type}`} data-testid="subscribe-msg">
              {subMsg.text}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
