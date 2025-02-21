import json

from ..models import OasheetsSchemaDefinition
from ..serializers import OasheetsSchemaDefinitionSerializer
from ..services.assistant_manager import OasheetsAssistantManager


class OasheetsGeneratorService:
    """Orchestrates the schema generation process using multiple components"""

    def __init__(self, user):
        self.assistant_manager = OasheetsAssistantManager(user)

    def load_assistant(self, config_id, thread_id=None, message_id=None, run_id=None):
        self.assistant_manager.load_assistant(config_id, thread_id, message_id, run_id)

    def generate_schema(self, prompt, user):
        """Generate a comprehensive schema using multiple approaches"""
        try:
            response, schema = self.assistant_manager.generate_schema(prompt)
            config = self.assistant_manager.get_assistant_config()
            schema_obj = OasheetsSchemaDefinition.objects.create(
                prompt=prompt,
                response=response,
                assistantconfig=config,
                schema=schema,
                author=user
            )

            # 8. Store as a new example if it's high quality
            # if enhanced_schema and len(enhanced_schema.get('content_types', [])) >= 4:
            # self.vector_store.create_example_embedding(prompt, enhanced_schema)

            return OasheetsSchemaDefinitionSerializer(schema_obj).data

        except Exception as e:
            print(f"Error in schema generation: {e}")
            return None

    def enhance_schema(self, prompt, schema_version, user):
        """
        Enhance an existing schema based on a new prompt.

        Args:
            prompt (str): The new requirements or modifications
            schema_version (int): ID of the original schema to enhance
            user (User): The user requesting the enhancement

        Returns:
            dict: Enhanced schema data or None if failed
        """
        try:
            # Get the original schema
            original_schema = OasheetsSchemaDefinition.objects.get(id=schema_version)

            # Create an enhanced prompt that includes the original schema
            enhanced_prompt = (
                f"Enhance the following database schema based on these new requirements: {prompt}\n\n"
                f"Original schema prompt: {original_schema.prompt}\n\n"
                f"Original schema: {json.dumps(original_schema.schema, indent=2)}"
            )

            # Use the assistant manager to generate an enhanced schema
            response, new_schema_json = self.assistant_manager.generate_schema(enhanced_prompt)
            config = self.assistant_manager.get_assistant_config()

            # Create a new schema definition record with versioning
            schema_definition = OasheetsSchemaDefinition.objects.create(
                prompt=prompt,
                response=response,
                assistantconfig=config,
                schema=new_schema_json,
                author=user,
                parent_id=schema_version,
                version_notes=enhanced_prompt,
            )

            return OasheetsSchemaDefinitionSerializer(schema_definition).data

        except OasheetsSchemaDefinition.DoesNotExist:
            print(f"Original schema with ID {schema_version} not found")
            return None
        except Exception as e:
            print(f"Error enhancing schema: {str(e)}")
            return None
