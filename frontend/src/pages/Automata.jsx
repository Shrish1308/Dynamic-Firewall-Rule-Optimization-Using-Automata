import { useEffect, useState } from 'react';

import { getRules, getAutomaton } from '../services/api';
import { ProtocolBadge, ActionBadge } from '../components/Badge';

/** Very simple SVG-based automaton graph */
function AutomatonGraph({ automaton }) {
  if (!automaton) return null;
  const { states, transitions, initial_state, accepting_states, dead_states } = automaton;

  // Assign x/y positions in a horizontal flow with increased spacing
  const step = 160; 
  const positions = {};
  states.forEach((s, i) => {
    positions[s] = { x: 60 + i * step, y: 160 }; // Increased y-position to leave space for arcs
  });

  const stateColor = (s) => {
    if (accepting_states.includes(s)) return 'var(--clr-success)';
    if (dead_states.includes(s))      return 'var(--clr-danger)';
    if (s === initial_state)          return 'var(--clr-accent)';
    return 'var(--clr-border-2)';
  };

  const width = 60 + states.length * step + 60;
  
  // Track occurrences of transitions to prevent overlapping paths/text
  const transitionCounts = {};

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '20px' }}>
      <svg width={width} height={320} style={{ fontFamily: 'var(--font-mono)' }}>
        {/* Transitions */}
        {transitions.map((t, i) => {
          const from = positions[t.from];
          const to   = positions[t.to];
          if (!from || !to) return null;
          
          const pairKey = [t.from, t.to].sort().join('-');
          if (!transitionCounts[pairKey]) transitionCounts[pairKey] = 0;
          const count = transitionCounts[pairKey]++;
          
          const isSelf  = t.from === t.to;
          const dist = Math.abs(states.indexOf(t.to) - states.indexOf(t.from));
          
          // Determine arc height and direction
          const direction = states.indexOf(t.to) < states.indexOf(t.from) ? 1 : -1;
          const arcHeight = isSelf ? 50 + count * 20 : 30 + dist * 25 + count * 20;
          const midX = (from.x + to.x) / 2;
          const midY = isSelf ? from.y - arcHeight : from.y + direction * arcHeight;
          
          return (
            <g key={i}>
              {isSelf ? (
                <path d={`M${from.x - 10},${from.y - 15} C${from.x - 30},${midY - 10} ${from.x + 30},${midY - 10} ${from.x + 10},${from.y - 15}`}
                  fill="none" stroke="var(--clr-border-2)" strokeWidth={1.5} markerEnd="url(#arrow)" />
              ) : (
                <path d={`M${from.x + (direction === -1 ? 18 : -18)},${from.y} Q${midX},${midY} ${to.x + (direction === -1 ? -18 : 18)},${to.y}`}
                  fill="none" stroke="var(--clr-border-2)" strokeWidth={1.5} markerEnd="url(#arrow)" />
              )}
            </g>
          );
        })}

        {/* Arrow marker */}
        <defs>
          <marker id="arrow" markerWidth={8} markerHeight={8} refX={7} refY={4} orient="auto">
            <path d="M0,0 L0,8 L8,4 z" fill="var(--clr-border-2)" />
          </marker>
        </defs>

        {/* States */}
        {states.map((s) => {
          const p = positions[s];
          return (
            <g key={s}>
              <circle cx={p.x} cy={p.y} r={18}
                fill="var(--clr-surface-2)"
                stroke={stateColor(s)}
                strokeWidth={accepting_states.includes(s) ? 2.5 : 1.5} />
              {accepting_states.includes(s) && (
                <circle cx={p.x} cy={p.y} r={14} fill="none" stroke={stateColor(s)} strokeWidth={1} />
              )}
              <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fill="var(--clr-text)" fontWeight={600}>{s}</text>
              {s === initial_state && (
                <polygon points={`${p.x - 28},${p.y} ${p.x - 22},${p.y - 5} ${p.x - 22},${p.y + 5}`}
                  fill="var(--clr-accent)" />
              )}
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="chip-list" style={{ marginTop:8 }}>
        {[
          { color:'var(--clr-accent)',   label:'Initial'  },
          { color:'var(--clr-success)',  label:'Accept'   },
          { color:'var(--clr-danger)',   label:'Reject'   },
          { color:'var(--clr-border-2)',label:'Normal'   },
        ].map(l => (
          <span key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.72rem', color:'var(--clr-text-muted)' }}>
            <span style={{ width:10, height:10, borderRadius:'50%', background:l.color, display:'inline-block' }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Automata() {
  const [rules, setRules]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [automaton, setAutomaton] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { getRules().then(setRules); }, []);

  const handleSelect = async (rule) => {
    setSelected(rule);
    setAutomaton(null);
    setLoading(true);
    const a = await getAutomaton(rule.id);
    setAutomaton(a);
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Automata Visualizer</h1>
        <p>Inspect rule DFA representations.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20 }}>
        {/* Rule list panel */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--clr-border)', fontSize:'0.78rem', fontWeight:700, color:'var(--clr-text-muted)', textTransform:'uppercase', letterSpacing:'0.7px' }}>
            Select Rule
          </div>
          {rules.map(r => (
            <button key={r.id}
              onClick={() => handleSelect(r)}
              style={{
                display:'flex', alignItems:'center', gap:10, width:'100%', padding:'12px 16px',
                background: selected?.id === r.id ? 'rgba(79,142,247,0.1)' : 'transparent',
                borderLeft: selected?.id === r.id ? '3px solid var(--clr-accent)' : '3px solid transparent',
                color: selected?.id === r.id ? 'var(--clr-accent)' : 'var(--clr-text-muted)',
                border:'none', borderBottom:'1px solid var(--clr-border)', cursor:'pointer',
                fontFamily:'var(--font-mono)', fontSize:'0.82rem', textAlign:'left',
                transition:'all 0.15s',
              }}>
              <span style={{ fontWeight:700, minWidth:30 }}>{r.id}</span>
              <span style={{ fontSize:'0.75rem', color:'var(--clr-text-dim)' }}>p{r.priority}</span>
              <ActionBadge action={r.action} />
            </button>
          ))}
        </div>

        {/* Automaton panel */}
        <div className="card">
          {!selected && (
            <div className="empty-state">

              <p>Select a rule to view its automaton.</p>
            </div>
          )}
          {selected && loading && (
            <div className="animate-pulse" style={{ height:200, borderRadius:'var(--radius)' }} />
          )}
          {selected && !loading && automaton && (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--clr-accent)' }}>{automaton.rule_id}</span>
                <ProtocolBadge protocol={selected.protocol} />
                <ActionBadge action={selected.action} />
                <span className="mono text-sm">{selected.source} → {selected.destination}</span>
              </div>
              <AutomatonGraph automaton={automaton} />
              <div style={{ marginTop:16, padding:14, background:'var(--clr-surface-2)', borderRadius:'var(--radius-sm)' }}>
                <div className="text-xs text-muted" style={{ marginBottom:6, fontWeight:700 }}>TRANSITIONS</div>
                {automaton.transitions.map((t, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', padding:'3px 0' }}>
                    <span className="mono" style={{ color:'var(--clr-accent)' }}>{t.from}</span>
                    <span className="mono text-muted" style={{ fontSize:'0.9rem' }}>→</span>
                    <span className="mono" style={{ color:'var(--clr-accent)' }}>{t.to}</span>
                    <span className="chip" style={{ fontSize:'0.68rem' }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
