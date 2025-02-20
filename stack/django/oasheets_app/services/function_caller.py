import copy
import json
from django.conf import settings
import openai

class OasheetsFunctionCaller:
    """Uses OpenAI function calling to generate and validate schemas"""

    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    def generate_schema(self, prompt):
        """Generate schema using function calling"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a database schema designer assistant."},
                    {"role": "user", "content": f"Create a database schema for: {prompt}"}
                ],
                tools=[{
                    "type": "function",
                    "function": {
                        "name": "generate_database_schema",
                        "description": "Generate a comprehensive database schema with multiple content types",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "content_types": {
                                    "type": "array",
                                    "description": "Array of content types (minimum 4 recommended)",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "model_name": {"type": "string"},
                                            "fields": {
                                                "type": "array",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "label": {"type": "string"},
                                                        "machine_name": {"type": "string"},
                                                        "field_type": {"type": "string", "enum": [
                                                            "Auto Increment ID", "UUID", "Slug", "Text", "TextArea",
                                                            "Integer", "Decimal", "Percent", "Price", "Boolean",
                                                            "Email", "Phone", "Address", "Password", "URL", "Date",
                                                            "DateTime", "Time", "DateRange", "Image", "Audio",
                                                            "Video", "Media", "Enum", "FlatList", "JSON",
                                                            "Base64String", "Coordinates", "Foreign Key"
                                                        ]},
                                                        "cardinality": {"type": ["number", "string"]},
                                                        "required": {"type": "boolean"},
                                                        "relationship": {"type": "string"},
                                                        "default": {"type": ["string", "null"]},
                                                        "example": {"type": "string"}
                                                    },
                                                    "required": [
                                                        "label", "machine_name", "field_type",
                                                        "cardinality", "required", "default", "example"
                                                    ]
                                                }
                                            }
                                        },
                                        "required": ["model_name", "fields"]
                                    }
                                }
                            },
                            "required": ["content_types"]
                        }
                    }
                }],
                tool_choice={"type": "function", "function": {"name": "generate_database_schema"}}
            )

            tool_calls = response.choices[0].message.tool_calls
            if tool_calls:
                function_args = json.loads(tool_calls[0].function.arguments)
                return function_args

            return None

        except Exception as e:
            print(f"Error using function calling: {e}")
            return None

    def enhance_schema(self, initial_schema):
        """Enhance an existing schema using function calling"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a database schema enhancement assistant."},
                    {"role": "user",
                     "content": f"Enhance this schema by adding missing fields, relationships, and ensuring comprehensive coverage:\n{json.dumps(initial_schema)}"}
                ],
                tools=[{
                    "type": "function",
                    "function": {
                        "name": "enhance_database_schema",
                        "description": "Enhance an existing database schema",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "enhancements": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "model_name": {"type": "string"},
                                            "action": {"type": "string", "enum": ["add", "modify"]},
                                            "fields_to_add": {
                                                "type": "array",
                                                "items": {
                                                    # Same field definition as in generate_database_schema
                                                }
                                            },
                                            "models_to_add": {
                                                "type": "array",
                                                "items": {
                                                    # Same model definition as in generate_database_schema
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }],
                tool_choice={"type": "function", "function": {"name": "enhance_database_schema"}}
            )

            tool_calls = response.choices[0].message.tool_calls
            if tool_calls:
                function_args = json.loads(tool_calls[0].function.arguments)
                return self._apply_enhancements(initial_schema, function_args)

            return initial_schema

        except Exception as e:
            print(f"Error enhancing schema: {e}")
            return initial_schema

    def _apply_enhancements(self, original_schema, enhancements):
        """Apply enhancements to the original schema"""
        # Implementation to merge enhancements
        # ...
        enhanced_schema = original_schema
        return enhanced_schema
