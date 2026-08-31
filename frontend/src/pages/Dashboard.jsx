import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Zap, Play, BarChart2, GitBranch, ChevronRight } from 'lucide-react';
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
      <div className="hero-banner">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Shield size={22} color="var(--clr-accent)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Dynamic Firewall Rule Optimization
            </span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>
            Automata-Powered<br />
            <span style={{ background: 'linear-gradient(90deg, var(--clr-accent), var(--clr-accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Firewall Intelligence
            </span>
          </h1>
          <p style={{ color: 'var(--clr-text-muted)', maxWidth: 480 }}>
            Detect conflicts, shadowed rules and unreachable policies.
            Visualize automata, simulate packets, and optimize your rule set — all in one place.
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
          <StatCard title="Total Rules" value={rules.length} icon={Shield}
            iconColor="var(--clr-accent)" iconBg="rgba(79,142,247,0.12)" />
          <StatCard title="Issues Found" value={totalIssues} icon={AlertTriangle}
            iconColor="var(--clr-warning)" iconBg="rgba(251,191,36,0.12)"
            subtitle={`${analysis?.summary.conflict ?? 0} conflict · ${analysis?.summary.shadowed ?? 0} shadow`} />
          <StatCard title="Unreachable" value={analysis?.summary.unreachable ?? 0} icon={GitBranch}
            iconColor="var(--clr-accent-2)" iconBg="rgba(167,139,250,0.12)" />
          <StatCard title="Redundant" value={analysis?.summary.redundancy ?? 0} icon={BarChart2}
            iconColor="var(--clr-success)" iconBg="rgba(52,211,153,0.12)" />
        </div>
      )}

      {/* Quick links */}
      <div className="section-title">Quick Actions</div>
      <div className="grid-3 mb-6">
        {[
          { to: '/rules',     icon: Shield,   label: 'Manage Rules',       desc: 'Add, edit, or delete firewall rules' },
          { to: '/analysis',  icon: BarChart2,label: 'Run Analysis',        desc: 'Detect conflicts, shadows & redundancy' },
          { to: '/simulator', icon: Play,     label: 'Simulate Packet',    desc: 'Trace a packet through rule priority order' },
          { to: '/automata',  icon: GitBranch,label: 'View Automata',      desc: 'Visualize a rule as a DFA state machine' },
          { to: '/optimize',  icon: Zap,      label: 'Optimize Rules',     desc: 'Get recommendations to reduce rule count' },
        ].map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--clr-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = ''}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Icon size={18} color="var(--clr-accent)" />
                <ChevronRight size={14} color="var(--clr-text-dim)" />
              </div>
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
