import json

with open('models.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

free_models = [m['id'] for m in data['data'] if ':free' in m['id']]
print(json.dumps(free_models, indent=2))
