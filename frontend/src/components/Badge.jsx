/** Badge — action, protocol, issue-type variants */
export function Badge({ variant = 'any', children, dot = false }) {
  return (
    <span className={`badge badge-${variant.toLowerCase()}`}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />}
      {children}
    </span>
  );
}

export function ActionBadge({ action }) {
  return <Badge variant={action === 'ALLOW' ? 'allow' : 'deny'}>{action}</Badge>;
}

export function ProtocolBadge({ protocol }) {
  return <Badge variant={protocol?.toLowerCase() ?? 'any'}>{protocol ?? 'ANY'}</Badge>;
}

export function IssueBadge({ type }) {
  const labels = { conflict: 'Conflict', shadowed: 'Shadowed', redundant: 'Redundant', unreachable: 'Unreachable' };
  return <Badge variant={type}>{labels[type] ?? type}</Badge>;
}
