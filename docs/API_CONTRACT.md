# API Contract

## 1. Rule JSON Structure
The `Rule` model defines the structure for firewall rules.

```json
{
  "id": "string",
  "priority": "integer",
  "source": "string (IP, CIDR, or ANY)",
  "destination": "string (IP, CIDR, or ANY)",
  "protocol": "string (TCP, UDP, ICMP, ANY)",
  "source_port": "string (Port, Port Range, or ANY)",
  "destination_port": "string (Port, Port Range, or ANY)",
  "action": "string (ALLOW, DENY)"
}
```

## 2. Packet JSON Structure
The `Packet` model defines the structure for incoming network packets.

```json
{
  "source": "string (IP)",
  "destination": "string (IP)",
  "protocol": "string (TCP, UDP, ICMP, ANY)",
  "source_port": "integer",
  "destination_port": "integer"
}
```

## 3. Allowed Protocol Values
- `TCP`
- `UDP`
- `ICMP`
- `ANY`

## 4. Allowed Action Values
- `ALLOW`
- `DENY`

## 5. Port Representation
- **Single Port:** Integer represented as a string (e.g., `"80"`) for rules, or just an integer (e.g., `80`) for packets.
- **Port Range (Rules only):** Two integers separated by a hyphen (e.g., `"8000-8080"`).
- **Wildcard (Rules only):** `"ANY"` matches all ports.

## 6. Priority Semantics
- Higher integer values represent higher priority. Rules with higher priority are evaluated before rules with lower priority.

## 7. Wildcard Semantics
- **IP/CIDR:** `"ANY"` represents any source or destination IP address.
- **Protocol:** `"ANY"` represents all supported protocols.
- **Port:** `"ANY"` represents any port.

## 8. Example Valid Rule
```json
{
  "id": "rule-1",
  "priority": 100,
  "source": "192.168.1.0/24",
  "destination": "ANY",
  "protocol": "TCP",
  "source_port": "ANY",
  "destination_port": "80-443",
  "action": "ALLOW"
}
```

## 9. Example Valid Packet
```json
{
  "source": "192.168.1.10",
  "destination": "10.0.0.5",
  "protocol": "TCP",
  "source_port": 54321,
  "destination_port": 443
}
```
