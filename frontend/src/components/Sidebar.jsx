import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Shield, BarChart2,
  Zap, Play, GitBranch,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',           label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/rules',      label: 'Rules',        icon: Shield },
  { to: '/analysis',   label: 'Analysis',     icon: BarChart2 },
  { to: '/automata',   label: 'Automata',     icon: GitBranch },
  { to: '/simulator',  label: 'Simulator',    icon: Play },
  { to: '/optimize',   label: 'Optimization', icon: Zap },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Shield size={18} color="#fff" />
        </div>
        <div className="sidebar-logo-text">
          Fire<span>Optima</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-label">Navigation</div>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ marginBottom: 2, fontWeight: 600, color: 'var(--clr-text-dim)' }}>
          Module 0 — Foundation
        </div>
        <div>Mock data active</div>
      </div>
    </aside>
  );
}
