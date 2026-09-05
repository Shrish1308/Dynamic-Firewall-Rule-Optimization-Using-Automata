import { useEffect, useState } from 'react';

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
        <h1>Rule Analysis</h1>
        <p>Detect conflicts, shadowing, and redundancy.</p>
      </div>

      {/* Summary stats */}
      <div className="stat-grid">
        <StatCard title="Total Rules"  value={total_rules} />
        <StatCard title="Conflicts"    value={summary.conflict} />
        <StatCard title="Shadowed"     value={summary.shadowed} />
        <StatCard title="Unreachable"  value={summary.unreachable} />
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
