export function Card({ children, className = '', style }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function StatCard({ title, value, subtitle }) {
  return (
    <div className="card stat-card">
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
      {subtitle && <div className="text-sm text-muted mt-1">{subtitle}</div>}
    </div>
  );
}
