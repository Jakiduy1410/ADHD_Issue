import json
import jsonschema

# Validate benchmark schema
with open('schemas/grade_1_to_5_benchmark_schema.json', encoding='utf-8') as f:
    bench_schema = json.load(f)
jsonschema.Draft7Validator.check_schema(bench_schema)
print("Benchmark schema is valid Draft-07!")

# Validate benchmark dataset against benchmark schema
with open('data/curriculum/grade_1_to_5_benchmark.json', encoding='utf-8') as f:
    bench_data = json.load(f)
jsonschema.validate(instance=bench_data, schema=bench_schema)
print("Benchmark data conforms 100% to Benchmark schema!")

# Validate micro_task schema
with open('schemas/micro_task_schema.json', encoding='utf-8') as f:
    micro_schema = json.load(f)
jsonschema.Draft7Validator.check_schema(micro_schema)
print("Micro-task schema is valid Draft-07!")

# Validate adhd parent survey schema and data
with open('data/surveys/adhd_parent_survey.json', encoding='utf-8') as f:
    survey_data = json.load(f)
assert len(survey_data['questions']) == 9
print("ADHD parent survey has exactly 9 questions!")
