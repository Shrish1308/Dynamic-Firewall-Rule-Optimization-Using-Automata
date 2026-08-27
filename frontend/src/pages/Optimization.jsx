import { useState } from 'react';
import { Zap, CheckCircle2, AlertCircle, TrendingDown } from 'lucide-react';
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
        <h1><Zap size={20} style={{ display:'inline', marginRight:8, color:'var(--clr-accent)' }} />Optimization Engine</h1>
        <p>Generate safe rule-removal recommendations while preserving first-match semantics.</p>
      </div>

      <div className="card mb-6" style={{ background: 'rgba(79,142,247,0.04)' }}>
        <p className="text-sm text-muted" style={{ marginBottom: 14 }}>
          The optimizer analyses your rule set using automata intersection results to identify
          redundant, shadowed and unreachable rules. It generates conservative recommendations —
          it never silently removes rules.
        </p>
        <Button id="run-optimize-btn" icon={Zap} onClick={handleOptimize} disabled={loading}>
          {loading ? 'Optimizing…' : 'Run Optimization'}
        </Button>
      </div>

      {result && (
        <>
          {/* Metrics */}
          <div className="stat-grid mb-6">
            <StatCard title="Original Rules" value={result.original_count}
              icon={Zap} iconColor="var(--clr-text-muted)" iconBg="rgba(148,163,184,0.1)" />
            <StatCard title="Optimized Rules" value={result.optimized_count}
              icon={CheckCircle2} iconColor="var(--clr-success)" iconBg="rgba(52,211,153,0.12)" />
            <StatCard title="Reduction" value={`${result.reduction_percent}%`}
              icon={TrendingDown} iconColor="var(--clr-accent)" iconBg="rgba(79,142,247,0.12)"
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
