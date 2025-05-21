import openai
import requests
from django.conf import settings
from django.core.management.base import BaseCommand


class OpenAIClient:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.api_key = settings.OPENAI_API_KEY
        self.sessionToken = 'sess-bfnXwRuYBA3b7T25rTxHBtwExhOZ2QDydSIWnYuG' # the sdk doesn't have a threads.list method so i hack the playground API here
        self.base_url = "https://api.openai.com/v1"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.sessionToken}",
            "OpenAI-Beta": "assistants=v2",
            "Openai-Project": "proj_acIts9GSMmHlgr1vcOmCX4wQ"
        }

    def delete_all_assistants(self):
        try:
            assistants = self.client.beta.assistants.list(limit=100)
            if assistants is None or not assistants.data:
                return print(f"No assistants found in OpenAI API")

            for assistant in assistants.data:
                self.client.beta.assistants.delete(assistant_id=assistant.id)
                print(f"Deleted assistant {assistant.id}")
        except Exception as e:
            print(f"Error deleting assistants: {e}")

    def get_all_threads(self):
        try:
            response = requests.get(
                f"{self.base_url}/threads?limit=100",
                headers=self.headers
            )

            if response.status_code != 200:
                print(f"Error fetching threads: {response.status_code} - {response.text}")
                return []

            threads_data = response.json()
            return threads_data.get("data", [])
        except Exception as e:
            print(f"Error retrieving threads: {e}")
            return []

    def delete_thread_runs(self, thread_id):
        try:
            runs = self.client.beta.threads.runs.list(thread_id=thread_id, limit=100)

            if not runs.data:
                print(f"No runs found for thread {thread_id}")
                return 0

            count = 0
            for run in runs.data:
                # If the run is active, cancel it first
                if run.status in ["queued", "in_progress"]:
                    self.client.beta.threads.runs.cancel(
                        thread_id=thread_id,
                        run_id=run.id
                    )
                    print(f"Cancelled run {run.id} in thread {thread_id}")

                # Delete the run - Note: OpenAI doesn't have a direct delete run API
                # Runs get deleted when their threads are deleted
                count += 1

            return count
        except Exception as e:
            print(f"Error handling runs for thread {thread_id}: {e}")
            return 0

    def delete_thread_messages(self, thread_id):
        try:
            messages = self.client.beta.threads.messages.list(thread_id=thread_id, limit=100)

            if not messages.data:
                print(f"No messages found for thread {thread_id}")
                return 0

            count = 0
            for message in messages.data:
                try:
                    self.client.beta.threads.messages.delete(
                        thread_id=thread_id,
                        message_id=message.id
                    )
                    print(f"Deleted message {message.id} in thread {thread_id}")
                    count += 1
                except Exception as msg_err:
                    print(f"Error deleting message {message.id}: {msg_err}")

            return count
        except Exception as e:
            print(f"Error handling messages for thread {thread_id}: {e}")
            return 0

    def delete_thread(self, thread_id):
        try:
            self.client.beta.threads.delete(thread_id=thread_id)
            print(f"Deleted thread {thread_id}")
            return True
        except Exception as e:
            print(f"Error deleting thread {thread_id}: {e}")
            return False


class Command(BaseCommand):
    help = "Purges all OpenAI Assistants, Threads, Messages, and Runs without needing stored IDs."

    def handle(self, *args, **kwargs):
        client = OpenAIClient()

        # Delete all assistants
        client.delete_all_assistants()

        # Get all threads using HTTP request and process each one
        threads = client.get_all_threads()

        thread_count = 0
        run_count = 0
        message_count = 0

        for thread in threads:
            thread_id = thread["id"]
            thread_count += 1

            # Handle runs associated with the thread
            run_count += client.delete_thread_runs(thread_id)

            # Handle messages associated with the thread
            message_count += client.delete_thread_messages(thread_id)

            # Delete the thread itself
            client.delete_thread(thread_id)

        self.stdout.write(self.style.SUCCESS(
            f"Finished purging OpenAI resources: {thread_count} threads, "
            f"{run_count} runs, {message_count} messages, and all assistants."
        ))
