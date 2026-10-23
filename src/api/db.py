"""
SQLite Database Engine for Multi-Child Family Management.
Zero-config persistence with SQLite WAL mode.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
import random
import sqlite3
import time
from typing import Any, Dict, List, Optional, Tuple

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = REPO_ROOT / "data"
DB_PATH = DATA_DIR / "family_milo.db"

logger = logging.getLogger("family_db")


def get_db_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def init_db():
    """Initializes tables and seeds default multi-child data if empty."""
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # 1. Parents table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS parents (
            parent_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            family_code TEXT NOT NULL UNIQUE,
            created_at REAL NOT NULL
        );
        """)

        # 2. Children profiles table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS children (
            kid_id TEXT PRIMARY KEY,
            parent_id TEXT NOT NULL,
            name TEXT NOT NULL,
            grade INTEGER NOT NULL,
            avatar TEXT NOT NULL,
            stars INTEGER DEFAULT 0,
            cognitive_profile_json TEXT,
            created_at REAL NOT NULL,
            FOREIGN KEY (parent_id) REFERENCES parents(parent_id)
        );
        """)

        # 3. 6-digit pairing codes table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS pairing_codes (
            code TEXT PRIMARY KEY,
            kid_id TEXT NOT NULL,
            parent_id TEXT NOT NULL,
            expires_at REAL NOT NULL,
            is_used INTEGER DEFAULT 0,
            FOREIGN KEY (kid_id) REFERENCES children(kid_id)
        );
        """)

        # 4. Child roadmaps table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS child_roadmaps (
            kid_id TEXT PRIMARY KEY,
            roadmap_json TEXT NOT NULL,
            current_roadmap_index INTEGER DEFAULT 0,
            current_step_index INTEGER DEFAULT 0,
            pending_ticket_json TEXT,
            updated_at REAL NOT NULL,
            FOREIGN KEY (kid_id) REFERENCES children(kid_id)
        );
        """)

        # 5. Child daily routines table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS child_routines (
            kid_id TEXT PRIMARY KEY,
            routines_json TEXT NOT NULL,
            completed_routine_ids_json TEXT DEFAULT '[]',
            photo_proofs_json TEXT DEFAULT '{}',
            updated_at REAL NOT NULL,
            FOREIGN KEY (kid_id) REFERENCES children(kid_id)
        );
        """)

        # 6. Telemetry & activity logs table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kid_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            payload_json TEXT,
            timestamp REAL NOT NULL
        );
        """)

        conn.commit()

    # Seed default data if no parents exist
    seed_default_family()


def seed_default_family():
    """Seeds default Parent (Mẹ Lan) and 2 Children (Bé Leo Lớp 1, Bé Minh Lớp 3)."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM parents;")
        if cursor.fetchone()["cnt"] > 0:
            return

        now = time.time()
        # Seed parent
        cursor.execute(
            "INSERT INTO parents (parent_id, name, family_code, created_at) VALUES (?, ?, ?, ?);",
            ("parent_lan_01", "Mẹ Lan", "FAM_MILO_01", now),
        )

        # Seed Child 1: Bé Leo (Lớp 1)
        default_profile_leo = {
            "attention_span_minutes": 8,
            "recommended_micro_task_duration_sec": 90,
            "working_memory_capacity": 2,
            "rsd_sensitivity_level": "HIGH",
            "scaffolding_level": "MODERATE",
            "max_steps_per_session": 3,
        }
        cursor.execute(
            """INSERT INTO children (kid_id, parent_id, name, grade, avatar, stars, cognitive_profile_json, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?);""",
            (
                "kid_leo_01",
                "parent_lan_01",
                "Bé Leo",
                1,
                "🦁",
                450,
                json.dumps(default_profile_leo, ensure_ascii=False),
                now,
            ),
        )

        # Seed Child 2: Bé Minh (Lớp 3)
        default_profile_minh = {
            "attention_span_minutes": 15,
            "recommended_micro_task_duration_sec": 120,
            "working_memory_capacity": 3,
            "rsd_sensitivity_level": "MODERATE",
            "scaffolding_level": "LOW",
            "max_steps_per_session": 4,
        }
        cursor.execute(
            """INSERT INTO children (kid_id, parent_id, name, grade, avatar, stars, cognitive_profile_json, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?);""",
            (
                "kid_minh_02",
                "parent_lan_01",
                "Bé Minh",
                3,
                "🐯",
                320,
                json.dumps(default_profile_minh, ensure_ascii=False),
                now,
            ),
        )

        # Seed Pairing Codes (1 năm hạn cho demo thuận tiện)
        far_future = now + (365 * 24 * 3600)
        cursor.execute(
            "INSERT INTO pairing_codes (code, kid_id, parent_id, expires_at, is_used) VALUES (?, ?, ?, ?, ?);",
            ("729-184", "kid_leo_01", "parent_lan_01", far_future, 0),
        )
        cursor.execute(
            "INSERT INTO pairing_codes (code, kid_id, parent_id, expires_at, is_used) VALUES (?, ?, ?, ?, ?);",
            ("852-369", "kid_minh_02", "parent_lan_01", far_future, 0),
        )

        # Seed Initial Roadmaps from tasks_db.json
        tasks_db_path = REPO_ROOT / "data" / "curriculum" / "tasks_db.json"
        tasks_map = {}
        if tasks_db_path.is_file():
            try:
                with open(tasks_db_path, "r", encoding="utf-8") as f:
                    tasks_map = json.load(f)
            except Exception as e:
                logger.warning(f"Failed to read tasks_db.json: {e}")

        # Roadmaps: Bé Leo (Lớp 1)
        leo_tasks = [
            tasks_map.get("G1_MATH_01"),
            tasks_map.get("G1_VIET_03"),
            tasks_map.get("G1_MCQ_04"),
        ]
        leo_tasks = [t for t in leo_tasks if t]
        cursor.execute(
            """INSERT INTO child_roadmaps (kid_id, roadmap_json, current_roadmap_index, current_step_index, pending_ticket_json, updated_at)
               VALUES (?, ?, 0, 0, NULL, ?);""",
            ("kid_leo_01", json.dumps(leo_tasks, ensure_ascii=False), now),
        )

        # Roadmaps: Bé Minh (Lớp 3)
        minh_tasks = [
            tasks_map.get("G3_MATH_11"),
            tasks_map.get("G3_MATH_12"),
            tasks_map.get("G3_ENG_14"),
        ]
        minh_tasks = [t for t in minh_tasks if t]
        cursor.execute(
            """INSERT INTO child_roadmaps (kid_id, roadmap_json, current_roadmap_index, current_step_index, pending_ticket_json, updated_at)
               VALUES (?, ?, 0, 0, NULL, ?);""",
            ("kid_minh_02", json.dumps(minh_tasks, ensure_ascii=False), now),
        )

        # Seed Initial Routines from routines_db.json
        routines_db_path = REPO_ROOT / "data" / "curriculum" / "routines_db.json"
        routines_map = {}
        if routines_db_path.is_file():
            try:
                with open(routines_db_path, "r", encoding="utf-8") as f:
                    routines_map = json.load(f)
            except Exception as e:
                logger.warning(f"Failed to read routines_db.json: {e}")

        default_routine_ids = [
            "routine_morning_bed",
            "routine_afterschool_drop",
            "routine_clean_desk",
            "routine_night_teeth",
        ]
        default_routines = [routines_map.get(rid) for rid in default_routine_ids if rid in routines_map]

        for kid_id in ["kid_leo_01", "kid_minh_02"]:
            cursor.execute(
                """INSERT INTO child_routines (kid_id, routines_json, completed_routine_ids_json, photo_proofs_json, updated_at)
                   VALUES (?, ?, '[]', '{}', ?);""",
                (kid_id, json.dumps(default_routines, ensure_ascii=False), now),
            )

        conn.commit()
        logger.info("Successfully seeded default multi-child database: Bé Leo & Bé Minh.")


# ==========================================
# CRUD Functions
# ==========================================

def get_children_by_parent(parent_id: str = "parent_lan_01") -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT c.*, p.code as pairing_code 
               FROM children c 
               LEFT JOIN pairing_codes p ON c.kid_id = p.kid_id AND p.is_used = 0 AND p.expires_at > ?
               WHERE c.parent_id = ? 
               ORDER BY c.created_at ASC;""",
            (time.time(), parent_id),
        )
        rows = cursor.fetchall()
        result = []
        for r in rows:
            cog = {}
            if r["cognitive_profile_json"]:
                try:
                    cog = json.loads(r["cognitive_profile_json"])
                except Exception:
                    pass
            result.append({
                "kid_id": r["kid_id"],
                "parent_id": r["parent_id"],
                "name": r["name"],
                "grade": r["grade"],
                "avatar": r["avatar"],
                "stars": r["stars"],
                "pairing_code": r["pairing_code"] or "729-184",
                "cognitive_profile": cog,
                "created_at": r["created_at"],
            })
        return result


def get_child_by_id(kid_id: str) -> Optional[Dict[str, Any]]:
    if kid_id == "kid_milo_01":
        kid_id = "kid_leo_01"
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM children WHERE kid_id = ?;", (kid_id,))
        r = cursor.fetchone()
        if not r:
            return None
        cog = {}
        if r["cognitive_profile_json"]:
            try:
                cog = json.loads(r["cognitive_profile_json"])
            except Exception:
                pass
        return {
            "kid_id": r["kid_id"],
            "parent_id": r["parent_id"],
            "name": r["name"],
            "grade": r["grade"],
            "avatar": r["avatar"],
            "stars": r["stars"],
            "cognitive_profile": cog,
            "created_at": r["created_at"],
        }


def create_child(
    parent_id: str,
    name: str,
    grade: int,
    avatar: str = "🦁",
    cognitive_profile: Optional[Dict[str, Any]] = None,
    kid_id: Optional[str] = None,
) -> Dict[str, Any]:
    if not kid_id:
        kid_id = f"kid_{random.randint(1000, 9999)}_{int(time.time()) % 10000}"
    now = time.time()
    if not cognitive_profile:
        cognitive_profile = {
            "attention_span_minutes": 10,
            "recommended_micro_task_duration_sec": 120,
            "working_memory_capacity": 2,
            "rsd_sensitivity_level": "HIGH",
            "scaffolding_level": "MODERATE",
            "max_steps_per_session": 3,
        }

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO children (kid_id, parent_id, name, grade, avatar, stars, cognitive_profile_json, created_at)
               VALUES (?, ?, ?, ?, ?, 0, ?, ?);""",
            (
                kid_id,
                parent_id,
                name,
                grade,
                avatar,
                json.dumps(cognitive_profile, ensure_ascii=False),
                now,
            ),
        )

        # Generate 6-digit code: format '123-456'
        code = f"{random.randint(100, 999)}-{random.randint(100, 999)}"
        expires_at = now + (30 * 24 * 3600)  # 30 days
        cursor.execute(
            "INSERT INTO pairing_codes (code, kid_id, parent_id, expires_at, is_used) VALUES (?, ?, ?, ?, 0);",
            (code, kid_id, parent_id, expires_at),
        )

        # Initialize empty roadmap & default routines
        cursor.execute(
            """INSERT INTO child_roadmaps (kid_id, roadmap_json, current_roadmap_index, current_step_index, pending_ticket_json, updated_at)
               VALUES (?, '[]', 0, 0, NULL, ?);""",
            (kid_id, now),
        )

        cursor.execute(
            """INSERT INTO child_routines (kid_id, routines_json, completed_routine_ids_json, photo_proofs_json, updated_at)
               VALUES (?, '[]', '[]', '{}', ?);""",
            (kid_id, now),
        )

        conn.commit()

    return {
        "kid_id": kid_id,
        "parent_id": parent_id,
        "name": name,
        "grade": grade,
        "avatar": avatar,
        "stars": 0,
        "pairing_code": code,
        "cognitive_profile": cognitive_profile,
        "created_at": now,
    }


def generate_new_pairing_code(kid_id: str, parent_id: str = "parent_lan_01") -> str:
    code = f"{random.randint(100, 999)}-{random.randint(100, 999)}"
    now = time.time()
    expires_at = now + (30 * 24 * 3600)
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO pairing_codes (code, kid_id, parent_id, expires_at, is_used) VALUES (?, ?, ?, ?, 0);",
            (code, kid_id, parent_id, expires_at),
        )
        conn.commit()
    return code


def verify_pairing_code(raw_code: str) -> Optional[Dict[str, Any]]:
    # Normalize: strip and handle dashes (e.g. 729184 or 729-184)
    c = raw_code.strip()
    if len(c) == 6 and c.isdigit():
        c = f"{c[:3]}-{c[3:]}"

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT p.code, p.kid_id, p.parent_id, c.name, c.grade, c.avatar, c.stars, c.cognitive_profile_json
               FROM pairing_codes p
               JOIN children c ON p.kid_id = c.kid_id
               WHERE p.code = ? AND p.expires_at > ?;""",
            (c, time.time()),
        )
        r = cursor.fetchone()
        if not r:
            return None

        cog = {}
        if r["cognitive_profile_json"]:
            try:
                cog = json.loads(r["cognitive_profile_json"])
            except Exception:
                pass

        return {
            "kid_id": r["kid_id"],
            "parent_id": r["parent_id"],
            "name": r["name"],
            "grade": r["grade"],
            "avatar": r["avatar"],
            "stars": r["stars"],
            "cognitive_profile": cog,
            "pairing_code": r["code"],
        }


def get_child_state(kid_id: str) -> Dict[str, Any]:
    child = get_child_by_id(kid_id)
    if not child:
        return {}

    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Roadmap
        cursor.execute("SELECT * FROM child_roadmaps WHERE kid_id = ?;", (kid_id,))
        rm_row = cursor.fetchone()
        roadmap = []
        curr_rm_idx = 0
        curr_st_idx = 0
        pending_ticket = None
        if rm_row:
            try:
                roadmap = json.loads(rm_row["roadmap_json"])
            except Exception:
                pass
            curr_rm_idx = rm_row["current_roadmap_index"]
            curr_st_idx = rm_row["current_step_index"]
            if rm_row["pending_ticket_json"]:
                try:
                    pending_ticket = json.loads(rm_row["pending_ticket_json"])
                except Exception:
                    pass

        # Routines
        cursor.execute("SELECT * FROM child_routines WHERE kid_id = ?;", (kid_id,))
        rt_row = cursor.fetchone()
        routines = []
        completed_rt_ids = []
        photo_proofs = {}
        if rt_row:
            try:
                routines = json.loads(rt_row["routines_json"])
            except Exception:
                pass
            try:
                completed_rt_ids = json.loads(rt_row["completed_routine_ids_json"])
            except Exception:
                pass
            try:
                photo_proofs = json.loads(rt_row["photo_proofs_json"])
            except Exception:
                pass

        return {
            "kid_id": kid_id,
            "profile": child,
            "stars": child["stars"],
            "child_roadmap": roadmap,
            "current_roadmap_index": curr_rm_idx,
            "current_step_index": curr_st_idx,
            "pending_ticket": pending_ticket,
            "child_routine_roadmap": routines,
            "completed_routine_ids": completed_rt_ids,
            "routine_photo_proofs": photo_proofs,
        }


def save_child_roadmap(
    kid_id: str,
    roadmap: List[Dict[str, Any]],
    current_roadmap_index: int = 0,
    current_step_index: int = 0,
    pending_ticket: Optional[Dict[str, Any]] = None,
):
    if kid_id == "kid_milo_01":
        kid_id = "kid_leo_01"
    child = get_child_by_id(kid_id)
    if not child:
        create_child("parent_lan_01", f"Bé {kid_id}", 1, "🦁", kid_id=kid_id)
    now = time.time()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT OR REPLACE INTO child_roadmaps (kid_id, roadmap_json, current_roadmap_index, current_step_index, pending_ticket_json, updated_at)
               VALUES (?, ?, ?, ?, ?, ?);""",
            (
                kid_id,
                json.dumps(roadmap, ensure_ascii=False),
                current_roadmap_index,
                current_step_index,
                json.dumps(pending_ticket, ensure_ascii=False) if pending_ticket else None,
                now,
            ),
        )
        conn.commit()


def save_child_routines(
    kid_id: str,
    routines: List[Dict[str, Any]],
    completed_ids: Optional[List[str]] = None,
    photo_proofs: Optional[Dict[str, Any]] = None,
):
    child = get_child_by_id(kid_id)
    if not child:
        create_child("parent_lan_01", f"Bé {kid_id}", 1, "🦁", kid_id=kid_id)
    now = time.time()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT OR REPLACE INTO child_routines (kid_id, routines_json, completed_routine_ids_json, photo_proofs_json, updated_at)
               VALUES (?, ?, ?, ?, ?);""",
            (
                kid_id,
                json.dumps(routines, ensure_ascii=False),
                json.dumps(completed_ids or [], ensure_ascii=False),
                json.dumps(photo_proofs or {}, ensure_ascii=False),
                now,
            ),
        )
        conn.commit()


def update_child_stars(kid_id: str, stars: int):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE children SET stars = ? WHERE kid_id = ?;", (stars, kid_id))
        conn.commit()


def update_child_state(
    kid_id: str,
    stars: Optional[int] = None,
    current_roadmap_index: Optional[int] = None,
    current_step_index: Optional[int] = None,
):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if stars is not None:
            cursor.execute("UPDATE children SET stars = ? WHERE kid_id = ?;", (stars, kid_id))
        if current_roadmap_index is not None or current_step_index is not None:
            cursor.execute("SELECT current_roadmap_index, current_step_index FROM child_roadmaps WHERE kid_id = ?;", (kid_id,))
            row = cursor.fetchone()
            if row:
                cri = current_roadmap_index if current_roadmap_index is not None else row["current_roadmap_index"]
                csi = current_step_index if current_step_index is not None else row["current_step_index"]
                cursor.execute(
                    "UPDATE child_roadmaps SET current_roadmap_index = ?, current_step_index = ?, updated_at = ? WHERE kid_id = ?;",
                    (cri, csi, time.time(), kid_id)
                )
        conn.commit()


def update_child_routines(
    kid_id: str,
    routines: List[Dict[str, Any]],
    completed_ids: Optional[List[str]] = None,
    photo_proofs: Optional[Dict[str, Any]] = None,
):
    return save_child_routines(kid_id, routines, completed_ids, photo_proofs)


def update_child_cognitive_profile(kid_id: str, profile: Dict[str, Any]):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE children SET cognitive_profile_json = ? WHERE kid_id = ?;",
            (json.dumps(profile, ensure_ascii=False), kid_id),
        )
        conn.commit()


def log_activity(kid_id: str, event_type: str, payload: Dict[str, Any]):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO activity_logs (kid_id, event_type, payload_json, timestamp) VALUES (?, ?, ?, ?);",
            (kid_id, event_type, json.dumps(payload, ensure_ascii=False), time.time()),
        )
        conn.commit()
