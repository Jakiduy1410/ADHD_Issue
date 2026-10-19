## 2026-10-17T13:14:47Z
You are Architecture & Benchmark Explorer (Survey Phase).
Your working directory is: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_survey_3\
The authoritative user request is located at: c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md
You MUST read c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.

Your task:
1. Inspect the workspace execution environment:
   - Check `.env` (verify presence of GEMINI_API_KEY without exposing secret value).
   - Check Python environment and available packages (`google-genai`, `google-generativeai`, `jsonschema`, `pydantic`, `asyncio`, etc.).
2. Design JSON Schema draft-07 specification for Micro-Tasks (Requirement R3):
   - Requirements: step duration (60s-300s), 1 single action verb per step, `ui_type` (single_choice, text_input, drag_drop, audio_listen, etc.), cognitive scaffolding, hints, success criteria.
3. Design the Two-Stage Prompt Pipeline & Encouragement Prompts (Requirement R3):
   - Stage 1: Problem classification & cognitive requirement extraction.
   - Stage 2: Pedagogical micro-task decomposition parameterized by Child Cognitive Profile.
   - Encouragement prompts: RSD calming and effort-based praise for parents.
4. Design the Automated Benchmark Engine in Python (Requirement R4):
   - Calling Gemini API reliably with async/concurrency or clean batching, retry logic with exponential backoff, rate limit handling.
   - Syntax validation against `schemas/micro_task_schema.json` (target >= 95%).
   - Ground truth matching between AI final output step and `final_answer` (target >= 90%).
   - Completeness check (ensuring all sub-questions/steps are addressed).
   - LLM-as-a-Judge prompt & rubric for pedagogical quality (Logic Flow, Cognitive Scaffolding, Hint Appropriateness, target >= 8.5/10).
   - Generation of `benchmark_report.json` and Markdown summary table.
5. Write your comprehensive analysis and architectural blueprint to:
   `c:\Users\ADMIN\Documents\antigravity\calm-bardeen\.agents\teamwork\explorer_survey_3\handoff.md`
6. Send a message to the orchestrator (conversation ID: 799fffd1-d215-47b1-9d09-7dfd1688ffaf) when complete.
