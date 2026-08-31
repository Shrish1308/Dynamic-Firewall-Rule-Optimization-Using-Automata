import ipaddress
from backend.models.rule import Rule, Protocol
from backend.models.packet import Packet
from backend.rules.parser import parse_ip, parse_port

def packet_matches_rule(packet: Packet, rule: Rule) -> bool:
    """
    Determines if a Packet matches a given Rule based on first-match firewall semantics.
    Evaluates: Source IP, Destination IP, Protocol, Source port, Destination port.
    """
    
    # 1. Protocol Match
    if rule.protocol != Protocol.ANY and packet.protocol != rule.protocol:
        return False
        
    # 2. Source IP Match
    try:
        rule_src_net = parse_ip(rule.source)
        packet_src_ip = ipaddress.IPv4Address(packet.source)
        if packet_src_ip not in rule_src_net:
            return False
    except ValueError:
        return False # Invalid IP logic should have been caught in validation
        
    # 3. Destination IP Match
    try:
        rule_dst_net = parse_ip(rule.destination)
        packet_dst_ip = ipaddress.IPv4Address(packet.destination)
        if packet_dst_ip not in rule_dst_net:
            return False
    except ValueError:
        return False
        
    # 4. Source Port Match
    try:
        if packet.source_port is not None:
            rule_sport_start, rule_sport_end = parse_port(rule.source_port)
            if not (rule_sport_start <= packet.source_port <= rule_sport_end):
                return False
    except ValueError:
        return False
        
    # 5. Destination Port Match
    try:
        if packet.destination_port is not None:
            rule_dport_start, rule_dport_end = parse_port(rule.destination_port)
            if not (rule_dport_start <= packet.destination_port <= rule_dport_end):
                return False
    except ValueError:
        return False
        
    return True
