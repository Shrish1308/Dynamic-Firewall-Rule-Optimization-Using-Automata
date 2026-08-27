from typing import List, Dict, Any
from backend.models.rule import Rule
from backend.automata.intersection import rule_covers

def analyze_shadowing(rules: List[Rule]) -> List[Dict[str, Any]]:
    """
    Finds shadowed rules.
    SHADOWING: An earlier rule completely covers the traffic of a later rule.
    (Often implying different actions, but generally just coverage)
    """
    issues = []
    
    for i in range(len(rules)):
        for j in range(i + 1, len(rules)):
            r1 = rules[i]
            r2 = rules[j]
            
            # If r1 covers r2 completely
            if rule_covers(r1, r2):
                issues.append({
                    "type": "shadowed",
                    "rule_ids": [r2.id],
                    "related_rule_id": r1.id,
                    "explanation": f"{r2.id} is completely shadowed by {r1.id}. Any packet matching {r2.id} is already processed by {r1.id} first."
                })
                
    return issues
