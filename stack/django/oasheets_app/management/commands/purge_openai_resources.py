import openai
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from oasheets_app.models import SchemaVersions


class Command(BaseCommand):
    help = "Purges all OpenAI Assistants, Threads, Messages, and Runs for SchemaVersions instances."

    def handle(self, *args, **kwargs):
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        openai.api_key = settings.OPENAI_API_KEY

        threads = SchemaVersions.objects.exclude(thread_id__isnull=True).values_list("thread_id", flat=True).distinct()

        with transaction.atomic():
            for thread_id in threads:
                try:

                    runs = SchemaVersions.objects.filter(thread_id=thread_id).exclude(run_id__isnull=True).values_list("run_id",
                                                                                           flat=True).distinct()
                    for run_id in runs:
                        try:
                            client.beta.threads.runs.cancel(run_id=run_id, thread_id=thread_id)
                            self.stdout.write(self.style.SUCCESS(f"Cancelled run {run_id}"))
                        except Exception as e:
                            self.stderr.write(self.style.ERROR(f"Error cancelling run {run_id}: {e}"))

                    messages = SchemaVersions.objects.filter(thread_id=thread_id).exclude(message_id__isnull=True).values_list("message_id",
                                                                                                   flat=True).distinct()
                    for message_id in messages:
                        try:
                            client.beta.threads.messages.delete(message_id=message_id, thread_id=thread_id)
                            self.stdout.write(self.style.SUCCESS(f"Deleted message {message_id}"))
                        except Exception as e:
                            self.stderr.write(self.style.ERROR(f"Error deleting message {message_id}: {e}"))

                    client.beta.threads.delete(thread_id=thread_id)
                    self.stdout.write(self.style.SUCCESS(f"Deleted thread {thread_id}"))
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Error deleting thread {thread_id}: {e}"))


            assistants = SchemaVersions.objects.exclude(assistant_id__isnull=True).values_list("assistant_id",
                                                                                               flat=True).distinct()
            for assistant_id in assistants:
                try:
                    client.beta.assistants.delete(assistant_id=assistant_id)
                    self.stdout.write(self.style.SUCCESS(f"Deleted assistant {assistant_id}"))
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Error deleting assistant {assistant_id}: {e}"))



        self.stdout.write(self.style.SUCCESS("Finished purging OpenAI resources."))
