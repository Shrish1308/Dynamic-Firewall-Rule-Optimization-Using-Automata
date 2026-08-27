# Dynamic Firewall Rule Optimization Using Automata

An automata-based firewall rule analysis and optimization system developed as a Theory of Computation course project.

## 📌 Project Overview

**Dynamic Firewall Rule Optimization Using Automata** applies concepts from Theory of Computation, particularly **Finite Automata**, to analyze and optimize firewall rule sets.

A firewall processes network packets by evaluating a sequence of rules based on properties such as source IP, destination IP, protocol, port, action, and priority. As firewall configurations grow, they may contain redundant, conflicting, shadowed, or unreachable rules.

This project models firewall rules as packet-matching languages and uses automata-based analysis to identify these issues. It also provides packet-flow simulation, rule validation, and optimization recommendations.

### Main Goals

- Detect redundant firewall rules
- Detect shadowed rules
- Detect conflicting rules
- Detect unreachable rules
- Validate firewall policies
- Model firewall rules using Finite Automata
- Simulate packet flow through the rule set
- Generate optimization recommendations
- Compare the original and optimized rule sets

---

## 🎯 Core Theory of Computation Concepts

The project demonstrates the practical application of:

- Deterministic Finite Automata (DFA)
- Nondeterministic Finite Automata (NFA), if required
- States and transitions
- Accepting and dead states
- Regular languages
- Language intersection
- Language inclusion/coverage
- Automata equivalence
- DFA minimization

A firewall rule is treated as defining a set of packets that satisfy its conditions.

For two rules `R1` and `R2`, if:

`L(R1) ∩ L(R2) ≠ ∅`

then both rules can potentially match common traffic. This relationship can be used to identify conflicts, shadowing, and redundancy.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
      ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
      │ Rule Engine │   │   Automata  │   │  Simulator  │
      │             │   │   Engine    │   │             │
      └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │   Rule Analyzer      │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Optimization Engine  │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Results / Dashboard  │
                    └──────────────────────┘