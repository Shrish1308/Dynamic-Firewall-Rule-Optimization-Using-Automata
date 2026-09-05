import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { simulatePacket } from '../services/api';
import { ActionBadge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const EMPTY_PACKET = { source: '', destination: '', protocol: 'TCP', source_port: '', destination_port: '' };

export default function Simulator() {
  const [packet, setPacket]     = useState(EMPTY_PACKET);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [submitError, setSubmitError] = useState('');

  const validate = (p) => {
    const e = {};
    if (!p.source)      e.source      = 'Required';
    if (!p.destination) e.destination = 'Required';
    return e;
  };

  const handleSimulate = async () => {
    const e = validate(packet);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitError('');
    setLoading(true);
    const payload = {
      ...packet,
      source_port:      packet.source_port      !== '' ? Number(packet.source_port)      : null,
      destination_port: packet.destination_port !== '' ? Number(packet.destination_port) : null,
    };
    try {
      const r = await simulatePacket(payload);
      setResult(r);
    } catch (error) {
      setSubmitError(error.message || 'Unable to simulate packet');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => (e) => setPacket(p => ({ ...p, [field]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <h1>Packet Simulator</h1>
        <p>Trace packet paths through rules.</p>
      </div>

      {/* Input form */}
      <Card className="mb-4">
        <div className="section-title">Packet Definition</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Source IP *</label>
            <input id="sim-src" className={`form-control${errors.source ? ' error' : ''}`}
              placeholder="192.168.1.10" value={packet.source} onChange={f('source')} />
            {errors.source && <span className="form-error">{errors.source}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Destination IP *</label>
            <input id="sim-dst" className={`form-control${errors.destination ? ' error' : ''}`}
              placeholder="10.0.0.5" value={packet.destination} onChange={f('destination')} />
            {errors.destination && <span className="form-error">{errors.destination}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Protocol</label>
            <select id="sim-proto" className="form-control" value={packet.protocol} onChange={f('protocol')}>
              {['TCP','UDP','ICMP','ANY'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Source Port</label>
            <input id="sim-sport" className="form-control" type="number" placeholder="Any" value={packet.source_port} onChange={f('source_port')} />
          </div>
          <div className="form-group">
            <label className="form-label">Destination Port</label>
            <input id="sim-dport" className="form-control" type="number" placeholder="Any" value={packet.destination_port} onChange={f('destination_port')} />
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <Button id="run-sim-btn" onClick={handleSimulate} disabled={loading}>
            {loading ? 'Simulating…' : 'Run Simulation'}
          </Button>
        </div>
        {submitError && <div className="form-error" style={{ marginTop: 12 }}>{submitError}</div>}
      </Card>

      {/* Result */}
      {result && (
        <>
          {/* Final verdict */}
          <div className="card mb-4" style={{
            borderColor: result.final_action === 'ALLOW' ? 'var(--clr-success)' : 'var(--clr-danger)',
            background: result.final_action === 'ALLOW' ? 'rgba(52,211,153,0.06)' : 'rgba(248,113,113,0.06)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              {result.final_action === 'ALLOW'
                ? <CheckCircle2 size={28} color="var(--clr-success)" />
                : <XCircle size={28} color="var(--clr-danger)" />
              }
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  Packet <ActionBadge action={result.final_action} />
                </div>
                <div className="text-sm text-muted">
                  Matched by rule <span className="chip">{result.matching_rule_id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rule trace */}
          <div className="section-title">Rule Evaluation Trace</div>
          <Card>
            {result.checked_rules.map((step, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0',
                borderBottom: i < result.checked_rules.length - 1 ? '1px solid var(--clr-border)' : 'none' }}>
                {step.matched
                  ? <CheckCircle2 size={16} color="var(--clr-success)" />
                  : <XCircle size={16} color="var(--clr-danger)" />
                }
                <span className="mono" style={{ color:'var(--clr-accent)' }}>{step.rule_id}</span>
                <span className="mono text-muted" style={{ fontSize:'0.9rem' }}>→</span>
                <span className="text-sm text-muted">{step.reason}</span>
              </div>
            ))}
          </Card>

          {/* Automaton path */}
          {result.automaton_path && (
            <>
              <div className="section-title mt-4">Automaton Traversal Path</div>
              <Card>
                <div className="chip-list">
                  {result.automaton_path.map((state, i) => (
                    <span key={i} style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <span className={`chip`} style={{
                        background: state === 'ACCEPT' ? 'rgba(52,211,153,0.1)' : state === 'REJECT' ? 'rgba(248,113,113,0.1)' : '',
                        color: state === 'ACCEPT' ? 'var(--clr-success)' : state === 'REJECT' ? 'var(--clr-danger)' : '',
                        borderColor: state === 'ACCEPT' ? 'rgba(52,211,153,0.3)' : state === 'REJECT' ? 'rgba(248,113,113,0.3)' : '',
                      }}>{state}</span>
                      {i < result.automaton_path.length - 1 && <span className="mono text-muted" style={{ fontSize:'0.9rem' }}>→</span>}
                    </span>
                  ))}
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
