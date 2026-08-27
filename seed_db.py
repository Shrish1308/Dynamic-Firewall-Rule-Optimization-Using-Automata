import sys
import os

# Add root to python path to resolve backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database import init_db, create_rule, get_all_rules
from backend.models.rule import Rule, Protocol, Action

# From MOCK_RULES
mock_rules = [
  Rule(id="R1", priority=1, source="192.168.1.0/24", destination="10.0.0.0/24", protocol=Protocol.TCP, source_port=None, destination_port="80", action=Action.ALLOW),
  Rule(id="R2", priority=2, source="192.168.1.0/24", destination="10.0.0.0/24", protocol=Protocol.TCP, source_port=None, destination_port="443", action=Action.ALLOW),
  Rule(id="R3", priority=3, source="10.0.0.0/8", destination="0.0.0.0/0", protocol=Protocol.UDP, source_port=None, destination_port="53", action=Action.ALLOW),
  Rule(id="R4", priority=4, source="0.0.0.0/0", destination="192.168.1.0/24", protocol=Protocol.TCP, source_port=None, destination_port="22", action=Action.DENY),
  Rule(id="R5", priority=5, source="192.168.1.0/24", destination="10.0.0.0/24", protocol=Protocol.TCP, source_port=None, destination_port="80", action=Action.DENY),
  Rule(id="R6", priority=6, source="10.10.0.0/16", destination="10.10.0.0/16", protocol=Protocol.ICMP, source_port=None, destination_port=None, action=Action.ALLOW),
  Rule(id="R7", priority=7, source="0.0.0.0/0", destination="0.0.0.0/0", protocol=Protocol.ANY, source_port=None, destination_port=None, action=Action.DENY),
  Rule(id="R8", priority=8, source="192.168.1.5/32", destination="10.0.0.1/32", protocol=Protocol.TCP, source_port=None, destination_port="8080", action=Action.ALLOW),
]

init_db()

existing_rules = get_all_rules()
if not existing_rules:
    for r in mock_rules:
        create_rule(r)
    print("Database seeded with mock rules.")
else:
    print("Database already contains rules.")
