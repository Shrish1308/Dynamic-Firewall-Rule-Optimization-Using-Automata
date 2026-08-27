from typing import List, Dict, Any
from backend.models.rule import Rule
from backend.models.packet import Packet
from backend.rules.matcher import packet_matches_rule
from backend.automata.rule_to_automata import rule_to_dfa

def simulate_packet(rules: List[Rule], packet: Packet) -> Dict[str, Any]:
    """
    Simulates a packet through the firewall rules using first-match semantics.
    Returns simulation trace matching frontend expectations.
    """
    # Ensure rules are sorted by priority (highest priority = lowest number, or vice versa? 
    # Usually 1 is highest priority. Let's assume lower number = higher priority, or just use the order they come in if pre-sorted.
    # The prompt says priority is deterministic ordering. We'll sort by priority ascending (1 is first).
    sorted_rules = sorted(rules, key=lambda r: r.priority)
    
    checked_rules = []
    final_action = "DENY" # Default deny
    matching_rule_id = None
    automaton_path = []
    
    for rule in sorted_rules:
        # Match using matcher
        matched = packet_matches_rule(packet, rule)
        
        checked_rules.append({
            "rule_id": rule.id,
            "matched": matched,
            "reason": "Matched all fields" if matched else "Did not match"
        })
        
        if matched:
            final_action = rule.action.value
            matching_rule_id = rule.id
            
            # Generate automaton path for visualization
            dfa = rule_to_dfa(rule)
            _, path = dfa.simulate(packet)
            automaton_path = path
            
            break # First match semantic
            
    return {
        "packet": packet.dict(),
        "final_action": final_action,
        "matching_rule_id": matching_rule_id,
        "checked_rules": checked_rules,
        "automaton_path": automaton_path
    }
