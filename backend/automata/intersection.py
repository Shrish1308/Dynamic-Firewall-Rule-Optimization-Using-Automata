import ipaddress
from backend.models.rule import Rule, Protocol
from backend.rules.parser import parse_ip, parse_port
from backend.automata.rule_to_automata import rule_to_dfa

def intersect_networks(net1: ipaddress.IPv4Network, net2: ipaddress.IPv4Network) -> bool:
    """Returns True if two IPv4 networks overlap."""
    return net1.overlaps(net2)

def intersect_ports(port1: tuple[int, int], port2: tuple[int, int]) -> bool:
    """Returns True if two port ranges overlap."""
    return max(port1[0], port2[0]) <= min(port1[1], port2[1])

def rules_intersect(rule_a: Rule, rule_b: Rule) -> bool:
    """
    Determines if L(A) ∩ L(B) ≠ ∅ (i.e. rules can match common traffic).
    This is equivalent to DFA intersection for our specific strict DFA structure.
    """
    # 1. Protocol check
    if rule_a.protocol != Protocol.ANY and rule_b.protocol != Protocol.ANY and rule_a.protocol != rule_b.protocol:
        return False
        
    # 2. Source IP check
    try:
        src_a = parse_ip(rule_a.source)
        src_b = parse_ip(rule_b.source)
        if not intersect_networks(src_a, src_b):
            return False
    except ValueError:
        return False
        
    # 3. Destination IP check
    try:
        dst_a = parse_ip(rule_a.destination)
        dst_b = parse_ip(rule_b.destination)
        if not intersect_networks(dst_a, dst_b):
            return False
    except ValueError:
        return False
        
    # 4. Source Port check
    try:
        sport_a = parse_port(rule_a.source_port)
        sport_b = parse_port(rule_b.source_port)
        if not intersect_ports(sport_a, sport_b):
            return False
    except ValueError:
        return False
        
    # 5. Destination Port check
    try:
        dport_a = parse_port(rule_a.destination_port)
        dport_b = parse_port(rule_b.destination_port)
        if not intersect_ports(dport_a, dport_b):
            return False
    except ValueError:
        return False
        
    return True

def rule_covers(rule_a: Rule, rule_b: Rule) -> bool:
    """
    Determines if L(A) ⊇ L(B) (i.e. rule A covers all traffic of rule B).
    Used for shadowing and unreachable analysis.
    """
    # 1. Protocol check
    if rule_a.protocol != Protocol.ANY:
        if rule_b.protocol == Protocol.ANY or rule_a.protocol != rule_b.protocol:
            return False
            
    # 2. Source IP check (A must be a supernet of B)
    try:
        src_a = parse_ip(rule_a.source)
        src_b = parse_ip(rule_b.source)
        if not src_a.supernet_of(src_b):
            return False
    except ValueError:
        return False
        
    # 3. Destination IP check (A must be a supernet of B)
    try:
        dst_a = parse_ip(rule_a.destination)
        dst_b = parse_ip(rule_b.destination)
        if not dst_a.supernet_of(dst_b):
            return False
    except ValueError:
        return False
        
    # 4. Source Port check (A must cover B)
    try:
        sport_a = parse_port(rule_a.source_port)
        sport_b = parse_port(rule_b.source_port)
        if not (sport_a[0] <= sport_b[0] and sport_a[1] >= sport_b[1]):
            return False
    except ValueError:
        return False
        
    # 5. Destination Port check (A must cover B)
    try:
        dport_a = parse_port(rule_a.destination_port)
        dport_b = parse_port(rule_b.destination_port)
        if not (dport_a[0] <= dport_b[0] and dport_a[1] >= dport_b[1]):
            return False
    except ValueError:
        return False
        
    return True
