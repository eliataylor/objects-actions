import openai
import json
from rest_framework import serializers

from .models import SpreadsheetDefinition

def find_json(string):
    start_index = min(string.find('{'), string.find('['))
    if start_index == -1:
        print('No JSON object found in the string.')
        return None
    end_char = ']' if string[start_index] == '[' else '}'
    end_index = string.rfind(end_char)
    if end_index == -1:
        print('Invalid JSON object format.')
        return None
    json_string = string[start_index:end_index + 1]
    try:
        json_object = json.loads(json_string)
        return json_object
    except json.JSONDecodeError as e:
        print('Error parsing JSON:', json_string, e)
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


class BotPromptSerializer(serializers.Serializer):
    prompt = serializers.CharField(required=True)


class SpreadsheetDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpreadsheetDefinition
        fields = ['prompt', 'schema', 'response', 'created_at', 'modified_at']
        read_only_fields = ['created_at', 'modified_at']
