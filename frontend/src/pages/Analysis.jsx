import { useEffect, useState } from 'react';
import { BarChart2, AlertTriangle, Eye } from 'lucide-react';
import { getAnalysis } from '../services/api';
import { StatCard } from '../components/Card';
import { IssueBadge } from '../components/Badge';

const ISSUE_COLORS = {
  conflict:    'var(--clr-danger)',
  shadowed:    'var(--clr-warning)',
  redundant:   'var(--clr-info)',
  unreachable: 'var(--clr-accent-2)',
};

export default function Analysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAnalysis().then(a => { setAnalysis(a); setLoading(false); });
  }, []);

  if (loading) return (
    <div>
      <div className="page-header"><h1>Rule Analysis</h1></div>
      <div className="stat-grid">
        {[1,2,3,4].map(i => <div key={i} className="card stat-card animate-pulse" style={{ height: 110 }} />)}
      </div>
    </div>
  );

  const { summary, issues, total_rules } = analysis;

  return (
    <div>
      <div className="page-header">
        <h1><BarChart2 size={20} style={{ display:'inline', marginRight:8, color:'var(--clr-accent)' }} />Rule Analysis</h1>
        <p>Automata-based detection of conflicts, shadowing, redundancy and unreachable rules.</p>
      </div>

      {/* Summary stats */}
      <div className="stat-grid">
        <StatCard title="Total Rules"  value={total_rules}         icon={BarChart2} iconColor="var(--clr-accent)"   iconBg="rgba(79,142,247,0.12)" />
        <StatCard title="Conflicts"    value={summary.conflict}    icon={AlertTriangle} iconColor="var(--clr-danger)"   iconBg="rgba(248,113,113,0.12)" />
        <StatCard title="Shadowed"     value={summary.shadowed}    icon={AlertTriangle} iconColor="var(--clr-warning)"  iconBg="rgba(251,191,36,0.12)"  />
        <StatCard title="Unreachable"  value={summary.unreachable} icon={AlertTriangle} iconColor="var(--clr-accent-2)" iconBg="rgba(167,139,250,0.12)" />
      </div>

      {/* Issue list */}
      <div className="section-title">Detected Issues</div>
      {issues.length === 0 ? (
        <div className="card"><div className="empty-state"><p>No issues found. Rule set looks clean ✓</p></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {issues.map((issue, i) => (
            <div key={i} className="card" style={{
              borderLeft: `3px solid ${ISSUE_COLORS[issue.type] ?? 'var(--clr-border)'}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
              onClick={() => setSelected(selected?.type === issue.type && selected?.rule_ids.join() === issue.rule_ids.join() ? null : issue)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
                  <IssueBadge type={issue.type} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 }}>
                      Affected rules: {issue.rule_ids.map(id => (
                        <span key={id} className="chip" style={{ marginRight: 4 }}>{id}</span>
                      ))}
                    </div>
                    <div className="text-sm text-muted">{issue.explanation}</div>
                  </div>
                </div>
                <Eye size={15} color="var(--clr-text-dim)" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
