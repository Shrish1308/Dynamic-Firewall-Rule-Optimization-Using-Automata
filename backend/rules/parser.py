import ipaddress
from typing import Tuple, Union

def parse_ip(ip_str: str) -> ipaddress.IPv4Network:
    """
    Parses an IP string into an ipaddress.IPv4Network object.
    Supports single IP (e.g., 192.168.1.1), CIDR (192.168.1.0/24), and ANY (0.0.0.0/0).
    Raises ValueError if invalid.
    """
    if ip_str.upper() == "ANY":
        return ipaddress.IPv4Network("0.0.0.0/0")
    
    # Check if CIDR is present, else assume /32
    if "/" not in ip_str:
        ip_str = f"{ip_str}/32"
        
    return ipaddress.IPv4Network(ip_str, strict=False)

def parse_port(port_str: Union[str, int, None]) -> Tuple[int, int]:
    """
    Parses a port string or integer.
    Supports single port ('80'), range ('80-100'), or ANY/null.
    Returns a tuple (start_port, end_port).
    Raises ValueError if invalid.
    """
    if port_str is None or str(port_str).upper() == "ANY" or str(port_str).strip() == "":
        return (0, 65535)
        
    port_str = str(port_str).strip()
    
    try:
        if "-" in port_str:
            start_str, end_str = port_str.split("-")
            start, end = int(start_str), int(end_str)
        else:
            start = int(port_str)
            end = start
            
        if not (0 <= start <= 65535 and 0 <= end <= 65535):
            raise ValueError(f"Port out of range: {port_str}")
        if start > end:
            raise ValueError(f"Invalid port range: {port_str}")
            
        return (start, end)
    except ValueError as e:
        raise ValueError(f"Invalid port specification: {port_str}") from e
