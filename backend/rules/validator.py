from typing import List, Dict, Any
from backend.models.rule import Rule
from backend.rules.parser import parse_ip, parse_port

def validate_rule(rule: Rule) -> List[Dict[str, Any]]:
    """
    Validates a Rule object.
    Returns a list of error dictionaries: [{"field": str, "message": str}]
    Returns empty list if valid.
    """
    errors = []
    
    # 1. Validate Source IP
    try:
        parse_ip(rule.source)
    except ValueError as e:
        errors.append({"field": "source", "message": str(e)})
        
    # 2. Validate Destination IP
    try:
        parse_ip(rule.destination)
    except ValueError as e:
        errors.append({"field": "destination", "message": str(e)})
        
    # 3. Validate Source Port
    try:
        parse_port(rule.source_port)
    except ValueError as e:
        errors.append({"field": "source_port", "message": str(e)})
        
    # 4. Validate Destination Port
    try:
        parse_port(rule.destination_port)
    except ValueError as e:
        errors.append({"field": "destination_port", "message": str(e)})
        
    # Protocol, Action, and priority are primarily validated by Pydantic Model (Rule)
    # But we could add extra checks if needed.
    
    return errors

def validate_rules(rules: List[Rule]) -> List[Dict[str, Any]]:
    """
    Validates a list of Rule objects.
    Returns a list of errors with rule_id included.
    """
    all_errors = []
    for rule in rules:
        rule_errors = validate_rule(rule)
        for err in rule_errors:
            all_errors.append({
                "rule_id": rule.id,
                "field": err["field"],
                "message": err["message"]
            })
    return all_errors
