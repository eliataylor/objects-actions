import json

def find_json(text):
    """Extract JSON object from a text response, handling multiple formats."""
    try:
        # Find JSON starting points: ```json, {, or [
        json_start_markers = [
            text.find("```json"),
            text.find("{"),
            text.find("[")
        ]

        # Get the first valid occurrence
        start = min(filter(lambda x: x != -1, json_start_markers), default=-1)
        if start == -1:
            print("No JSON object found in the string.")
            return None

        # If it's a markdown-style block, adjust start position
        if text.startswith("```json", start):
            start += 7  # Skip ```json marker
            end = text.find("```", start)
        else:
            # Determine correct closing character
            end_char = ']' if text[start] == '[' else '}'
            end = text.rfind(end_char)

        # Validate the end position
        if end != -1:
            end += 1  # Include closing bracket/brace
            json_str = text[start:end].strip()
            return json.loads(json_str)

        print("Invalid JSON object format.")
        return None
    except json.JSONDecodeError as e:
        print("Error decoding JSON:", e)
        return None

def sanitize_value(val):
    if isinstance(val, float) and (val == float('inf') or val == float('-inf') or val != val):
        return 9999 if val > 0 else -9999
    return val


def sanitize_json(obj):
    if isinstance(obj, dict):
        return {k: sanitize_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_json(item) for item in obj]
    else:
        return sanitize_value(obj)
