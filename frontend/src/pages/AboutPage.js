import React from 'react';

export default function AboutPage() {
  return (
    <div className="about-page" data-testid="about-page">
      <div style={{ textAlign: 'center' }}>
        <div className="section-label">// about the author</div>
        <h2 className="section-title">Meet Vinod</h2>
      </div>

      <div className="about-layout">
        {/* Sidebar */}
        <div className="about-sidebar" data-testid="about-sidebar">
          <div className="about-avatar">VH</div>
          <div className="about-name">Vinod H</div>
          <div className="about-role">Senior Cloud Architect | Azure & AWS Expert</div>
          <div className="about-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Bangalore, India
          </div>
          <div className="about-socials">
            <a className="social-icon" href="https://www.linkedin.com/in/vinsvin/" target="_blank" rel="noopener noreferrer" data-testid="about-linkedin" title="LinkedIn">in</a>
            <a className="social-icon" href="https://github.com/KloudVin" target="_blank" rel="noopener noreferrer" data-testid="about-github" title="GitHub">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a className="social-icon" href="https://x.com/vinswin" target="_blank" rel="noopener noreferrer" data-testid="about-twitter" title="X">X</a>
            <a className="social-icon" href="mailto:h.vinod@gmail.com" data-testid="about-email" title="Email">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
          </div>
          <div className="about-stats">
            <div>
              <div className="about-stat-value">22+</div>
              <div className="about-stat-label">Years</div>
            </div>
            <div>
              <div className="about-stat-value">$11M+</div>
              <div className="about-stat-label">Savings</div>
            </div>
            <div>
              <div className="about-stat-value">99.99%</div>
              <div className="about-stat-label">Uptime</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="about-content" data-testid="about-content">
          <h2>Hello, I'm <span className="gradient-text">Vinod H</span></h2>
          <p>
            I'm a Senior Cloud Architect with 22+ years of experience in designing and implementing enterprise-scale cloud transformations across Azure and AWS. I specialize in multi-cloud architecture, Infrastructure as Code, DevSecOps integration, and large-scale datacenter migrations.
          </p>
          <p>
            I've successfully delivered $11M+ in cost savings through strategic cloud optimization and automation initiatives, and achieved 99.99% uptime for critical transaction platforms through automated recovery mechanisms. My expertise spans third-party security tools including Veracode, ForgeRock, Okta, Akamai, and Check Point.
          </p>
          <p>
            KloudVin is where I share everything I've learned in the trenches — from architecting multi-cloud platforms and implementing Zero Trust security to optimizing FinOps strategies. No fluff, no buzzwords — just practical, battle-tested knowledge from real enterprise environments including Merrill Lynch, XPERI, ATOS, and Aldar.
          </p>

          <div className="about-section-title">Core Expertise</div>
          <div className="expertise-list">
            {['Cloud Architecture', 'Infrastructure as Code', 'DevOps & CI/CD', 'Kubernetes (AKS/EKS)', 'Security & Zero Trust', 'Networking & DR', 'FinOps & Cost Optimization'].map(skill => (
              <span key={skill} className="expertise-tag">{skill}</span>
            ))}
          </div>

          <div className="about-section-title">Certifications</div>
          <div className="cert-list">
            <div className="cert-item">AZ-305: Azure Solutions Architect Expert</div>
            <div className="cert-item">AZ-104: Azure Administrator Associate</div>
            <div className="cert-item">AWS Solutions Architect — Professional</div>
          </div>

          <div className="about-section-title">Career Highlights</div>
          <div className="career-list">
            <div className="career-item">VDart Digital (Client: Aldar)</div>
            <div className="career-item">ATOS Global Solutions</div>
            <div className="career-item">XPERI Corporation</div>
            <div className="career-item">CenturyLink / Merrill Lynch</div>
            <div className="career-item">ANZ Operations & Technology</div>
            <div className="career-item" style={{ color: 'var(--accent-cyan)' }}>Employee of the Year 2017</div>
          </div>
        </div>
      </div>
    </div>
  );
}
