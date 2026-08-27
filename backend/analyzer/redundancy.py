from typing import List, Dict, Any
from backend.models.rule import Rule
from backend.automata.intersection import rule_covers

def analyze_redundancy(rules: List[Rule]) -> List[Dict[str, Any]]:
    """
    Finds redundant rules.
    REDUNDANCY: A later rule adds no new effective behavior because an earlier rule covers it and specifies the SAME action.
    """
    issues = []
    
    for i in range(len(rules)):
        for j in range(i + 1, len(rules)):
            r1 = rules[i]
            r2 = rules[j]
            
            # If r1 covers r2 and has the same action
            if r1.action == r2.action and rule_covers(r1, r2):
                issues.append({
                    "type": "redundancy",
                    "rule_ids": [r2.id],
                    "related_rule_id": r1.id,
                    "explanation": f"{r2.id} is redundant. {r1.id} already covers this traffic with the same action ({r1.action.value})."
                })
                
    return issues
