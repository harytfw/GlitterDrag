import json
import toml
import os


json_obj = None
json_path = os.path.abspath( "../src/_locales/en/messages.json")
print(json_path)
with open(json_path) as f:
    json_obj = json.loads(f.read())

with open("output.toml","w") as f:
    f.write(toml.dumps(json_obj))
print("done")