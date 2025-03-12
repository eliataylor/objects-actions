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
