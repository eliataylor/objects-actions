import glob
import json
import os

from django.conf import settings


class OasheetsExamplesRepository:
    """Manages a repository of schema examples stored as files"""

    def __init__(self):
        self.examples_dir = os.path.join(settings.ROOT_DIR, 'oasheets_app/fixtures')
        os.makedirs(self.examples_dir, exist_ok=True)

    def save_example(self, domain, schema_json, metadata=None):
        """Save a schema example to the repository"""
        try:
            # Sanitize domain name for filename
            filename = domain.lower().replace(' ', '_').replace('-', '_')

            example_data = {
                'domain': domain,
                'schema': schema_json,
                'metadata': metadata or {}
            }

            with open(os.path.join(self.examples_dir, f"{filename}.json"), 'w') as f:
                json.dump(example_data, f, indent=2)

            return True
        except Exception as e:
            print(f"Error saving schema example: {e}")
            return False

    def get_example(self, domain):
        """Get a specific schema example by domain"""
        try:
            filename = domain.lower().replace(' ', '_').replace('-', '_')
            file_path = os.path.join(self.examples_dir, f"{filename}.json")

            if not os.path.exists(file_path):
                return None

            with open(file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading schema example: {e}")
            return None

    def get_all_examples(self):
        """Get all schema examples"""
        examples = []
        for file_path in glob.glob(os.path.join(self.examples_dir, "*.json")):
            try:
                with open(file_path, 'r') as f:
                    examples.append(json.load(f))
            except Exception as e:
                print(f"Error loading schema file {file_path}: {e}")

        return examples

    def search_examples(self, query):
        """Simple keyword search in schema examples"""
        query = query.lower()
        results = []

        for example in self.get_all_examples():
            # Search in domain and metadata
            if query in example['domain'].lower():
                results.append(example)
                continue

            # Search in schema field names and model names
            found = False
            for content_type in example['schema'].get('content_types', []):
                if query in content_type.get('model_name', '').lower():
                    found = True
                    break

                for field in content_type.get('fields', []):
                    if (query in field.get('label', '').lower() or
                            query in field.get('machine_name', '').lower()):
                        found = True
                        break

                if found:
                    results.append(example)
                    break

        return results
