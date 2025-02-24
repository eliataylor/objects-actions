import json

from ..models import SchemaVersions
from ..serializers import SchemaVersionSerializer
from ..services.assistant_manager import OpenAIPromptManager


class Prompt2SchemaService:
    """Orchestrates the schema generation process using multiple components"""

    def __init__(self, user, variant):
        self.assistant_manager = OpenAIPromptManager(user, variant)

    def load_config(self, config_id, thread_id=None, message_id=None, run_id=None):
        return self.assistant_manager.load_config(config_id, thread_id, message_id, run_id)

    def set_config(self, config):
        self.assistant_manager.set_config(config)


    def generate_schema(self, prompt, privacy, user):
        """Generate a comprehensive schema using multiple approaches"""
        try:
            response, schema = self.assistant_manager.generate_schema(prompt)
            config = self.assistant_manager.get_assistant_config()
            schema_obj = SchemaVersions.objects.create(
                prompt=prompt,
                response=response,
                privacy=privacy,
                config_id=config.id,
                assistant_id=config.assistant_id,
                thread_id=config.thread_id,
                message_id=config.message_id,
                run_id=config.run_id,
                schema=schema,
                author=user if user.is_authenticated else None
            )

            return SchemaVersionSerializer(schema_obj).data

        except Exception as e:
            print(f"Error in schema generation: {e}")
            return None

    def enhance_schema(self, prompt, privacy, user, schema_version):
        """
        Enhance an existing schema based on a new prompt.

        Args:
            prompt (str): The new requirements or modifications
            user (User): The user requesting the enhancement
            privacy (str): Privacy.choices
            schema_version (SchemaVersions): original schema to enhance

        Returns:
            dict: Enhanced schema data or None if failed
        """
        try:

            # Create an enhanced prompt that includes the original schema
            enhanced_prompt = (
                f"{prompt}\n\n"
                f"Apply changes to this Schema: ```{json.dumps(schema_version.schema, indent=2)}```"
            )

            # Use the assistant manager to generate an enhanced schema
            response, new_schema_json = self.assistant_manager.generate_schema(enhanced_prompt)
            config = self.assistant_manager.get_assistant_config()

            # Create a new schema definition record with versioning
            schema_definition = SchemaVersions.objects.create(
                prompt=prompt,
                response=response,
                config_id=config.id,
                assistant_id=config.assistant_id,
                thread_id=config.thread_id,
                message_id=config.message_id,
                run_id=config.run_id,
                privacy=privacy,
                schema=new_schema_json,
                author=user if user.is_authenticated else None,
                parent_id=schema_version.id,
                version_notes=enhanced_prompt,
            )

            return SchemaVersionSerializer(schema_definition).data

        except SchemaVersions.DoesNotExist:
            print(f"Original schema with ID {schema_version} not found")
            return None
        except Exception as e:
            print(f"Error enhancing schema: {str(e)}")
            return None

    """
    Orchestrates schema generation, now with a streaming implementation.
    """
    def generate_via_stream(self, prompt, privacy, user):
        """
        Stream the reasoning and schema generation process.
        """
        try:
            response_generator = self.assistant_manager.get_schema_stream(prompt)
            config = self.assistant_manager.get_assistant_config()
            schema_version = SchemaVersions.objects.create(
                prompt=prompt,
                privacy=privacy,
                assistant_id=config.assistant_id,
                thread_id=config.thread_id,
                message_id=config.message_id,
                run_id=config.run_id,
                author = user if user.is_authenticated else None
            )

            reasoning_chunks = []

            for chunk in response_generator:
                yield json.dumps({"reasoning": chunk}) + "\n"
                reasoning_chunks.append(chunk)

            # Parse JSON only after the stream is complete
            full_reasoning = "\n".join(reasoning_chunks)
            schema_json = self.assistant_manager.extract_json(full_reasoning)

            if schema_json:
                schema_version = SchemaVersions.objects.filter(pk=config.id).update(
                    response=full_reasoning,
                    schema=schema_json
                )
                yield json.dumps({"config_id": schema_version.id, "schema": schema_json}) + "\n"
            else:
                yield json.dumps({"config_id": schema_version.id, "response": full_reasoning}) + "\n"

        except Exception as e:
            yield json.dumps({"error": f"Schema generation failed: {str(e)}"}) + "\n"

    def enhance_via_stream(self, prompt, privacy, user, schema_version):
        """
        Enhance an existing schema based on a new prompt.

        Args:
            privacy (str): Privacy.choices
            prompt (str): The new requirements or modifications
            user (User): The user requesting the enhancement
            schema_version (SchemaVersions): original schema to enhance

        Returns:
            dict: Enhanced schema data or None if failed
        """
        try:

            # Create an enhanced prompt that includes the original schema
            enhanced_prompt = (
                f"{prompt}\n\n"
                f"Apply changes to this Schema: ```json{json.dumps(schema_version.schema, indent=2)}```"
            )

            # Use the assistant manager to generate an enhanced schema
            response, new_schema_json = self.assistant_manager.get_schema_stream(enhanced_prompt)
            config = self.assistant_manager.get_assistant_config()

            # Create a new schema definition record with versioning
            schema_definition = SchemaVersions.objects.create(
                prompt=prompt,
                response=response,
                config_id=config.id,
                assistant_id=config.assistant_id,
                thread_id=config.thread_id,
                message_id=config.message_id,
                run_id=config.run_id,
                privacy=privacy,
                schema=new_schema_json,
                author=user if user.is_authenticated else None,
                parent_id=schema_version.id,
                version_notes=enhanced_prompt,
            )

            return SchemaVersionSerializer(schema_definition).data

        except SchemaVersions.DoesNotExist:
            print(f"Original schema with ID {schema_version} not found")
            return None
        except Exception as e:
            print(f"Error enhancing schema: {str(e)}")
            return None
