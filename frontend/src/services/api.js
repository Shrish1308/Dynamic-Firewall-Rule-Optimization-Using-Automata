/**
 * Centralized API service.
 *
 * Connected to FastAPI backend.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detail = Array.isArray(errorData.detail)
      ? errorData.detail.map((err) => `${err.loc?.join('.')}: ${err.msg}`).join('; ')
      : errorData.detail;
    throw new Error(detail || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

// ── Rule CRUD ──────────────────────────────────────────────────────────────

/** GET /rules */
export async function getRules() {
  const response = await fetch(`${BASE_URL}/rules`);
  return handleResponse(response);
}

/** POST /rules */
export async function createRule(rule) {
  const response = await fetch(`${BASE_URL}/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  });
  return handleResponse(response);
}

/** PUT /rules/{id} */
export async function updateRule(id, rule) {
  const response = await fetch(`${BASE_URL}/rules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  });
  return handleResponse(response);
}

/** DELETE /rules/{id} */
export async function deleteRule(id) {
  const response = await fetch(`${BASE_URL}/rules/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// ── Validation ─────────────────────────────────────────────────────────────

/** POST /validate  — body: { rules: Rule[] } */
export async function validateRules(rules) {
  const response = await fetch(`${BASE_URL}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rules }),
  });
  return handleResponse(response);
}

// ── Analysis ───────────────────────────────────────────────────────────────

/** GET /analysis */
export async function getAnalysis() {
  const response = await fetch(`${BASE_URL}/analysis`);
  return handleResponse(response);
}

// ── Automata ───────────────────────────────────────────────────────────────

/** GET /automata/{rule_id} */
export async function getAutomaton(ruleId) {
  const response = await fetch(`${BASE_URL}/automata/${ruleId}`);
  return handleResponse(response);
}

// ── Simulation ─────────────────────────────────────────────────────────────

/** POST /simulate  — body: Packet */
export async function simulatePacket(packet) {
  const response = await fetch(`${BASE_URL}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packet),
  });
  return handleResponse(response);
}

// ── Optimization ───────────────────────────────────────────────────────────

/** POST /optimize  — body: { rules: Rule[] } */
export async function optimizeRules(rules) {
  const response = await fetch(`${BASE_URL}/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rules }),
  });
  return handleResponse(response);
}

export { BASE_URL };
