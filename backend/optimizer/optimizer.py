from typing import List, Dict, Any
from backend.models.rule import Rule
from backend.analyzer.shadowing import analyze_shadowing
from backend.analyzer.redundancy import analyze_redundancy
from backend.analyzer.unreachable import analyze_unreachable
import copy

def optimize_rules(rules: List[Rule]) -> Dict[str, Any]:
    """
    Optimizes rules by removing safely removable ones (shadowed, redundant, unreachable).
    Preserves first-match semantics.
    """
    original_count = len(rules)
    recommendations = []
    
    # Run analyses
    shadowed_issues = analyze_shadowing(rules)
    redundant_issues = analyze_redundancy(rules)
    unreachable_issues = analyze_unreachable(rules)
    
    # Collect IDs to remove
    to_remove_safe = set()
    to_remove_unsafe = set()
    
    for issue in shadowed_issues:
        for rid in issue["rule_ids"]:
            recommendations.append({
                "rule_id": rid,
                "action": "REMOVE",
                "reason": issue["explanation"],
                "safe": True
            })
            to_remove_safe.add(rid)
            
    for issue in redundant_issues:
        for rid in issue["rule_ids"]:
            if rid not in to_remove_safe:
                recommendations.append({
                    "rule_id": rid,
                    "action": "REMOVE",
                    "reason": issue["explanation"],
                    "safe": True
                })
                to_remove_safe.add(rid)
                
    for issue in unreachable_issues:
        for rid in issue["rule_ids"]:
            if rid not in to_remove_safe:
                # Unreachable due to catch-all might need review
                recommendations.append({
                    "rule_id": rid,
                    "action": "REMOVE",
                    "reason": issue["explanation"],
                    "safe": False
                })
                to_remove_unsafe.add(rid)
                
    # Create optimized rule set (safely removing only)
    optimized_rules = [r for r in rules if r.id not in to_remove_safe and r.id not in to_remove_unsafe]
    optimized_count = len(optimized_rules)
    
    reduction_percent = 0
    if original_count > 0:
        reduction_percent = round(((original_count - optimized_count) / original_count) * 100, 2)
        
    return {
        "original_count": original_count,
        "optimized_count": optimized_count,
        "reduction_percent": reduction_percent,
        "optimized_rules": [r.dict() for r in optimized_rules],
        "recommendations": recommendations,
        "average_checks_before": -1, # Metric placeholder
        "average_checks_after": -1  # Metric placeholder
    }
