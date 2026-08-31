import ipaddress
from backend.models.rule import Rule, Protocol
from backend.models.packet import Packet
from backend.automata.dfa import DFA
from backend.rules.parser import parse_ip, parse_port

def rule_to_dfa(rule: Rule) -> DFA:
    """
    Converts a firewall rule into a strictly sequenced DFA.
    Sequence: Source IP -> Destination IP -> Protocol -> Source Port -> Destination Port -> Action
    """
    dfa = DFA(rule.rule_id if hasattr(rule, 'rule_id') else rule.id)
    dfa.initial_state = "q0"
    dfa.accepting_states = {"ACCEPT"}
    dfa.dead_states = {"REJECT"}
    
    # Pre-parse rule fields to avoid doing it repeatedly in lambdas
    src_net = parse_ip(rule.source)
    dst_net = parse_ip(rule.destination)
    rule_proto = rule.protocol
    sport_start, sport_end = parse_port(rule.source_port)
    dport_start, dport_end = parse_port(rule.destination_port)
    action_label = f"→{rule.action.value}"
    
    # 1. Source IP Transition (q0 -> q1)
    def check_src(p: Packet) -> bool:
        try:
            return ipaddress.IPv4Address(p.source) in src_net
        except:
            return False
            
    dfa.add_transition("q0", "q1", f"src∈{rule.source}", check_src)
    dfa.add_transition("q0", "REJECT", f"src∉{rule.source}", lambda p: not check_src(p))
    
    # 2. Destination IP Transition (q1 -> q2)
    def check_dst(p: Packet) -> bool:
        try:
            return ipaddress.IPv4Address(p.destination) in dst_net
        except:
            return False
            
    dfa.add_transition("q1", "q2", f"dst∈{rule.destination}", check_dst)
    dfa.add_transition("q1", "REJECT", f"dst∉{rule.destination}", lambda p: not check_dst(p))
    
    # 3. Protocol Transition (q2 -> q3)
    def check_proto(p: Packet) -> bool:
        if rule_proto == Protocol.ANY:
            return True
        return p.protocol == rule_proto
        
    proto_label = "proto=ANY" if rule_proto == Protocol.ANY else f"proto={rule_proto.value}"
    not_proto_label = "proto≠ANY" if rule_proto == Protocol.ANY else f"proto≠{rule_proto.value}"
    dfa.add_transition("q2", "q3", proto_label, check_proto)
    dfa.add_transition("q2", "REJECT", not_proto_label, lambda p: not check_proto(p))
    
    # 4. Source Port Transition (q3 -> q4)
    def check_sport(p: Packet) -> bool:
        if p.source_port is None:
            return True
        return sport_start <= p.source_port <= sport_end
        
    sport_label = "sport=ANY" if rule.source_port in (None, "ANY", "null", "") else f"sport={rule.source_port}"
    not_sport_label = "sport≠ANY" if rule.source_port in (None, "ANY", "null", "") else f"sport≠{rule.source_port}"
    dfa.add_transition("q3", "q4", sport_label, check_sport)
    dfa.add_transition("q3", "REJECT", not_sport_label, lambda p: not check_sport(p))
    
    # 5. Destination Port Transition (q4 -> ACCEPT/REJECT)
    def check_dport(p: Packet) -> bool:
        if p.destination_port is None:
            return True
        return dport_start <= p.destination_port <= dport_end
        
    dport_label = "dport=ANY" if rule.destination_port in (None, "ANY", "null", "") else f"dport={rule.destination_port}"
    not_dport_label = "dport≠ANY" if rule.destination_port in (None, "ANY", "null", "") else f"dport≠{rule.destination_port}"
    
    dfa.add_transition("q4", "ACCEPT", f"{dport_label} ({action_label})", check_dport)
    dfa.add_transition("q4", "REJECT", not_dport_label, lambda p: not check_dport(p))
    
    return dfa
