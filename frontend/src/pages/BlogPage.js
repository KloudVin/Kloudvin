import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { getArticles, getCategories } from '../api';

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All Topics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveFilter(cat);
    getCategories().then(setCategories).catch(console.error);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    getArticles(activeFilter === 'All Topics' ? null : activeFilter)
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeFilter]);

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    if (filter === 'All Topics') {
      setSearchParams({});
    } else {
      setSearchParams({ category: filter });
    }
  };

  const EMOJI_MAP = {
    Cloud: '\u2601\uFE0F',
    DevOps: '\u267E\uFE0F',
    Kubernetes: '\u2638',
    Networking: '\uD83D\uDD12',
    Linux: '\uD83D\uDC27',
    IaC: '\uD83D\uDCE6',
  };

  return (
    <div style={{ paddingTop: '4rem' }}>
      <section className="blog-hero" data-testid="blog-hero">
        <div className="section-label">// all articles</div>
        <h2 className="section-title">Blog</h2>
        <p className="section-desc">Every article — from cloud architecture to shell scripting</p>

        <div className="filter-tabs" data-testid="filter-tabs">
          <button
            className={`filter-tab ${activeFilter === 'All Topics' ? 'active' : ''}`}
            onClick={() => handleFilter('All Topics')}
            data-testid="filter-all"
          >
            All Topics
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-tab ${activeFilter === cat.name ? 'active' : ''}`}
              onClick={() => handleFilter(cat.name)}
              data-testid={`filter-${cat.id}`}
            >
              {EMOJI_MAP[cat.name] || ''} {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} data-testid="blog-articles">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : articles.length === 0 ? (
          <div className="empty-state" data-testid="no-articles">No articles found in this category.</div>
        ) : (
          <div className="articles-grid">
            {articles.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
