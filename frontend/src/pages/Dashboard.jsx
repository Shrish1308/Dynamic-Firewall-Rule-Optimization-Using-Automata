import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { StatCard } from '../components/Card';
import { IssueBadge } from '../components/Badge';
import { getRules, getAnalysis } from '../services/api';

export default function Dashboard() {
  const [rules, setRules] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRules(), getAnalysis()]).then(([r, a]) => {
      setRules(r);
      setAnalysis(a);
      setLoading(false);
    });
  }, []);

  const totalIssues = analysis
    ? Object.values(analysis.summary).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', padding: '10px 0' }}>
          <img src={logo} alt="FireOptima" style={{ width: 140, height: 140, objectFit: 'contain', marginBottom: 16, borderRadius: 16 }} />
          <p style={{ color: 'var(--clr-text-muted)', maxWidth: 480, fontSize: '1.1rem' }}>
            Analyze, simulate, and optimize firewall rules using automata.
          </p>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="stat-grid">
          {[1,2,3,4].map(i => <div key={i} className="card stat-card animate-pulse" style={{ height: 110 }} />)}
        </div>
      ) : (
        <div className="stat-grid">
          <StatCard title="Total Rules" value={rules.length} />
          <StatCard title="Issues Found" value={totalIssues} 
            subtitle={`${analysis?.summary.conflict ?? 0} conflict · ${analysis?.summary.shadowed ?? 0} shadow`} />
          <StatCard title="Unreachable" value={analysis?.summary.unreachable ?? 0} />
          <StatCard title="Redundant" value={analysis?.summary.redundancy ?? 0} />
        </div>
      )}

      {/* Quick links */}
      <div className="section-title">Quick Actions</div>
      <div className="grid-3 mb-6">
        {[
          { to: '/rules',     label: 'Manage Rules',       desc: 'Create, edit, or delete rules.' },
          { to: '/analysis',  label: 'Run Analysis',       desc: 'Find conflicts and redundancy.' },
          { to: '/simulator', label: 'Simulate Packet',    desc: 'Trace packet paths.' },
          { to: '/automata',  label: 'View Automata',      desc: 'Visualize DFA state machines.' },
          { to: '/optimize',  label: 'Optimize Rules',     desc: 'Reduce rule count safely.' },
        ].map(({ to, label, desc }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--clr-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = ''}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
              <div className="text-sm text-muted">{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent issues */}
      {analysis && analysis.issues.length > 0 && (
        <>
          <div className="section-title">Recent Issues</div>
          <div className="card">
            {analysis.issues.map((issue, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, padding: '14px 0',
                borderBottom: i < analysis.issues.length - 1 ? '1px solid var(--clr-border)' : 'none'
              }}>
                <IssueBadge type={issue.type} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                    Rules: {issue.rule_ids.join(', ')}
                  </div>
                  <div className="text-sm text-muted">{issue.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
