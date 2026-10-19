import json
from jsonschema import Draft7Validator

micro_task_schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "ADHDMicroTaskSession",
    "description": "Standardized JSON Schema Draft-07 for ADHD Elementary (Grade 1-5) Micro-Task Scaffolding Sessions",
    "type": "object",
    "required": [
        "session_id",
        "task_metadata",
        "micro_tasks",
        "final_summary"
    ],
    "properties": {
        "session_id": {
            "type": "string",
            "description": "Unique identifier for the session, e.g. UUID or timestamped token."
        },
        "task_metadata": {
            "type": "object",
            "required": [
                "benchmark_id",
                "original_title",
                "grade",
                "subject",
                "total_micro_tasks",
                "total_estimated_duration_sec"
            ],
            "properties": {
                "benchmark_id": {
                    "type": "string",
                    "description": "Identifier matching benchmark item, e.g. 'G3-M-01'."
                },
                "original_title": {
                    "type": "string",
                    "description": "Original exercise title or description."
                },
                "grade": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 5,
                    "description": "Elementary school grade level."
                },
                "subject": {
                    "type": "string",
                    "enum": ["toan", "tieng_viet", "tieng_anh", "khoa_hoc_tu_nhien"],
                    "description": "Subject category according to GDPT 2018."
                },
                "target_cognitive_profile": {
                    "type": "object",
                    "properties": {
                        "attention_span_minutes": {"type": "integer", "minimum": 5, "maximum": 25},
                        "recommended_micro_task_duration_sec": {"type": "integer", "minimum": 60, "maximum": 300},
                        "working_memory_capacity": {"type": "integer", "minimum": 1, "maximum": 5},
                        "rsd_sensitivity_level": {"type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "SEVERE"]},
                        "scaffolding_level": {"type": "string", "enum": ["MINIMAL", "MODERATE", "INTENSIVE"]}
                    }
                },
                "total_micro_tasks": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 10,
                    "description": "Total number of atomic micro-tasks in this session."
                },
                "total_estimated_duration_sec": {
                    "type": "integer",
                    "minimum": 60,
                    "maximum": 1800,
                    "description": "Sum of all micro-task durations in seconds."
                }
            }
        },
        "micro_tasks": {
            "type": "array",
            "minItems": 1,
            "maxItems": 10,
            "description": "Ordered sequence of atomic pedagogical micro-tasks.",
            "items": {
                "type": "object",
                "required": [
                    "step_id",
                    "title",
                    "action_verb",
                    "atomic_instruction",
                    "duration_sec",
                    "ui_type",
                    "ui_payload",
                    "cognitive_scaffolding",
                    "hints",
                    "success_criteria",
                    "immediate_reinforcer",
                    "is_final_step"
                ],
                "properties": {
                    "step_id": {
                        "type": "integer",
                        "minimum": 1,
                        "description": "1-indexed sequential step number."
                    },
                    "title": {
                        "type": "string",
                        "maxLength": 60,
                        "description": "Concise step title (max 60 chars)."
                    },
                    "action_verb": {
                        "type": "string",
                        "pattern": "^[a-zA-ZÀ-ỹ_]+$",
                        "description": "Exactly ONE single direct action verb (e.g. 'Đọc', 'Gạch chân', 'Chọn', 'Tính', 'Điền', 'Kéo')."
                    },
                    "atomic_instruction": {
                        "type": "string",
                        "maxLength": 150,
                        "description": "Single-sentence atomic instruction without compound subordinate clauses (<= 25 words)."
                    },
                    "duration_sec": {
                        "type": "integer",
                        "minimum": 60,
                        "maximum": 300,
                        "description": "Duration allocated to this micro-task in seconds (strictly 60s - 300s)."
                    },
                    "ui_type": {
                        "type": "string",
                        "enum": [
                            "single_choice",
                            "multiple_choice",
                            "text_input",
                            "drag_drop",
                            "audio_listen",
                            "highlight",
                            "checkbox",
                            "order_sequencing"
                        ],
                        "description": "Interactive UI modality for the student."
                    },
                    "ui_payload": {
                        "type": "object",
                        "description": "Dynamic parameters specific to the selected ui_type.",
                        "properties": {
                            "prompt_text": {"type": "string"},
                            "options": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "placeholder": {"type": "string"},
                            "items_to_drag": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "drop_targets": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "audio_text": {"type": "string"},
                            "highlight_target_segments": {
                                "type": "array",
                                "items": {"type": "string"}
                            }
                        }
                    },
                    "cognitive_scaffolding": {
                        "type": "object",
                        "required": [
                            "scaffolding_type",
                            "cognitive_load_level",
                            "working_memory_items",
                            "explanation"
                        ],
                        "properties": {
                            "scaffolding_type": {
                                "type": "string",
                                "enum": [
                                    "worked_example",
                                    "fill_in_the_blank",
                                    "visual_cue",
                                    "sub_question",
                                    "verification_check"
                                ]
                            },
                            "cognitive_load_level": {
                                "type": "string",
                                "enum": ["low", "medium", "high"]
                            },
                            "working_memory_items": {
                                "type": "integer",
                                "minimum": 1,
                                "maximum": 5,
                                "description": "Number of information chunks held concurrently in memory."
                            },
                            "explanation": {
                                "type": "string",
                                "description": "Neuroscience-backed pedagogical justification for this scaffolding step."
                            }
                        }
                    },
                    "hints": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 3,
                        "items": {"type": "string"},
                        "description": "Progressive scaffolding hints (Level 1 Nudge, Level 2 Clue, Level 3 Guide)."
                    },
                    "success_criteria": {
                        "type": "object",
                        "required": [
                            "evaluation_type",
                            "expected_answer",
                            "feedback_on_error"
                        ],
                        "properties": {
                            "evaluation_type": {
                                "type": "string",
                                "enum": [
                                    "exact_match",
                                    "regex_match",
                                    "option_index",
                                    "keyword_containment",
                                    "numeric_tolerance"
                                ]
                            },
                            "expected_answer": {
                                "type": ["string", "number", "boolean", "array"],
                                "description": "The expected value for step completion."
                            },
                            "tolerance": {
                                "type": "number",
                                "description": "Allowed delta for numerical checks."
                            },
                            "feedback_on_error": {
                                "type": "string",
                                "description": "Gentle, non-punitive, RSD-safe corrective guidance."
                            }
                        }
                    },
                    "immediate_reinforcer": {
                        "type": "object",
                        "required": [
                            "visual_asset",
                            "audio_cue",
                            "dopamine_points"
                        ],
                        "properties": {
                            "visual_asset": {
                                "type": "string",
                                "enum": [
                                    "sparkle_star_01",
                                    "particle_burst_gold",
                                    "milo_thumbs_up",
                                    "badge_math_explorer",
                                    "confetti_cannon"
                                ]
                            },
                            "audio_cue": {
                                "type": "string",
                                "enum": [
                                    "positive_bell_c6",
                                    "sparkle_ting_short",
                                    "harp_glissando_soft",
                                    "gentle_pop_success"
                                ]
                            },
                            "dopamine_points": {
                                "type": "integer",
                                "minimum": 10,
                                "maximum": 100
                            }
                        }
                    },
                    "is_final_step": {
                        "type": "boolean",
                        "description": "Flag indicating if this step yields the final problem answer."
                    }
                }
            }
        },
        "final_summary": {
            "type": "object",
            "required": [
                "final_answer_step_id",
                "extracted_final_answer",
                "pedagogical_wrap_up"
            ],
            "properties": {
                "final_answer_step_id": {
                    "type": "integer",
                    "minimum": 1,
                    "description": "The step_id of the micro-task that produced the final answer."
                },
                "extracted_final_answer": {
                    "type": "string",
                    "description": "The final conclusion/answer formatted as text or number to compare with ground truth final_answer."
                },
                "pedagogical_wrap_up": {
                    "type": "string",
                    "description": "Summary synthesizing what the child accomplished."
                }
            }
        }
    }
}

Draft7Validator.check_schema(micro_task_schema)
print("Schema is valid Draft-07!")
with open("test_schema_check.json", "w", encoding="utf-8") as f:
    json.dump(micro_task_schema, f, ensure_ascii=False, indent=2)
