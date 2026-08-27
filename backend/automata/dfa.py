import json
from typing import List, Dict, Any, Set, Callable
from backend.models.packet import Packet

class Transition:
    def __init__(self, from_state: str, to_state: str, label: str, condition: Callable[[Packet], bool]):
        self.from_state = from_state
        self.to_state = to_state
        self.label = label
        self.condition = condition

class DFA:
    def __init__(self, rule_id: str):
        self.rule_id = rule_id
        self.states: Set[str] = set()
        self.initial_state: str = "q0"
        self.accepting_states: Set[str] = set()
        self.dead_states: Set[str] = set()
        self.transitions: List[Transition] = []
        
    def add_state(self, state: str):
        self.states.add(state)
        
    def add_transition(self, from_state: str, to_state: str, label: str, condition: Callable[[Packet], bool]):
        self.add_state(from_state)
        self.add_state(to_state)
        self.transitions.append(Transition(from_state, to_state, label, condition))
        
    def simulate(self, packet: Packet) -> tuple[bool, List[str]]:
        """
        Simulates the DFA against a packet.
        Returns (is_accepted, path_taken)
        """
        current_state = self.initial_state
        path = [current_state]
        
        while current_state not in self.accepting_states and current_state not in self.dead_states:
            transitioned = False
            for t in self.transitions:
                if t.from_state == current_state and t.condition(packet):
                    current_state = t.to_state
                    path.append(current_state)
                    transitioned = True
                    break
                    
            if not transitioned:
                # If no transition is possible, we typically go to a dead state, 
                # but in our strictly constructed DFA, there should always be a valid transition.
                return False, path
                
        return current_state in self.accepting_states, path
        
    def to_dict(self) -> Dict[str, Any]:
        """
        Serializes the DFA to a dictionary suitable for the frontend.
        """
        return {
            "rule_id": self.rule_id,
            "states": list(self.states),
            "initial_state": self.initial_state,
            "accepting_states": list(self.accepting_states),
            "dead_states": list(self.dead_states),
            "transitions": [
                {
                    "from": t.from_state,
                    "to": t.to_state,
                    "label": t.label
                }
                for t in self.transitions
            ]
        }
