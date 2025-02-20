import json
import os
import time

import openai
from django.conf import settings
from openai import OpenAIError

from .schema_validator import OasheetsSchemaValidator
from ..models import AssistantConfig


class OasheetsAssistantManager:
    """Manages an OpenAI Assistant specialized for schema generation"""

    def __init__(self, user):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.user = user
        self.config = None

    def set_assistant(self, configId):
        self.config = AssistantConfig.objects.get(pk=configId)

    def get_assistant_config(self):
        self.config = AssistantConfig.objects.filter(author=self.user, active=True).first()
        if self.config is None:
            self.config = self.create_assistant()
            if self.config is None:
                raise ValueError("Failed to create assistant and no assistant_id available")
        return self.config

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

    def create_assistant(self):
        """Create a new schema generation assistant"""
        try:

            tools = self.build_tools()
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
                instructions="""
                You are a database schema designer assistant. Your job is to generate a database schema of based on any app idea.

                When generating responses:
                1. Analyze and interpret the user's idea as if building a secure, enterprise level application
                2. Include at least 4-6 content types for any non-trivial application
                3. Include appropriate fields for each content type based on the list of field types in the response_format
                4. Set the relationship property with the model_name of the related content type. Only use on foreign keys: user_profile, user_account, type_reference, or vocabulary_reference
                5. Reserve the "User" content type as the core authentication data layer but allow separate "Profile" content types if needed
                6. It is not necessary to list created datetime, modified datetime, auto incrementing ID  
                7. Respond with the "content_types" json_schema described by the response_format
                """
            )

            config, created = AssistantConfig.objects.update_or_create(
                author=self.user,
                defaults={
                    'author': self.user,
                    'assistant_id': assistant.id,
                    'openai_model': assistant.model,
                    'thread_id': None,
                    'run_id': None,
                    'active': True
                }
            )
            return config

        except OpenAIError as e:
            print(f"Error creating assistant: {e}")
            return None

    def generate_schema(self, prompt):
        if self.config is None:
            self.get_assistant_config()

        try:

            if self.config.thread_id is None:
                thread = self.client.beta.threads.create()
                self.config.thread_id = thread.id
                AssistantConfig.objects.filter(id=self.config.id).update(thread_id=thread.id)

            message = self.client.beta.threads.messages.create(
                thread_id=self.config.thread_id,
                role="user",
                content=prompt
            )

            run = None
            """
            # this is just for debugging as it just repeats a previous request without any change
            if self.config.run_id is not None:
                run = self.client.beta.threads.runs.retrieve(
                    run_id=self.config.run_id,
                    thread_id=self.config.thread_id
                )
                if run.status == 'expired':
                    run = None
            """

            if run is None:
                run = self.client.beta.threads.runs.create(
                    thread_id=self.config.thread_id,
                    assistant_id=self.config.assistant_id,
                )
                AssistantConfig.objects.filter(id=self.config.id).update(run_id=run.id)
                self.config.run_id = run.id

            # Wait for completion
            while run.status in ["queued", "in_progress"]:
                time.sleep(1)
                run = self.client.beta.threads.runs.retrieve(
                    thread_id=self.config.thread_id,
                    run_id=self.config.run_id
                )

            schema_json = None
            if run.status == "requires_action" and run.required_action.type == 'submit_tool_outputs':
                validator = OasheetsSchemaValidator()
                tool = run.required_action.submit_tool_outputs.tool_calls[0]
                schema_to_validate = tool.function.arguments
                validation_result = validator.validate_schema(schema_to_validate)
                if validation_result['is_valid'] == True:
                    schema_json = validation_result['corrected_schema']
                    run.status = 'completed'  # WARN, is this ok?
                else:
                    run = self.client.beta.threads.runs.submit_tool_outputs(
                        thread_id=self.config.thread_id,
                        run_id=self.config.run_id,
                        tool_outputs=[
                            {
                                "tool_call_id": tool.id,
                                "output": json.dumps(validation_result)  # Pass the function result as a JSON string
                            }
                        ]
                    )

                    while run.status in ["queued", "in_progress"]:
                        time.sleep(1)
                        run = self.client.beta.threads.runs.retrieve(
                            thread_id=self.config.thread_id,
                            run_id=self.config.run_id
                        )

            if run.status != "completed":
                print(f"Assistant run failed with status: {run.status}")
                return None

            # Get the response
            messages = self.client.beta.threads.messages.list(
                thread_id=self.config.thread_id
            )

            # Find the JSON schema in the response
            content = None
            for message in messages.data:
                if message.role == "assistant":
                    content = message.content[0].text.value
                    if schema_json is not None:
                        break
                    schema_json = self._extract_json(content)
                    if schema_json:
                        break

            if schema_json is None:
                # clear run so this can be resubmitted for testing
                AssistantConfig.objects.filter(id=self.config.id).update(run_id=None, thread_id=None)

            return content, schema_json

        except OpenAIError as e:
            print(f"OpenAI Assistant Error: {e}")
            return None

    def _extract_json(self, text):
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
                if "schema" in json_obj: # WARN: hackery. fix in response_format
                    return json_obj["schema"]
                return json_obj

            print("Invalid JSON object format.")
            return None
        except json.JSONDecodeError as e:
            print("Error decoding JSON:", e)
            return None
