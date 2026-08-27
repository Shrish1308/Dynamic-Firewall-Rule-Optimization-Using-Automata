import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { getRules, createRule, updateRule, deleteRule } from '../services/api';
import { ActionBadge, ProtocolBadge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal, ConfirmModal } from '../components/Modal';
import { Table } from '../components/Table';

const EMPTY_RULE = {
  priority: '', source: '', destination: '',
  protocol: 'TCP', source_port: '', destination_port: '', action: 'ALLOW',
};

const PROTOCOLS = ['TCP', 'UDP', 'ICMP', 'ANY'];
const ACTIONS   = ['ALLOW', 'DENY'];

function RuleForm({ value, onChange, errors = {} }) {
  const f = (field) => (e) => onChange({ ...value, [field]: e.target.value || (e.target.value === '' ? null : e.target.value) });
  return (
    <div className="form-grid">
      <div className="form-group">
        <label className="form-label">Priority *</label>
        <input id="rule-priority" className={`form-control${errors.priority ? ' error' : ''}`}
          type="number" min="1" placeholder="e.g. 1" value={value.priority} onChange={f('priority')} />
        {errors.priority && <span className="form-error">{errors.priority}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Action *</label>
        <select id="rule-action" className="form-control" value={value.action} onChange={f('action')}>
          {ACTIONS.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Source IP / CIDR *</label>
        <input id="rule-source" className={`form-control${errors.source ? ' error' : ''}`}
          placeholder="192.168.1.0/24" value={value.source} onChange={f('source')} />
        {errors.source && <span className="form-error">{errors.source}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Destination IP / CIDR *</label>
        <input id="rule-destination" className={`form-control${errors.destination ? ' error' : ''}`}
          placeholder="10.0.0.0/24" value={value.destination} onChange={f('destination')} />
        {errors.destination && <span className="form-error">{errors.destination}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Protocol</label>
        <select id="rule-protocol" className="form-control" value={value.protocol} onChange={f('protocol')}>
          {PROTOCOLS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Source Port</label>
        <input id="rule-source-port" className="form-control" type="number" min="0" max="65535"
          placeholder="Any" value={value.source_port ?? ''} onChange={f('source_port')} />
      </div>

      <div className="form-group">
        <label className="form-label">Destination Port</label>
        <input id="rule-destination-port" className="form-control" type="number" min="0" max="65535"
          placeholder="Any" value={value.destination_port ?? ''} onChange={f('destination_port')} />
      </div>
    </div>
  );
}

function validate(rule) {
  const errors = {};
  if (!rule.priority || Number(rule.priority) < 1) errors.priority = 'Must be a positive integer';
  if (!rule.source) errors.source = 'Source IP/CIDR is required';
  if (!rule.destination) errors.destination = 'Destination IP/CIDR is required';
  return errors;
}

export default function Rules() {
  const [rules, setRules]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = new rule
  const [formData, setFormData] = useState(EMPTY_RULE);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => { setLoading(true); getRules().then(r => { setRules(r); setLoading(false); }); };
  useEffect(load, []);

  const openNew  = () => { setEditTarget(null); setFormData(EMPTY_RULE); setFormErrors({}); setFormOpen(true); };
  const openEdit = (rule) => { setEditTarget(rule); setFormData({ ...rule, source_port: rule.source_port ?? '', destination_port: rule.destination_port ?? '' }); setFormErrors({}); setFormOpen(true); };

  const handleSave = async () => {
    const errs = validate(formData);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    const payload = {
      ...formData,
      priority: Number(formData.priority),
      source_port: formData.source_port !== '' ? Number(formData.source_port) : null,
      destination_port: formData.destination_port !== '' ? Number(formData.destination_port) : null,
    };
    if (editTarget) {
      const updated = await updateRule(editTarget.id, payload);
      setRules(r => r.map(x => x.id === editTarget.id ? updated : x));
    } else {
      const created = await createRule(payload);
      setRules(r => [...r, created]);
    }
    setFormOpen(false);
  };

  const handleDelete = async () => {
    await deleteRule(deleteTarget.id);
    setRules(r => r.filter(x => x.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const columns = [
    { key: 'id',       label: 'ID',       render: r => <span className="mono">{r.id}</span> },
    { key: 'priority', label: 'Priority'  },
    { key: 'source',   label: 'Source',   render: r => <span className="mono">{r.source}</span> },
    { key: 'destination', label: 'Destination', render: r => <span className="mono">{r.destination}</span> },
    { key: 'protocol', label: 'Proto',    render: r => <ProtocolBadge protocol={r.protocol} /> },
    { key: 'source_port', label: 'Src Port', render: r => r.source_port ?? <span className="text-muted">any</span> },
    { key: 'destination_port', label: 'Dst Port', render: r => r.destination_port ?? <span className="text-muted">any</span> },
    { key: 'action',   label: 'Action',   render: r => <ActionBadge action={r.action} /> },
    {
      label: 'Actions',
      render: r => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(r)} aria-label="Edit rule">
            <Pencil size={13} />
          </button>
          <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteTarget(r)} aria-label="Delete rule">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1><Shield size={20} style={{ display:'inline', marginRight:8, color:'var(--clr-accent)' }} />Firewall Rules</h1>
          <p>Manage your firewall rule set — create, edit, and delete rules.</p>
        </div>
        <Button id="add-rule-btn" icon={Plus} onClick={openNew}>Add Rule</Button>
      </div>

      {loading
        ? <div className="animate-pulse" style={{ height: 200, background: 'var(--clr-surface)', borderRadius: 'var(--radius-lg)' }} />
        : <Table columns={columns} rows={rules} emptyMessage="No rules yet. Click 'Add Rule' to get started." />
      }

      {/* Create / Edit modal */}
      <Modal
        open={formOpen}
        title={editTarget ? `Edit Rule ${editTarget.id}` : 'New Firewall Rule'}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setFormOpen(false)}>Cancel</button>
            <button className="btn btn-primary" id="save-rule-btn" onClick={handleSave}>
              {editTarget ? 'Save Changes' : 'Create Rule'}
            </button>
          </>
        }
      >
        <RuleForm value={formData} onChange={setFormData} errors={formErrors} />
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Rule"
        message={`Are you sure you want to delete rule ${deleteTarget?.id}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
