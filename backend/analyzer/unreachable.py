from typing import List, Dict, Any
from backend.models.rule import Rule
from backend.automata.intersection import rule_covers
from backend.models.rule import Protocol

def analyze_unreachable(rules: List[Rule]) -> List[Dict[str, Any]]:
    """
    Finds unreachable rules.
    UNREACHABLE: No traffic can reach a rule because earlier rules cover its possible traffic.
    A common case is a catch-all ANY ANY rule making all subsequent rules unreachable.
    """
    issues = []
    
    # Simple check: If any previous rule is a catch-all, all subsequent are unreachable.
    # We can also check if a single earlier rule covers it.
    
    for i in range(len(rules)):
        for j in range(i + 1, len(rules)):
            r1 = rules[i]
            r2 = rules[j]
            
            # Check if r1 is a global catch-all
            is_catch_all = (
                r1.source.upper() in ("ANY", "0.0.0.0/0") and
                r1.destination.upper() in ("ANY", "0.0.0.0/0") and
                r1.protocol == Protocol.ANY and
                r1.source_port in (None, "ANY", "null", "") and
                r1.destination_port in (None, "ANY", "null", "")
            )
            
            if is_catch_all or rule_covers(r1, r2):
                # Only report it once per affected rule
                already_reported = any(r2.id in issue["rule_ids"] for issue in issues)
                if not already_reported:
                    reason = f"due to catch-all rule {r1.id}" if is_catch_all else f"because {r1.id} covers all its traffic"
                    issues.append({
                        "type": "unreachable",
                        "rule_ids": [r2.id],
                        "related_rule_id": r1.id,
                        "explanation": f"{r2.id} is unreachable {reason}. No packet can pass {r1.id} to reach {r2.id}."
                    })
                
    return issues
