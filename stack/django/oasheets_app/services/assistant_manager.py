import json
import os
import time

import openai
from django.conf import settings
from openai import OpenAIError

from .schema_validator import SchemaValidator
from ..models import PromptConfig


class OpenAIPromptManager:
    """Manages an OpenAI Assistant specialized for schema generation"""

    def __init__(self, user):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.user = user
        self.config = None

    def build_tools(self):
        # Load field types from JSON
        with open(os.path.join(settings.ROOT_DIR, 'oasheets_app/fixtures/field_types_definitions.json'), "r") as f:
            field_types_data = json.load(f)

        # Extract field names as a list
        valid_field_types = [field["name"] for field in field_types_data]

        tools = [
            {"type": "function",
             "function": {
                 "name": "validate_schema",
                 "description": "Validates if a schema follows the required format and uses only approved field types.",
                 "parameters": {
                     "type": "object",
                     "properties": {
                         "schema": {
                             "type": "object",
                             "description": "The generated schema to be validated.",
                             "properties": {
                                 "content_types": {
                                     "type": "array",
                                     "items": {
                                         "type": "object",
                                         "properties": {
                                             "name": {"type": "string"},
                                             "model_name": {"type": "string"},
                                             "fields": {
                                                 "type": "array",
                                                 "items": {
                                                     "type": "object",
                                                     "properties": {
                                                         "label": {
                                                             "type": "string",
                                                             "description": "The human readable label of the field",
                                                         },
                                                         "machine": {
                                                             "type": "string",
                                                             "description": "The machine of the field",
                                                         },
                                                         "field_type": {
                                                             "type": "string",
                                                             "description": "The field type appropriate for the intended data",
                                                             "enum": valid_field_types
                                                         },
                                                         "cardinality": {
                                                             "type": "number",
                                                             "description": "How many values of this field are allowed per content type",
                                                         },
                                                         "required": {
                                                             "type": "boolean",
                                                             "description": "Whether this field is required for an entry",
                                                         },
                                                         "relationship": {
                                                             "type": "string",
                                                             "description": "The foreign key relationship when the field type is user_profile, user_account, type_reference, or vocabulary_reference",
                                                         },
                                                         "default": {
                                                             "type": "string",
                                                             "description": "The default value for the field",
                                                         },
                                                         "example": {
                                                             "type": "string",
                                                             "description": "An example value or the fixed list of options for  list / enum fields",
                                                         }
                                                     },
                                                     "required": ["label", "field_type", "cardinality"]
                                                 }
                                             }
                                         },
                                         "required": ["name", "model_name", "fields"]
                                     }
                                 }
                             },
                             "required": ["content_types"]
                         },
                     },
                     "returns": {  # Explicitly define the function output schema
                         "type": "object",
                         "properties": {
                             "is_valid": {"type": "boolean"},
                             "errors": {
                                 "type": "array",
                                 "items": {"type": "string"}
                             },
                             "corrected_schema": {
                                 "type": "object"
                             }
                         }
                     }
                 }
             }}
        ]

        return tools

    def create_assistant(self, stream=False):
        """Create a new schema generation assistant"""
        try:

            tools = self.build_tools()

            instructions = """
                            When generating responses:
                            1. Analyze and interpret the user's idea as if building a secure, enterprise level application
                            2. Include at least 4-6 content types for any non-trivial application
                            3. Include appropriate fields for each content type based on the list of field types in the response_format
                            4. Set the relationship property with the model_name of the related content type. Only use on foreign keys: user_profile, user_account, type_reference, or vocabulary_reference
                            5. Reserve the "User" content type as the core authentication data layer but allow separate "Profile" content types if needed
                            6. It is not necessary to list created datetime, modified datetime, auto incrementing ID  
                            7. Respond with the "content_types" json_schema described by the response_format                            
                        """
            if stream is True:
                instructions = """
                                When streaming responses:
                                1. Begin by analyzing the prompt and providing a structured reasoning process.
                                   - Explain what assumptions are being made.
                                   - List potential content types before finalizing the structure.
                                2. Include at least 4-6 content types for any non-trivial application.
                                3. Use only approved field types from the response_format schema.
                                4. Set the relationship property with the model_name of the related content type where applicable.
                                5. Reserve the "User" content type as the core authentication data layer but allow separate "Profile" content types only if needed.
                                6. It is not necessary to list created datetime, modified datetime, auto incrementing ID.
                                7. Once reasoning is complete, construct the final JSON based on the "content_types" json_schema described by the response_format   
                                8. Finally return a single final chunk of the entire validated JSON.
                            """

            # Create the assistant
            assistant = self.client.beta.assistants.create(
                name="Database Schema Designer",
                description="Specialized assistant for generating comprehensive database schemas",
                model="gpt-4o",
                tools=tools,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "content_types",
                        #                        "strict": True,
                        "schema": {
                            "type": "object",
                            "description": "The generated schema to be validated.",
                            #                            "additionalProperties": False,
                            "properties": {
                                #                                "additionalProperties": False,
                                **tools[0]['function']['parameters']['properties'],
                            },
                            "required": [
                                "content_types"
                            ]
                        }
                    }
                },
                instructions=f"""
                You are a database schema designer assistant. Your job is to generate a database schema of based on any app idea.
                                
                {instructions}
                """
            )

            config, created = PromptConfig.objects.update_or_create(
                author=self.user,
                defaults={
                    'author': self.user,
                    'assistant_id': assistant.id,
                    'openai_model': assistant.model,
                    'thread_id': None,
                    'message_id': None,
                    'run_id': None,
                    'active': True
                }
            )
            return config

        except OpenAIError as e:
            print(f"Error creating assistant: {e}")
            return None

    # loads and resets thread, message, run by default
    def load_config(self, config_id, thread_id=None, message_id=None, run_id=None):
        self.config = PromptConfig.objects.get(pk=config_id)
        self.config.thread_id = thread_id
        self.config.message_id = message_id
        self.config.run_id = run_id
        return self.config

    def get_assistant_config(self):
        if self.config:
            return self.config

        self.config = PromptConfig.objects.filter(author=self.user, active=True).first()
        if self.config is None:
            self.config = self.create_assistant()
            if self.config is None:
                raise ValueError("Failed to create assistant and no assistant_id available")
        return self.config

    def get_or_create_run(self, prompt):
        """
        Recursively retrieves or creates the run object based on its status.
        Returns a completed run object or raises an error if unsuccessful.
        """
        if self.config is None:
            self.get_assistant_config()

        # Ensure a thread exists
        if self.config.thread_id is None:
            thread = self.client.beta.threads.create()
            self.config.thread_id = thread.id
            PromptConfig.objects.filter(id=self.config.id).update(thread_id=thread.id)

        message = self.client.beta.threads.messages.create(
            thread_id=self.config.thread_id,
            role="user",
            content=prompt
        )
        PromptConfig.objects.filter(id=self.config.id).update(message_id=message.id)

        # Retrieve existing run if available
        if self.config.run_id:
            run = self.client.beta.threads.runs.retrieve(
                thread_id=self.config.thread_id,
                run_id=self.config.run_id
            )
            if run.status in ["completed", "failed"]:
                return run  # Return if already finished

        # Create a new run if needed
        run = self.client.beta.threads.runs.create(
            thread_id=self.config.thread_id,
            assistant_id=self.config.assistant_id,
        )
        PromptConfig.objects.filter(id=self.config.id).update(run_id=run.id)
        self.config.run_id = run.id

        # Wait for the run to complete
        return self._wait_for_run_completion(run)

    def _wait_for_run_completion(self, run):
        """
        Waits for the run to complete and handles status updates recursively.
        """
        while run.status in ["queued", "in_progress"]:
            time.sleep(1)
            run = self.client.beta.threads.runs.retrieve(
                thread_id=self.config.thread_id,
                run_id=self.config.run_id
            )

        if run.status == "requires_action" and run.required_action.type == 'submit_tool_outputs':
            return self._handle_required_action(run)

        if run.status != "completed":
            raise ValueError(f"Run failed with status: {run.status}")

        return run

    def _handle_required_action(self, run):
        """
        Handles cases where a run requires additional action.
        """
        validator = SchemaValidator()
        tool = run.required_action.submit_tool_outputs.tool_calls[0]
        schema_to_validate = tool.function.arguments
        validation_result = validator.validate_schema(schema_to_validate)

        if validation_result['is_valid']:
            run = self.client.beta.threads.runs.submit_tool_outputs(
                thread_id=self.config.thread_id,
                run_id=self.config.run_id,
                tool_outputs=[
                    {
                        "tool_call_id": tool.id,
                        "output": json.dumps(validation_result["corrected_schema"])
                    }
                ]
            )
            return self._wait_for_run_completion(run)

        raise ValueError(f"Schema validation failed: {validation_result['errors']}")

    """
       Manages an OpenAI Assistant specialized for schema generation,
       now with a streaming capability.
       """

    def generate_schema_stream(self, prompt):
        """
        Stream the reasoning and schema generation process.
        """
        if self.config is None:
            self.get_assistant_config()

        try:
            run = self.get_or_create_run(prompt)

            if run.status != "completed":
                yield json.dumps({"error": f"Assistant run failed with status: {run.status}"}) + "\n"
                return

            messages = self.client.beta.threads.messages.list(thread_id=self.config.thread_id)

            reasoning_chunks = []
            schema_json = None

            for message in messages.data:
                if message.role == "assistant":
                    for chunk in message.content[0].text.value.split("\n"):
                        yield json.dumps({"reasoning": chunk}) + "\n"
                        reasoning_chunks.append(chunk)

                    if not schema_json:
                        schema_json = self.extract_json("\n".join(reasoning_chunks))
                        yield json.dumps({"schema": schema_json}) + "\n"

        except OpenAIError as e:
            yield json.dumps({"error": f"OpenAI Assistant Error: {str(e)}"}) + "\n"

    def generate_schema(self, prompt):
        if self.config is None:
            self.get_assistant_config()

        try:
            run = self.get_or_create_run(prompt)

            if run.status != "completed":
                err = f"Assistant run failed with status: {run.status}"
                print(err)
                return err, None

            messages = self.client.beta.threads.messages.list(
                thread_id=self.config.thread_id
            )

            # Find the JSON schema in the response
            content = None
            schema_json = None
            for message in messages.data:
                if message.role == "assistant":
                    content = message.content[0].text.value
                    if schema_json is not None:
                        break
                    schema_json = self.extract_json(content)
                    if schema_json:
                        break

            if schema_json is None:
                # clear run so this can be resubmitted for testing
                PromptConfig.objects.filter(id=self.config.id).update(run_id=None, thread_id=None)

            return content, schema_json

        except OpenAIError as e:
            print(f"OpenAI Assistant Error: {e}")
            return None

    def extract_json(self, text):
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
                json_obj = json.loads(json_str)
                if "schema" in json_obj:  # WARN: hackery. fix in response_format
                    return json_obj["schema"]
                return json_obj

            print("Invalid JSON object format.")
            return None
        except json.JSONDecodeError as e:
            print("Error decoding JSON:", e)
            return None
