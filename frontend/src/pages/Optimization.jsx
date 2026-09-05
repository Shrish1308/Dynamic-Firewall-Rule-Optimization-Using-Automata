import { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { optimizeRules, getRules } from '../services/api';
import { ActionBadge, ProtocolBadge } from '../components/Badge';
import { Button } from '../components/Button';
import { StatCard } from '../components/Card';

export default function Optimization() {
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    const rules = await getRules();
    const r     = await optimizeRules(rules);
    setResult(r);
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Optimization Engine</h1>
        <p>Generate safe rule-removal recommendations.</p>
      </div>

      <div className="card mb-6" style={{ background: 'rgba(79,142,247,0.04)' }}>
        <p className="text-sm text-muted" style={{ marginBottom: 14 }}>
          Identify and remove redundant rules.
        </p>
        <Button id="run-optimize-btn" onClick={handleOptimize} disabled={loading}>
          {loading ? 'Optimizing…' : 'Run Optimization'}
        </Button>
      </div>

      {result && (
        <>
          {/* Metrics */}
          <div className="stat-grid mb-6">
            <StatCard title="Original Rules" value={result.original_count} />
            <StatCard title="Optimized Rules" value={result.optimized_count} />
            <StatCard title="Reduction" value={`${result.reduction_percent}%`}
              subtitle={`${result.original_count - result.optimized_count} rules removed`} />
          </div>

          {/* Recommendations */}
          <div className="section-title">Recommendations</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
            {result.recommendations.map((rec, i) => (
              <div key={i} className="card" style={{
                borderLeft: `3px solid ${rec.safe ? 'var(--clr-success)' : 'var(--clr-warning)'}`,
              }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  {rec.safe
                    ? <CheckCircle2 size={18} color="var(--clr-success)" style={{ flexShrink:0, marginTop:2 }} />
                    : <AlertCircle  size={18} color="var(--clr-warning)" style={{ flexShrink:0, marginTop:2 }} />
                  }
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span className="mono" style={{ color:'var(--clr-accent)', fontWeight:600 }}>{rec.rule_id}</span>
                      <span className="badge" style={{
                        background: rec.safe ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                        color: rec.safe ? 'var(--clr-success)' : 'var(--clr-warning)',
                        border: `1px solid ${rec.safe ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                      }}>
                        {rec.safe ? 'Safe to remove' : 'Admin review needed'}
                      </span>
                    </div>
                    <div className="text-sm text-muted">{rec.reason}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Optimized rule table */}
          <div className="section-title">Optimized Rule Set</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Priority</th><th>Source</th><th>Destination</th>
                  <th>Proto</th><th>Dst Port</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {result.optimized_rules.map(r => (
                  <tr key={r.id}>
                    <td><span className="mono">{r.id}</span></td>
                    <td>{r.priority}</td>
                    <td><span className="mono">{r.source}</span></td>
                    <td><span className="mono">{r.destination}</span></td>
                    <td><ProtocolBadge protocol={r.protocol} /></td>
                    <td>{r.destination_port ?? <span className="text-muted">any</span>}</td>
                    <td><ActionBadge action={r.action} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
