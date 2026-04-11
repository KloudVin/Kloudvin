import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="nav-logo" onClick={() => navTo('/')} data-testid="nav-logo">
        <svg viewBox="0 0 36 36" fill="none">
          <path d="M18 6C10.268 6 4 10.477 4 16c0 3.314 2.686 6.314 7 8.314V28l4-3c1-.1 2-.15 3-.15s2 .05 3 .15l4 3v-3.686c4.314-2 7-5 7-8.314 0-5.523-6.268-10-14-10z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M10 16h3M15 13v6M20 13c2 0 3 1 3 3s-1 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        KloudVin
      </div>

      <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} data-testid="mobile-menu-btn">
        {menuOpen ? '\u2715' : '\u2630'}
      </button>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`} data-testid="nav-links">
        <span className={`nav-link ${isActive('/') && location.hash === '' ? 'active' : ''}`} onClick={() => navTo('/')} data-testid="nav-home">HOME</span>
        <span className="nav-link" onClick={() => scrollToSection('categories')} data-testid="nav-topics">TOPICS</span>
        <span className={`nav-link ${isActive('/blog') ? 'active' : ''}`} onClick={() => navTo('/blog')} data-testid="nav-blog">BLOG</span>
        <span className={`nav-link ${isActive('/about') ? 'active' : ''}`} onClick={() => navTo('/about')} data-testid="nav-about">ABOUT</span>
        <span className="nav-link" onClick={() => scrollToSection('subscribe')} data-testid="nav-subscribe">SUBSCRIBE</span>
        {user && user.role && (
          <button className="nav-admin-btn" onClick={() => navTo('/admin')} data-testid="nav-admin-btn">ADMIN</button>
        )}
      </div>
    </nav>
  );
}
