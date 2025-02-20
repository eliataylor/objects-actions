import json

from ..models import OasheetsSchemaDefinition
from ..serializers import OasheetsSchemaDefinitionSerializer
from ..services.assistant_manager import OasheetsAssistantManager
from ..services.function_caller import OasheetsFunctionCaller


class OasheetsGeneratorService:
    """Orchestrates the schema generation process using multiple components"""

    def __init__(self, user):
        # self.vector_store = OasheetsVectorStore()
        self.function_caller = OasheetsFunctionCaller()
        self.assistant_manager = OasheetsAssistantManager(user)

    def generate_schema(self, prompt, user):
        """Generate a comprehensive schema using multiple approaches"""
        try:
            response, schema = self.assistant_manager.generate_schema(prompt)
            schema_obj = OasheetsSchemaDefinition.objects.create(
                prompt=prompt,
                response=response,
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

    def enhance_schema(self, new_prompt, original_schema_id, user):
        """
        Enhance an existing schema based on a new prompt.

        Args:
            new_prompt (str): The new requirements or modifications
            original_schema_id (int): ID of the original schema to enhance
            user (User): The user requesting the enhancement

        Returns:
            dict: Enhanced schema data or None if failed
        """
        try:
            # Get the original schema
            original_schema = OasheetsSchemaDefinition.objects.get(id=original_schema_id)

            # Create an enhanced prompt that includes the original schema
            enhanced_prompt = (
                f"Enhance the following database schema based on these new requirements: {new_prompt}\n\n"
                f"Original schema prompt: {original_schema.prompt}\n\n"
                f"Original schema: {json.dumps(original_schema.schema, indent=2)}"
            )

            # Use the assistant manager to generate an enhanced schema
            new_schema_json = self.assistant_manager.generate_schema(enhanced_prompt)

            if not new_schema_json:
                return None

            # Find the root parent if this schema is already a version
            root_parent = original_schema.parent or original_schema

            # Create a new schema definition record with versioning
            schema_definition = OasheetsSchemaDefinition.objects.create(
                prompt=f"{original_schema.prompt} [Enhanced: {new_prompt}]",
                response=json.dumps(new_schema_json),
                schema=new_schema_json,
                author=user,
                parent=root_parent,
                version_notes=new_prompt,
                is_latest=True
            )

            # Mark the original schema as not latest if it was the latest
            if original_schema.is_latest and original_schema.id != root_parent.id:
                original_schema.is_latest = False
                original_schema.save(update_fields=['is_latest'])

            return OasheetsSchemaDefinitionSerializer(schema_definition).data

        except OasheetsSchemaDefinition.DoesNotExist:
            print(f"Original schema with ID {original_schema_id} not found")
            return None
        except Exception as e:
            print(f"Error enhancing schema: {str(e)}")
            return None
