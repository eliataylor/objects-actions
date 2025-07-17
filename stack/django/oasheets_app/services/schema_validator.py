import json
import os
from django.conf import settings

class SchemaValidator:
    """Validates schemas for completeness and correctness"""

    def __init__(self):

        with open(os.path.join(settings.ROOT_DIR, 'oasheets_app/fixtures/field_types_definitions.json'), "r") as f:
            field_types_data = json.load(f)

        # Extract field names as a list
        self.valid_field_types = [field["label"] for field in field_types_data]

    def validate_schema(self, schema):
        """
        Validates if a schema follows the required format and uses only approved field types.

        Args:
            schema (dict | string): The schema to validate.

        Returns:
            dict: Validation result including `is_valid`, `errors`, and optionally `corrected_schema`.
        """
        if isinstance(schema, str):
            schema = json.loads(schema)

        if isinstance(schema, dict) and "schema" in schema:
            schema = schema["schema"]  # only via openai functions parameters

        errors = []
        corrected_schema = {"content_types": []}

        if not isinstance(schema, dict) or "content_types" not in schema:
            return {
                "is_valid": False,
                "errors": ["Schema must be a dictionary containing 'content_types' key."]
            }

        for content_type in schema.get("content_types", []):
            if not isinstance(content_type, dict):
                errors.append("Each content type must be a dictionary.")
                continue

            required_keys = ["name", "model_name", "fields"]
            for key in required_keys:
                if key not in content_type:
                    errors.append(f"Missing key '{key}' in content type: {content_type.get('name', 'Unknown')}")

            fields = content_type.get("fields", [])
            if not isinstance(fields, list):
                errors.append(f"'fields' must be a list in content type: {content_type.get('name', 'Unknown')}")
                continue

            validated_fields = []
            for field in fields:
                if not isinstance(field, dict):
                    errors.append(f"Field must be a dictionary in content type: {content_type.get('name', 'Unknown')}")
                    continue

                field_keys = ["label", "field_type", "cardinality"]
                for key in field_keys:
                    if key not in field:
                        errors.append(f"Missing key '{key}' in field: {field.get('label', 'Unknown')}")

                if field.get("field_type") not in self.valid_field_types:
                    errors.append(
                        f"Invalid Field Type '{field.get('field_type')}' in field '{field.get('label')}'.")
                    field["field_type"] = field.get('field_type')

                validated_fields.append(field)

            corrected_schema["content_types"].append({
                "name": content_type.get("name", "Unknown"),
                "model_name": content_type.get("model_name", "Unknown"),
                "fields": validated_fields
            })

        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "corrected_schema": corrected_schema if errors else schema
        }
