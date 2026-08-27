export function Card({ children, className = '', style }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, iconColor = '#4f8ef7', iconBg = 'rgba(79,142,247,0.12)', subtitle }) {
  return (
    <div className="card stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>
        <Icon size={18} color={iconColor} />
      </div>
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
      {subtitle && <div className="text-sm text-muted mt-1">{subtitle}</div>}
    </div>
  );
}
