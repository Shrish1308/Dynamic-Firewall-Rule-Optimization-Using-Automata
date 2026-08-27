/**
 * Mock Data — aligned 100% with the frozen Module 0 contract.
 *
 * Rule fields  : id, priority, source, destination, protocol,
 *                source_port, destination_port, action
 * Packet fields: source, destination, protocol,
 *                source_port, destination_port
 *
 * DO NOT rename fields to camelCase.
 * DO NOT add fields not in the contract.
 */

export const MOCK_RULES = [
  {
    id: "R1",
    priority: 1,
    source: "192.168.1.0/24",
    destination: "10.0.0.0/24",
    protocol: "TCP",
    source_port: null,
    destination_port: 80,
    action: "ALLOW",
  },
  {
    id: "R2",
    priority: 2,
    source: "192.168.1.0/24",
    destination: "10.0.0.0/24",
    protocol: "TCP",
    source_port: null,
    destination_port: 443,
    action: "ALLOW",
  },
  {
    id: "R3",
    priority: 3,
    source: "10.0.0.0/8",
    destination: "0.0.0.0/0",
    protocol: "UDP",
    source_port: null,
    destination_port: 53,
    action: "ALLOW",
  },
  {
    id: "R4",
    priority: 4,
    source: "0.0.0.0/0",
    destination: "192.168.1.0/24",
    protocol: "TCP",
    source_port: null,
    destination_port: 22,
    action: "DENY",
  },
  {
    id: "R5",
    priority: 5,
    source: "192.168.1.0/24",
    destination: "10.0.0.0/24",
    protocol: "TCP",
    source_port: null,
    destination_port: 80,
    action: "DENY",          // intentional conflict with R1 — same traffic, different action
  },
  {
    id: "R6",
    priority: 6,
    source: "10.10.0.0/16",
    destination: "10.10.0.0/16",
    protocol: "ICMP",
    source_port: null,
    destination_port: null,
    action: "ALLOW",
  },
  {
    id: "R7",
    priority: 7,
    source: "0.0.0.0/0",
    destination: "0.0.0.0/0",
    protocol: "ANY",
    source_port: null,
    destination_port: null,
    action: "DENY",           // catch-all deny — makes later rules unreachable
  },
  {
    id: "R8",
    priority: 8,
    source: "192.168.1.5/32",
    destination: "10.0.0.1/32",
    protocol: "TCP",
    source_port: null,
    destination_port: 8080,
    action: "ALLOW",          // unreachable — R7 catch-all comes before this
  },
];

export const MOCK_PACKETS = [
  {
    id: "P1",
    source: "192.168.1.10",
    destination: "10.0.0.5",
    protocol: "TCP",
    source_port: 50234,
    destination_port: 80,
  },
  {
    id: "P2",
    source: "192.168.1.22",
    destination: "10.0.0.5",
    protocol: "TCP",
    source_port: 51000,
    destination_port: 443,
  },
  {
    id: "P3",
    source: "10.5.0.1",
    destination: "8.8.8.8",
    protocol: "UDP",
    source_port: 45000,
    destination_port: 53,
  },
  {
    id: "P4",
    source: "203.0.113.5",
    destination: "192.168.1.100",
    protocol: "TCP",
    source_port: 44000,
    destination_port: 22,
  },
];

/** Mock analysis results — shape matches planned AnalysisResult contract */
export const MOCK_ANALYSIS = {
  total_rules: MOCK_RULES.length,
  issues: [
    {
      type: "conflict",
      rule_ids: ["R1", "R5"],
      explanation:
        "R1 (priority 1) and R5 (priority 5) match identical traffic " +
        "[192.168.1.0/24 → 10.0.0.0/24 TCP :80] but take opposite actions " +
        "(ALLOW vs DENY). R5 is effectively dead due to priority ordering.",
    },
    {
      type: "shadowed",
      rule_ids: ["R5"],
      explanation:
        "R5 is completely shadowed by R1. Any packet matching R5 is already " +
        "processed by R1 first. R5 will never be evaluated.",
    },
    {
      type: "unreachable",
      rule_ids: ["R8"],
      explanation:
        "R8 (priority 8) is unreachable because R7 is a catch-all deny rule " +
        "(ANY 0.0.0.0/0 → 0.0.0.0/0) at priority 7. No packet can pass R7 " +
        "to reach R8.",
    },
  ],
  summary: { conflict: 1, shadowed: 1, redundant: 0, unreachable: 1 },
};

/** Mock optimization result — shape matches planned OptimizationResult contract */
export const MOCK_OPTIMIZATION = {
  original_count: MOCK_RULES.length,
  optimized_count: 6,
  reduction_percent: 25,
  optimized_rules: MOCK_RULES.filter((r) => !["R5", "R8"].includes(r.id)),
  recommendations: [
    {
      rule_id: "R5",
      action: "REMOVE",
      reason: "Shadowed by R1 with identical traffic match and opposite action. Safe to remove.",
      safe: true,
    },
    {
      rule_id: "R8",
      action: "REMOVE",
      reason: "Unreachable due to catch-all R7. Review R7 placement before removing R8.",
      safe: false,
    },
  ],
};

/** Mock automaton — shape matches planned Automaton contract (for visualization) */
export const MOCK_AUTOMATON = {
  rule_id: "R1",
  states: ["q0", "q1", "q2", "q3", "q4", "ACCEPT", "REJECT"],
  initial_state: "q0",
  accepting_states: ["ACCEPT"],
  dead_states: ["REJECT"],
  transitions: [
    { from: "q0", to: "q1",     label: "src∈192.168.1.0/24" },
    { from: "q0", to: "REJECT", label: "src∉192.168.1.0/24" },
    { from: "q1", to: "q2",     label: "dst∈10.0.0.0/24" },
    { from: "q1", to: "REJECT", label: "dst∉10.0.0.0/24" },
    { from: "q2", to: "q3",     label: "proto=TCP" },
    { from: "q2", to: "REJECT", label: "proto≠TCP" },
    { from: "q3", to: "q4",     label: "dport=80" },
    { from: "q3", to: "REJECT", label: "dport≠80" },
    { from: "q4", to: "ACCEPT", label: "→ALLOW" },
  ],
};

/** Mock simulation result */
export const MOCK_SIMULATION = {
  packet: MOCK_PACKETS[0],
  final_action: "ALLOW",
  matching_rule_id: "R1",
  checked_rules: [
    { rule_id: "R1", matched: true,  reason: "Source, destination, protocol and port all match." },
  ],
  automaton_path: ["q0", "q1", "q2", "q3", "q4", "ACCEPT"],
};
