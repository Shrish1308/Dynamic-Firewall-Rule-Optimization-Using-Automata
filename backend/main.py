from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import uuid

from backend.models.rule import Rule
from backend.models.packet import Packet
from backend.database import init_db, get_all_rules, create_rule, update_rule, delete_rule, get_rule_by_id
from backend.rules.validator import validate_rules as check_rules_validity
from backend.analyzer.conflicts import analyze_conflicts
from backend.analyzer.shadowing import analyze_shadowing
from backend.analyzer.redundancy import analyze_redundancy
from backend.analyzer.unreachable import analyze_unreachable
from backend.simulator.packet_simulator import simulate_packet
from backend.optimizer.optimizer import optimize_rules as run_optimization
from backend.automata.rule_to_automata import rule_to_dfa

app = FastAPI(title="Firewall Rule Optimization API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/rules", response_model=List[Rule])
def api_get_rules():
    return get_all_rules()

@app.post("/rules", response_model=Rule)
def api_create_rule(rule: Rule):
    # If ID is missing or mock, generate one
    if not rule.id or rule.id.startswith("R_MOCK"):
        rule.id = f"R{uuid.uuid4().hex[:6].upper()}"
    create_rule(rule)
    return rule

@app.put("/rules/{rule_id}", response_model=Rule)
def api_update_rule(rule_id: str, rule: Rule):
    rule.id = rule_id
    update_rule(rule_id, rule)
    return rule

@app.delete("/rules/{rule_id}")
def api_delete_rule(rule_id: str):
    delete_rule(rule_id)
    return {"deleted": rule_id}

@app.post("/validate")
def api_validate_rules(body: Dict[str, List[Rule]] = Body(...)):
    rules = body.get("rules", [])
    errors = check_rules_validity(rules)
    return {"valid": len(errors) == 0, "errors": errors}

@app.get("/analysis")
def api_get_analysis():
    rules = get_all_rules()
    if not rules:
        return {"total_rules": 0, "issues": [], "summary": {"conflict": 0, "shadowed": 0, "redundancy": 0, "unreachable": 0}}
        
    conflicts = analyze_conflicts(rules)
    shadowed = analyze_shadowing(rules)
    redundancy = analyze_redundancy(rules)
    unreachable = analyze_unreachable(rules)
    
    issues = conflicts + shadowed + redundancy + unreachable
    summary = {
        "conflict": len(conflicts),
        "shadowed": len(shadowed),
        "redundancy": len(redundancy),
        "unreachable": len(unreachable)
    }
    return {"total_rules": len(rules), "issues": issues, "summary": summary}

@app.get("/automata/{rule_id}")
def api_get_automaton(rule_id: str):
    rule = get_rule_by_id(rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    dfa = rule_to_dfa(rule)
    return dfa.to_dict()

@app.post("/simulate")
def api_simulate_packet(packet: Packet):
    rules = get_all_rules()
    return simulate_packet(rules, packet)

@app.post("/optimize")
def api_optimize_rules(body: Dict[str, List[Rule]] = Body(...)):
    rules = body.get("rules", [])
    if not rules:
        rules = get_all_rules()
    return run_optimization(rules)

