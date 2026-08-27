from enum import Enum
from pydantic import BaseModel, Field

class Protocol(str, Enum):
    TCP = "TCP"
    UDP = "UDP"
    ICMP = "ICMP"
    ANY = "ANY"

class Action(str, Enum):
    ALLOW = "ALLOW"
    DENY = "DENY"

class Rule(BaseModel):
    id: str = Field(..., description="Unique identifier for the rule")
    priority: int = Field(..., description="Priority of the rule (higher number = higher priority)")
    source: str = Field(..., description="Source IP, CIDR, or ANY")
    destination: str = Field(..., description="Destination IP, CIDR, or ANY")
    protocol: Protocol = Field(..., description="Network protocol")
    source_port: str = Field(..., description="Single port, port range (e.g., 80-100), or ANY")
    destination_port: str = Field(..., description="Single port, port range (e.g., 80-100), or ANY")
    action: Action = Field(..., description="Action to take: ALLOW or DENY")
