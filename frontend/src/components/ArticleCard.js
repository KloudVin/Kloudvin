import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ArticleCard({ article }) {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className="article-card"
      onClick={() => navigate(`/article/${article.slug}`)}
      data-testid={`article-card-${article.slug}`}
    >
      <div className="article-card-image">
        <div className="article-card-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
      </div>
      <div className="article-card-body">
        <div className="article-meta">
          <span className="article-category-badge" data-testid={`article-category-${article.slug}`}>
            {article.category}
          </span>
          <span className="article-date">{formatDate(article.created_at)}</span>
        </div>
        <h3>{article.title}</h3>
        <p className="article-card-desc">{article.description}</p>
      </div>
      <div className="article-card-footer">
        <span className="article-read-time" data-testid={`article-readtime-${article.slug}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {article.read_time || 'Quick read'}
        </span>
        <span className="article-read-link" data-testid={`article-read-${article.slug}`}>
          Read <span>&rarr;</span>
        </span>
      </div>
    </div>
  );
}
