"""
Syntax Validator for ADHD Micro-Task Decomposition.
Validates generated JSON against schemas/micro_task_schema.json using jsonschema.Draft7Validator.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import jsonschema


def get_default_micro_task_schema_path() -> Path:
    current_file = Path(__file__).resolve()
    repo_root = current_file.parents[2]
    return repo_root / "schemas" / "micro_task_schema.json"


class SyntaxValidator:
    """
    Validates model decomposition outputs against Draft-07 Micro-Task JSON Schema.
    """

    def __init__(self, schema_path: Optional[Union[str, Path]] = None) -> None:
        self.schema_path = Path(schema_path) if schema_path else get_default_micro_task_schema_path()
        if not self.schema_path.is_file():
            raise FileNotFoundError(f"Micro-task schema file not found at: {self.schema_path}")

        with open(self.schema_path, "r", encoding="utf-8") as f:
            self.schema = json.load(f)

        self.validator = jsonschema.Draft7Validator(self.schema)

    def validate(self, payload: Any) -> Tuple[bool, List[str]]:
        """
        Validates the payload against Draft-07 schema.
        Returns:
            (is_valid: bool, error_messages: List[str])
        """
        if not isinstance(payload, dict):
            return False, ["Payload must be a JSON dictionary"]

        errors = list(self.validator.iter_errors(payload))
        if not errors:
            return True, []

        error_msgs = []
        for e in errors:
            path_str = "/".join(str(p) for p in e.path) if e.path else "root"
            error_msgs.append(f"[{path_str}] {e.message}")

        return False, error_msgs

    def validate_with_details(self, payload: Any) -> Dict[str, Any]:
        """
        Validates the payload and returns a structured diagnostic report.
        """
        is_valid, errors = self.validate(payload)
        return {
            "is_valid": is_valid,
            "error_count": len(errors),
            "errors": errors,
        }
