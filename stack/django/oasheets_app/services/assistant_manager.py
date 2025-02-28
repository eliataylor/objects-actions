import json
import os
import time

import openai
from django.conf import settings
from openai import OpenAIError

from .schema_validator import SchemaValidator
from ..models import PromptConfig
from pydantic import BaseModel

# Define the Pydantic model for schema validation
class ValidateSchema(BaseModel):
    schema: dict

def extract_message_text(event):
    """
    Safely extracts text from a MessageDeltaEvent.
    Handles multiple possible content structures.
    """
    try:
        if hasattr(event, "data") and hasattr(event.data, "delta") and hasattr(event.data.delta, "content"):
            for content_block in event.data.delta.content:
                if hasattr(content_block, "text") and hasattr(content_block.text, "value"):
                    return content_block.text.value  # Extract text safely
        return None  # No valid text found
    except Exception as e:
        print(f"Error extracting text: {e}")
        return None


def build_tools():
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
                                                         "description": "How many values of this field are allowed per content type. Set -1 for infinity.",
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


class OpenAIPromptManager:
    """Manages an OpenAI Assistant specialized for schema generation"""

    def __init__(self, user, variant):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.user = user
        self.variant = 'request' if variant != 'stream' else 'stream'
        self.config = None

    def create_assistant(self):
        """Create a new schema generation assistant"""
        try:

            tools = build_tools()

            instructions = """You are a relational database schema expert and educator. Your job is to generate a database schema of based on any app idea.
            
                            When generating responses:
                            1. Analyze and interpret the prompt as if building a secure, enterprise level application.
                            2. Include at least 4-12 content types for any non-trivial application.
                            3. Include appropriate fields for each content type based on the list of field types in the response_format.
                            4. Set the relationship property with the model_name of the related content type. Only use on foreign keys: user_profile, user_account, type_reference, or vocabulary_reference.
                            5. Reserve the "User" content type as the core authentication data layer but allow separate "Profile" content types if needed.
                            6. It is not necessary to list created / modified date times or auto incrementing ID.
                            7. Respond with the validated "content_types" json_schema described by the response_format."""
            if self.variant == 'stream':
                instructions = """You are a relational database schema expert and educator. Your job is to generate a database schema of based on any app idea and provide reasoning for your choices.
                                
                                When responding to a prompt, you will:
                                1. Analyzing the prompt as if building a secure, enterprise level online application.
                                   - List sufficient potential content types for any non-trivial application
                                   - Describe the logic behind relationships among your fields.
                                2. Once you have provided sufficient reasoning via messages, use the `validate_schema` function to generate the final structured schema.
                                   - Do NOT attempt to generate JSON in the message responses.
                                   - Only use the function call response for structured JSON.
                                   - Ensure the JSON output is complete before returning."""

            # Create the assistant
            assistant = self.client.beta.assistants.create(
                name=f"Data Schema Designer {self.variant}",
                description="Agent for generating data schemas for app ideas",
                model="gpt-4o-mini",
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
                instructions=instructions.strip()
            )

            # WARN: huge potential conflicts with anonymous users sharing configs
            config, created = PromptConfig.objects.create(
                defaults={
                    'author': self.user if self.user.is_authenticated else None,  # Ensure valid Users instance or None
                    'assistant_id': assistant.id,
                    'openai_model': assistant.model,
                    'variant': self.variant,
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

    def set_config(self, config):
        self.config = config

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

        if self.user.is_authenticated:
            self.config = PromptConfig.objects.filter(author=self.user, active=True, variant=self.variant).first()
        else:
            # WARN: huge potential conflicts with anonymous users sharing configs
            self.config = PromptConfig.objects.filter(author__isnull=True, active=True, variant=self.variant).first()

        if self.config is None:
            self.config = self.create_assistant()
            if self.config is None:
                raise ValueError("Failed to create assistant and no assistant_id available")
        else:
            # always reset these here. if reusing any of these, it'll happen in load_config
            self.config.thread_id = None
            self.config.message_id = None
            self.config.run_id = None
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
        self.config.message_id = message.id
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

    def get_schema_stream(self, prompt):
        if self.config is None:
            self.get_assistant_config()

        # Ensure a thread exists
        if self.config.thread_id is None:
            thread = self.client.beta.threads.create()
            self.config.thread_id = thread.id
            PromptConfig.objects.filter(id=self.config.id).update(thread_id=thread.id)

        # Step 1: Send the initial user message
        message = self.client.beta.threads.messages.create(
            thread_id=self.config.thread_id,
            role="user",
            content=prompt
        )
        self.config.message_id = message.id
        PromptConfig.objects.filter(id=self.config.id).update(message_id=message.id)

        try:

            # Step 3: Stream the Assistant’s Response
            with self.client.beta.threads.runs.stream(
                    thread_id=self.config.thread_id,
                    assistant_id=self.config.assistant_id,
                    instructions="Once reasoning is complete, call `validate_schema`.",
                    tools=[
                        openai.pydantic_function_tool(ValidateSchema, name="validate_schema"),
                    ],
                    parallel_tool_calls=True
            ) as stream:
                for event in stream:
                    if hasattr(event, 'event'):
                        # 📝 Step 1: Stream English Reasoning
                        if event.event == "thread.message.delta":
                            message_text = extract_message_text(event)
                            if message_text:
                                yield {"type": "message", "content": message_text}

                        # 🛠 Step 2: Stream JSON Chunks
                        elif event.event == "tool_calls.function.arguments.delta":
                            function_args = getattr(event.data, "arguments", {})
                            yield {"type": "partial_function_call", "arguments": function_args}

                        # ✅ Step 3: Return the Fully Validated JSON Schema
                        elif event.event == "tool_calls.function.arguments.done":
                            final_args = getattr(event.data, "arguments", {})
                            yield {"type": "final_function_call", "arguments": final_args, "done": True}

        except OpenAIError as e:
            yield {"error": f"OpenAI Assistant Error: {str(e)}"}

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
