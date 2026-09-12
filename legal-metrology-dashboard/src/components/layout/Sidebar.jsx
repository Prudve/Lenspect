import React from 'react';
import { 
  LayoutDashboard, 
  PackageCheck, 
  AlertTriangle, 
  FileBarChart, 
  Users, 
  History, 
  ShieldCheck 
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'scanned-products', label: 'Scanned Products', icon: PackageCheck },
  { id: 'violations', label: 'Violations', icon: AlertTriangle },
  { id: 'compliance-reports', label: 'Compliance Reports', icon: FileBarChart },
  { id: 'inspectors', label: 'Inspectors', icon: Users },
  { id: 'inspection-history', label: 'Inspection History', icon: History }
];

function Sidebar({ currentSection, onSelectSection }) {
  return (
    <aside className="sidebar">
      {/* Official Government / Legal Metrology Header */}
      <div className="sidebar-header">
        <div className="sidebar-emblem">
          <ShieldCheck size={26} strokeWidth={2.2} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-org-sub">Dept. of Consumer Affairs</span>
          <span className="sidebar-portal-title">Legal Metrology</span>
          <span className="sidebar-rule-tag">PC Rules, 2011</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Enforcement Console</span>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectSection(item.id)}
              type="button"
            >
              <span className="nav-item-icon">
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="sidebar-footer">
        <div className="system-status-indicator">
          <div className="status-dot-wrapper">
            <span className="status-dot" />
            <span>Enforcement Online</span>
          </div>
          <span className="system-version">v1.0-SIH</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
