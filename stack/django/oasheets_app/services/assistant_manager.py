import asyncio
import json
import os
from typing import List

import openai
from django.conf import settings
from openai import OpenAIError
from pydantic import BaseModel

from .schema_validator import SchemaValidator


class FieldSchema(BaseModel):
    label: str
    field_type: str
    cardinality: int
    required: bool
    relationship: str = None
    default: str = None
    example: str = None


class ContentTypeSchema(BaseModel):
    name: str
    model_name: str
    fields: List[FieldSchema]


class ValidateSchema(BaseModel):
    content_types: List[ContentTypeSchema]


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
                                         "name": {
                                             "type": "string",
                                             "description": "The human readable label of table"
                                         },
                                         "model_name": {
                                             "type": "string",
                                             "description": "The machine name of the table"
                                         },
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

    def __init__(self):
        self.version = None
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY, max_retries=5, timeout=300)
        self.ids = {"thread_id": None, "message_id": None, "run_id": None, "assistant_id": None}

    # required
    def set_assistant_id(self, vid):
        self.ids['assistant_id'] = vid

    def set_thread_id(self, vid):
        self.ids['thread_id'] = vid

    def set_message_id(self, vid):
        self.ids['message_id'] = vid

    def set_run_id(self, vid):
        self.ids['run_id'] = vid

    def retrieve_assistant(self, assistant_id):
        try:
            assistant = self.client.beta.assistants.retrieve(assistant_id)
            return assistant
        except Exception as e:
            print(f"assistant_id is missing {assistant_id}")
            return None

    """Only called when there is no other version with an active assistant ID"""

    def create_assistant(self):
        try:

            tools = build_tools()
            assistantProps = {"name": f"Data Schema Designer",
                              "description": "Agent for generating data schemas for app ideas", "model": "gpt-4o-mini",
                              "tools": tools,
                              "instructions": """You are a relational database schema expert and educator. Your job is to generate a database schema of based on any app idea and provide reasoning for your choices.

When responding to a prompt, you will:
1. Analyzing the prompt as if building a secure, enterprise level online application.
   - List sufficient potential content types for any non-trivial application
   - Describe the logic behind relationships among your fields.
2. Once you have provided sufficient reasoning via messages, use the `validate_schema` function to generate the final structured schema.
   - Choose the appropriate `field_type` from the enum of fields listed in the `field_type` property of the `validate_schema` function.
   - Set the `relationship` property with the model_name of the related content type.
   - Set the `cardinality` property number of entries a field can have for each item and use -1 for infinity.
   - When an `enum` field is needed, set the list of options in the `example` property.
   - The main authentication Users model should always be have a reserved machine name of "Users".
   - The field describing ownership of a content item should be named "author" and have a relationship property value of "Users"  
   - All models automatically have "author", "created_at", and "modified_at" properties so it is not necessary to list them unless part of your reasoning.
   - Do NOT waste tokens including the full JSON in your reasoning, but use the tool function `validate_schema` to return the structured JSON as your last step."""}

            # Create the assistant
            assistant = self.client.beta.assistants.create(**assistantProps)
            return assistant

        except OpenAIError as e:
            print(f"Error creating assistant: {e}")
            return None

    def get_openai_ids(self):
        return self.ids

    def stream(self, prompt):
        if self.ids['assistant_id'] is None:
            self.create_assistant()

        # Ensure a thread exists
        thread = None
        if self.ids["thread_id"] is not None:
            try:
                thread = self.client.beta.threads.retrieve(self.ids["thread_id"])
            except Exception as e:
                print(f"thread_id is missing {self.ids["thread_id"]}")

        if thread is None:
            thread = self.client.beta.threads.create()
            self.ids["thread_id"] = thread.id

        # Step 1: Send the initial user message
        message = self.client.beta.threads.messages.create(
            thread_id=self.ids["thread_id"],
            role="user",
            content=prompt
        )
        self.ids["message_id"] = message.id

        allEventTypes = {}  # debugging

        try:
            with self.client.beta.threads.runs.stream(
                    thread_id=self.ids["thread_id"],
                    assistant_id=self.ids['assistant_id'],
                    tools=[
                        openai.pydantic_function_tool(ValidateSchema, name="validate_schema"),
                    ],
                    parallel_tool_calls=True
            ) as stream:
                for event in stream:
                    if hasattr(event, 'event'):
                        allEventTypes[event.event] = 1
                        if event.event == "thread.message.delta":
                            message_text = self.extract_message_text(event)
                            yield {"type": "message", "event": event.event, "content": message_text}

                        elif event.event == "thread.message.completed":
                            message_text = event.data.content[0].text.value
                            schema_json = self.extract_json(message_text)
                            if schema_json:
                                message_text = self.remove_json(
                                    message_text)  # strip it from response now that we have it parsed out
                                validator = SchemaValidator()
                                validation_result = validator.validate_schema(schema_json)
                                yield {
                                    "type": "corrected_schema",
                                    "event": "validate_schema",
                                    "errors": validation_result["errors"],
                                    "schema": validation_result['corrected_schema']
                                }
                            self.ids["run_id"] = event.data.run_id
                            if self.ids["thread_id"] != event.data.thread_id and event.data.thread_id:
                                print(f"Thread ID changed to {event.data.thread_id}")
                                self.ids["thread_id"] = event.data.thread_id

                            yield {"type": "reasoning", "event": event.event, "content": message_text,
                                   "run_id": event.data.run_id, "thread_id": event.data.thread_id}

                        elif event.event == "error":
                            message_text = self.extract_message_text(event)
                            yield {"type": "error", "event": event.event, "content": message_text}

                        elif event.event == "thread.run.requires_action":
                            if hasattr(event.data,
                                       "required_action") and event.data.required_action.type == "submit_tool_outputs":
                                tool_calls = event.data.required_action.submit_tool_outputs.tool_calls

                                # Process each tool call (in this case, validate_schema)
                                for tool_call in tool_calls:
                                    if tool_call.function.name == "validate_schema":
                                        # Extract the schema to validate
                                        try:
                                            # optional do another internal validation and correct it
                                            schema_to_validate = json.loads(tool_call.function.arguments)
                                            validator = SchemaValidator()
                                            validation_result = validator.validate_schema(schema_to_validate)

                                            # Yield the validation result
                                            yield {
                                                "type": "corrected_schema",
                                                "event": "validate_schema",
                                                "errors": validation_result["errors"],
                                                "schema": validation_result['corrected_schema']
                                            }

                                            # why bother at this point?
                                            self.client.beta.threads.runs.submit_tool_outputs(
                                                thread_id=self.ids["thread_id"],
                                                run_id=event.data.id,
                                                tool_outputs=[
                                                    {
                                                        "tool_call_id": tool_call.id,
                                                        "output": json.dumps(validation_result['corrected_schema'])
                                                    }
                                                ]
                                            )

                                        except Exception as e:
                                            yield {
                                                "type": "error",
                                                "event": "validate_schema_error",
                                                "content": f"Error validating schema: {str(e)}"
                                            }

                        elif event.event == "tool_calls.function.arguments.delta":
                            function_args = getattr(event.data, "arguments", {})
                            yield {"type": "partial_function_call", "event": event.event, "content": function_args}

                        elif event.event == "tool_calls.function.arguments.done":
                            final_args = getattr(event.data, "arguments", {})
                            yield {"type": "final_function_call", "event": event.event, "content": final_args}

                print(allEventTypes)

        except OpenAIError as e:
            yield {"error": f"OpenAI Assistant Error: {str(e)}", "type": "error"}

    # used as fallback when schema is not found in stream
    def request(self, prompt):
        if self.ids is None:
            self.get_assistant_config()

        try:
            run = self.get_or_create_run(prompt)

            if run.status != "completed":
                err = f"Assistant run failed with status: {run.status}"
                print(err)
                return err, None

            messages = self.client.beta.threads.messages.list(
                thread_id=self.ids["thread_id"]
            )

            # Find the JSON schema in the response
            content = None
            schema_json = None
            for message in messages.data:
                if message.role == "assistant":
                    content = message.content[0].text.value
                    schema_json = self.extract_json(content)
                    if schema_json is not None:
                        content = self.remove_json(content)  # only save reasoning text here
                        break

            return content, schema_json

        except OpenAIError as e:
            print(f"OpenAI Assistant Error: {e}")
            return str(e), None

    def get_or_create_run(self, prompt):

        # Ensure a thread exists
        if self.ids["thread_id"] is None:
            thread = self.client.beta.threads.create()
            self.ids["thread_id"] = thread.id

        message = self.client.beta.threads.messages.create(
            thread_id=self.ids["thread_id"],
            role="user",
            content=prompt
        )
        if message is None:
            raise ValueError("Failed to create message")

        self.ids["message_id"] = message.id

        run = self.client.beta.threads.runs.create(
            thread_id=self.ids["thread_id"],
            assistant_id=self.ids['assistant_id'],
        )
        self.ids["run_id"] = run.id

        # Wait for the run to complete
        return self._wait_for_run_completion(run)

    async def _wait_for_run_completion(self, run):
        """
        Waits for the run to complete and handles status updates recursively.
        """
        while run.status in ["queued", "in_progress"]:
            await asyncio.sleep(0.2)
            run = self.client.beta.threads.runs.retrieve(
                thread_id=self.ids["thread_id"],
                run_id=self.ids["run_id"]
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

        if validation_result['corrected_schema'] and len(validation_result['corrected_schema']) > 0:
            run = self.client.beta.threads.runs.submit_tool_outputs(
                thread_id=self.ids["thread_id"],
                run_id=self.ids["run_id"],
                tool_outputs=[
                    {
                        "tool_call_id": tool.id,
                        "output": json.dumps(validation_result["corrected_schema"])
                    }
                ]
            )
            return self._wait_for_run_completion(run)

        raise ValueError(f"Schema validation failed: {validation_result['errors']}")

    def extract_message_text(self, event):
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

    def extract_json(self, text):
        """Extract JSON object from a text response, handling multiple formats."""
        try:
            # Find JSON starting points: ```json, {, or [
            json_start_markers = [
                text.find("{"),
                text.find("[")
            ]

            # Get the first valid occurrence
            start = min(filter(lambda x: x != -1, json_start_markers), default=-1)
            if start == -1:
                print("No JSON object found in the string.")
                return None

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

    def remove_json(self, text):
        """remove JSON object from a text response."""
        # Find JSON starting points: ```{, or [
        json_start_markers = [
            text.find("{"),
            text.find("[")
        ]

        # Get the first valid occurrence
        start = min(filter(lambda x: x != -1, json_start_markers), default=-1)
        if start == -1:
            print("No JSON object found in the string.")
            return None

        # Determine correct closing character
        end_char = ']' if text[start] == '[' else '}'
        end = text.rfind(end_char)

        # Validate the end position
        if end != -1:
            end += 1  # Include closing bracket/brace
            json_str = text[start:end].strip()
            text = text.replace(json_str, "")

        return text
