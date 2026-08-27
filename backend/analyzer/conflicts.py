from typing import List, Dict, Any
from backend.models.rule import Rule
from backend.automata.intersection import rules_intersect, rule_covers

def analyze_conflicts(rules: List[Rule]) -> List[Dict[str, Any]]:
    """
    Finds conflicting rules.
    CONFLICT: Two rules can match overlapping traffic but specify different actions.
    """
    issues = []
    
    for i in range(len(rules)):
        for j in range(i + 1, len(rules)):
            r1 = rules[i]
            r2 = rules[j]
            
            # If actions are different and they intersect
            if r1.action != r2.action and rules_intersect(r1, r2):
                issues.append({
                    "type": "conflict",
                    "rule_ids": [r1.id, r2.id],
                    "explanation": f"{r1.id} (priority {r1.priority}) and {r2.id} (priority {r2.priority}) match overlapping traffic but have opposite actions ({r1.action.value} vs {r2.action.value})."
                })
                
    return issues
