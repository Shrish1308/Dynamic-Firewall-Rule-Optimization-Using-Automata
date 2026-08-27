from pydantic import BaseModel, Field
from backend.models.rule import Protocol

class Packet(BaseModel):
    source: str = Field(..., description="Source IP address")
    destination: str = Field(..., description="Destination IP address")
    protocol: Protocol = Field(..., description="Network protocol")
    source_port: int = Field(..., description="Source port number")
    destination_port: int = Field(..., description="Destination port number")
