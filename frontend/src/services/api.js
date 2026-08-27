/**
 * Centralized API service.
 *
 * ALL backend communication must go through this file — never call fetch()
 * directly inside a component or page.
 *
 * CURRENT STATE: Module 0 / 1 — returns mock data.
 * When the backend is ready (Module 9), replace each function body with a
 * real fetch() call. Do NOT change the function signatures or return shapes.
 *
 * Base URL is read from an env variable so it is easy to switch without
 * touching component code:
 *   VITE_API_BASE_URL=http://localhost:8000   (create a .env.local file)
 */

import {
  MOCK_RULES,
  MOCK_ANALYSIS,
  MOCK_OPTIMIZATION,
  MOCK_AUTOMATON,
  MOCK_SIMULATION,
} from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/** Simulated network delay so the UI loading states are exercised */
const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

// ── Rule CRUD ──────────────────────────────────────────────────────────────

/** GET /rules */
export async function getRules() {
  await delay();
  return [...MOCK_RULES];
}

/** POST /rules */
export async function createRule(rule) {
  await delay();
  const newRule = { ...rule, id: `R${Date.now()}` };
  return newRule;
}

/** PUT /rules/{id} */
export async function updateRule(id, rule) {
  await delay();
  return { ...rule, id };
}

/** DELETE /rules/{id} */
export async function deleteRule(id) {
  await delay();
  return { deleted: id };
}

// ── Validation ─────────────────────────────────────────────────────────────

/** POST /validate  — body: { rules: Rule[] } */
export async function validateRules(rules) {
  await delay();
  // Mock: all rules valid except those with no source/destination
  const errors = rules
    .filter((r) => !r.source || !r.destination)
    .map((r) => ({ rule_id: r.id, field: 'source/destination', message: 'Required field missing' }));
  return { valid: errors.length === 0, errors };
}

// ── Analysis ───────────────────────────────────────────────────────────────

/** GET /analysis */
export async function getAnalysis() {
  await delay(600);
  return MOCK_ANALYSIS;
}

// ── Automata ───────────────────────────────────────────────────────────────

/** GET /automata/{rule_id} */
export async function getAutomaton(ruleId) {
  await delay(500);
  return { ...MOCK_AUTOMATON, rule_id: ruleId };
}

// ── Simulation ─────────────────────────────────────────────────────────────

/** POST /simulate  — body: Packet */
export async function simulatePacket(packet) {
  await delay(700);
  return { ...MOCK_SIMULATION, packet };
}

// ── Optimization ───────────────────────────────────────────────────────────

/** POST /optimize  — body: { rules: Rule[] } */
export async function optimizeRules(rules) {
  await delay(800);
  return MOCK_OPTIMIZATION;
}

export { BASE_URL };
