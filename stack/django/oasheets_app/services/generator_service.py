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
            response, schema = self.assistant_manager.request(prompt)
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

    def generate_via_stream(self, prompt, privacy, user):
        try:
            response_stream = self.assistant_manager.stream(prompt)
            config = self.assistant_manager.get_assistant_config()
            schema_version = SchemaVersions.objects.create(
                prompt=prompt,
                privacy=privacy,
                config=config,
                assistant_id=config.assistant_id,
                thread_id=config.thread_id,
                message_id=config.message_id,
                run_id=config.run_id,
                author = user if user.is_authenticated else None
            )

            yield from self.handle_stream(schema_version, config, response_stream)

        except Exception as e:
            yield json.dumps({"error": f"New schema failed: {str(e)}"}) + "\n"

    def enhance_via_stream(self, prompt, privacy, user, schema_version):
        try:

            response_stream = self.assistant_manager.stream(prompt)
            config = self.assistant_manager.get_assistant_config()
            schema_version = SchemaVersions.objects.create(
                prompt=prompt,
                config_id=config.id,
                assistant_id=config.assistant_id,
                thread_id=config.thread_id,
                message_id=config.message_id,
                run_id=config.run_id,
                privacy=privacy,
                author=user if user.is_authenticated else None,
                parent_id=schema_version.id
            )

            yield from self.handle_stream(schema_version, config, response_stream)

        except SchemaVersions.DoesNotExist:
            print(f"Original schema with ID {schema_version} not found")
            yield json.dumps({"error": f"Original schema with ID {schema_version.id} not found"}) + "\n"

        except Exception as e:
            print(f"Error enhancing schema: {str(e)}")
            yield json.dumps({"error": f"Edit failed: {str(e)}"}) + "\n"

    def handle_stream(self, schema_version, config, response_stream):

        doSave = False

        for response in response_stream:

            if "run_id" in response:
                schema_version.run_id = response['run_id']
                doSave = True
            if "thread_id" in response:
                schema_version.thread_id = response['thread_id']
                doSave = True
            if "schema" in response:
                schema_version.schema = response['schema']
                doSave = True

            if response["type"] == "reasoning":
                schema_version.response = response['content']

            yield json.dumps(response) + "\n"

        # fallback if we never get the schema or even a response
        if schema_version.schema is None:
            reasoning, schema = self.assistant_manager.request("Please generate the validated schema based on your recommendations")
            if schema_version.response is None and reasoning is not None:
                schema_version.response = reasoning
                doSave = True
            if schema is not None:
                schema_version.schema = schema
                yield json.dumps({"type": "requested_schema", "schema": schema}) + "\n"
                doSave = True

        if schema_version.schema is not None:
            # cleanup potential json inside reasoning body:
            schema_json = self.assistant_manager.extract_json(schema_version.response)
            if schema_json:
                schema_version.response = self.assistant_manager.remove_json(schema_version.response)
                doSave = True

        if doSave:
            schema_version.save()

        yield json.dumps({"type": "done", "version_id": schema_version.id, "config_id": config.id}) + "\n"
