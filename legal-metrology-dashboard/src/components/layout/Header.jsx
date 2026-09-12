import React from 'react';
import { Bell } from 'lucide-react';
import './Header.css';

function Header({ title, subtitle }) {
  return (
    <header className="top-header">
      {/* Page Title & Subtitle */}
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        {subtitle && <span className="header-subtitle">{subtitle}</span>}
      </div>

      {/* Right Controls & Profile */}
      <div className="header-right">
        {/* Jurisdiction / Zone tag */}
        <div className="jurisdiction-badge" title="Active Enforcement Zone">
          <span className="jurisdiction-badge-dot" />
          <span>Zone: North Division</span>
        </div>

        {/* Alerts / Notifications */}
        <button 
          className="notification-btn" 
          type="button" 
          title="3 Pending Violations requiring review"
          aria-label="Compliance notifications"
        >
          <Bell size={18} />
          <span className="notification-badge">3</span>
        </button>

        <div className="header-divider" />

        {/* Supervisor Profile Area */}
        <div className="profile-pill">
          <div className="profile-avatar">
            RK
          </div>
          <div className="profile-info">
            <span className="profile-name">Rajesh Kumar</span>
            <span className="profile-role">Senior Enforcement Officer</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
