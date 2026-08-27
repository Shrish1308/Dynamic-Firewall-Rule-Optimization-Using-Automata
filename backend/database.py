import sqlite3
import json
from typing import List, Optional
from backend.models.rule import Rule

DB_PATH = "firewall.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rules (
            id TEXT PRIMARY KEY,
            priority INTEGER,
            source TEXT,
            destination TEXT,
            protocol TEXT,
            source_port TEXT,
            destination_port TEXT,
            action TEXT
        )
    ''')
    conn.commit()
    conn.close()

def get_all_rules() -> List[Rule]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, priority, source, destination, protocol, source_port, destination_port, action FROM rules ORDER BY priority ASC")
    rows = cursor.fetchall()
    conn.close()
    
    rules = []
    for r in rows:
        rules.append(Rule(
            id=r[0],
            priority=r[1],
            source=r[2],
            destination=r[3],
            protocol=r[4],
            source_port=r[5],
            destination_port=r[6],
            action=r[7]
        ))
    return rules

def get_rule_by_id(rule_id: str) -> Optional[Rule]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, priority, source, destination, protocol, source_port, destination_port, action FROM rules WHERE id = ?", (rule_id,))
    r = cursor.fetchone()
    conn.close()
    
    if r:
        return Rule(
            id=r[0], priority=r[1], source=r[2], destination=r[3],
            protocol=r[4], source_port=r[5], destination_port=r[6], action=r[7]
        )
    return None

def create_rule(rule: Rule):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO rules (id, priority, source, destination, protocol, source_port, destination_port, action)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (rule.id, rule.priority, rule.source, rule.destination, rule.protocol.value, 
          rule.source_port, rule.destination_port, rule.action.value))
    conn.commit()
    conn.close()

def update_rule(rule_id: str, rule: Rule):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE rules 
        SET priority=?, source=?, destination=?, protocol=?, source_port=?, destination_port=?, action=?
        WHERE id=?
    ''', (rule.priority, rule.source, rule.destination, rule.protocol.value, 
          rule.source_port, rule.destination_port, rule.action.value, rule_id))
    conn.commit()
    conn.close()

def delete_rule(rule_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM rules WHERE id=?", (rule_id,))
    conn.commit()
    conn.close()
