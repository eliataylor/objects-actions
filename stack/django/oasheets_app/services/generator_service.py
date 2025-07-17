import json
import threading
import time

from ..models import SchemaVersions
from ..serializers import SchemaVersionSerializer
from ..services.assistant_manager import OpenAIPromptManager, build_assistant_config


class SchemaGenerator:
    def __init__(self, prompt_data, user, last_version=None):

        self.assistant_manager = OpenAIPromptManager()

        self.assistant = None
        if last_version is not None:  # if a specific version was passed in to inherit
            self.assistant = self.assistant_manager.retrieve_assistant(last_version.assistant_id)
        else:  # else just use the latest version's assistant since they're all the same
            assistant_id = SchemaVersions.objects.order_by("-id").values_list("assistant_id", flat=True).first()
            if assistant_id:
                self.assistant = self.assistant_manager.retrieve_assistant(assistant_id)

        if self.assistant is None:
            self.assistant = self.assistant_manager.create_assistant()
        else:
            config_in_code = build_assistant_config()
            server_says = self.assistant.model_dump()
            if config_in_code['instructions'] != server_says['instructions'] or json.dumps(server_says['tools'][0]['function']['parameters']['properties']['schema']) != json.dumps(config_in_code['tools'][0]['function']['parameters']['properties']['schema']):
                self.assistant = self.assistant_manager.create_assistant()

        self.version = SchemaVersions.objects.create(
            author=user if user.is_authenticated else None,
            prompt=prompt_data["prompt"],
            privacy=prompt_data["privacy"],
            assistant_id=self.assistant.id,
            thread_id=last_version.thread_id if last_version else None,
            parent_id=last_version.id if last_version else None,
            run_id=None,
            message_id=None,
            openai_model=prompt_data["openai_model"],
        )

        self.assistant_manager.set_assistant_id(self.assistant.id)
        self.assistant_manager.set_thread_id(self.version.thread_id)
        if last_version:
            if last_version.message_id:
                self.assistant_manager.set_message_id(last_version.message_id)
            if last_version.run_id:
                self.assistant_manager.set_run_id(last_version.run_id)

    # http request (non-streaming) to openai, deprecated
    def request_schema(self, prompt):
        try:
            reasoning, schema = self.assistant_manager.request(prompt)
            runtime = self.assistant_manager.get_openai_ids()
            self.version.prompt = prompt
            self.version.reasoning = reasoning
            self.version.schema = schema
            self.version.thread_id = runtime['thread_id']
            self.version.message_id = runtime['message_id']
            self.version.run_id = runtime['run_id']
            self.version.save()

            return SchemaVersionSerializer(self.version).data

        except Exception as e:
            print(f"Error in schema generation: {e}")
            return None

    # streaming response to openai
    def start_stream(self, prompt):
        try:
            response_stream = self.assistant_manager.stream(prompt)
            self.version.prompt = prompt

            yield from self.handle_stream(response_stream)

        except Exception as e:
            if self.doSave:
                self.version.save()
            yield json.dumps({"error": f"Stream failed: {str(e)}"}) + "||JSON_END||"

    def handle_stream(self, response_stream):

        self.doSave = False
        last_keepalive = time.time()  # Track last keep-alive time

        for response in response_stream:
            if time.time() - last_keepalive >= 10:
                yield json.dumps({"type": "keep_alive"}) + "||JSON_END||"
                last_keepalive = time.time()

            if "run_id" in response:
                self.version.run_id = response['run_id']
                self.doSave = True
            if "thread_id" in response:
                self.version.thread_id = response['thread_id']
                self.doSave = True
            if "schema" in response:
                self.version.schema = response['schema']
                self.doSave = True

            if response["type"] == "reasoning":
                self.version.reasoning = response['content']
                self.doSave = True
                yield json.dumps(response) + "||JSON_END||"
            else:
                yield json.dumps(response) + "||JSON_END||"

        # fallback if we never get the schema or even a response
        if self.version.schema is None:
            print('No schema returned. Prompting in new http request.')

            def fallback_request():
                nonlocal last_keepalive
                try:
                    reasoning, schema = self.assistant_manager.request(
                        "Please generate the validated schema based on your recommendations"
                    )
                    if self.version.reasoning is None and reasoning is not None:
                        self.version.reasoning = reasoning
                        self.doSave = True
                    if schema is not None:
                        self.version.schema = schema
                        yield json.dumps({"type": "requested_schema", "schema": schema}) + "||JSON_END||"
                        self.doSave = True
                except Exception as e:
                    yield json.dumps({"error": f"Fallback request failed: {str(e)}"}) + "||JSON_END||"

            # Start fallback request in a separate thread
            fallback_thread = threading.Thread(target=fallback_request)
            fallback_thread.start()

            # Keep connection alive while fallback request is being processed
            while fallback_thread.is_alive():
                yield json.dumps({"type": "keep_alive"}) + "||JSON_END||"
                time.sleep(5)  # Adjust as needed

        if self.version.schema is not None:
            # cleanup potential json inside reasoning body:
            schema_json = self.assistant_manager.extract_json(self.version.reasoning)
            if schema_json:
                self.version.reasoning = self.version.reasoning.replace(schema_json[1], "")
                self.doSave = True

        if self.doSave:
            self.doSave = False
            self.version.save()

        yield json.dumps({"type": "done", "version_id": self.version.id}) + "||JSON_END||"
