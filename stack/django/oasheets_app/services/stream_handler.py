from typing_extensions import override
from openai import AssistantEventHandler
from openai.types.beta.threads import Text, TextDelta, Run
from openai.types.beta.threads.runs import ToolCall, ToolCallDelta, RunStep
from openai.types.beta.threads.message import Message
from openai.types.beta.threads.message_delta import MessageDelta
from typing import Dict, Any, Optional, List, Callable


class StreamHandler(AssistantEventHandler):
    """
    Event handler for OpenAI Assistant Stream events that inherits from AssistantEventHandler.
    Processes stream events and calls back with important events rather than storing state.
    """

    def __init__(self, event_callback: Callable[[Dict[str, Any]], None]):
        super().__init__()
        """Initialize the StreamHandler with a callback function."""
        self.event_callback = event_callback

    # Run event handlers
    @override
    def on_run_created(self, run: Run) -> None:
        """Called when a run is created."""
        print(f"Run created with ID: {run.id}")

    @override
    def on_run_queued(self, run: Run) -> None:
        """Called when a run is queued."""
        print(f"Run queued with ID: {run.id}")

    @override
    def on_run_in_progress(self, run: Run) -> None:
        """Called when a run is in progress."""
        print(f"Run in progress with ID: {run.id}")

    @override
    def on_run_completed(self, run: Run) -> None:
        """Called when a run is completed."""
        print(f"Run completed with ID: {run.id}")
        # Pass completion event to callback
        self.event_callback({"type": "run_completed", "run_id": run.id})
        return {"type": "run_completed", "run_id": run.id}

    @override
    def on_run_failed(self, run: Run) -> None:
        """Called when a run fails."""
        print(f"Run failed with ID: {run.id}, error: {run.last_error}")
        # Pass error event to callback
        self.event_callback({"type": "run_failed", "error": run.last_error})
        return {"type": "run_failed", "error": run.last_error}

    @override
    def on_run_cancelled(self, run: Run) -> None:
        """Called when a run is cancelled."""
        print(f"Run cancelled with ID: {run.id}")
        # Pass cancellation event to callback
        self.event_callback({"type": "run_cancelled", "run_id": run.id})
        return {"type": "run_cancelled", "run_id": run.id}

    @override
    def on_run_expired(self, run: Run) -> None:
        """Called when a run expires."""
        print(f"Run expired with ID: {run.id}")
        # Pass expiration event to callback
        self.event_callback({"type": "run_expired", "run_id": run.id})
        return {"type": "run_expired", "run_id": run.id}

    @override
    def on_run_requires_action(self, run: Run) -> None:
        """Called when a run requires action."""
        if not run.required_action:
            print(f"Run requires action but no action found, run ID: {run.id}")
            return

        tool_calls = run.required_action.submit_tool_outputs.tool_calls
        print(f"Run requires action, tool calls: {len(tool_calls)}")

        results = []
        for tool_call in tool_calls:
            tool_call_id = tool_call.id
            function_name = tool_call.function.name
            function_args = tool_call.function.arguments

            event = {
                "type": "tool_call",
                "tool_call_id": tool_call_id,
                "function": function_name,
                "arguments": function_args
            }

            # Pass tool call to callback
            self.event_callback(event)
            results.append(event)

        return results

    # Message event handlers
    @override
    def on_message_created(self, message: Message) -> None:
        """Called when a message is created."""
        print(f"Message created with ID: {message.id}")
        self.event_callback({"type": "message_created", "message_id": message.id})

    @override
    def on_message_completed(self, message: Message) -> None:
        """Called when a message is completed."""
        print(f"Message completed with ID: {message.id}")
        self.event_callback({"type": "message_completed", "message_id": message.id})
        return {"type": "message_completed", "message_id": message.id}

    @override
    def on_message_delta(self, delta: MessageDelta, snapshot: Message) -> Optional[Dict[str, Any]]:
        """Called when a message delta is received."""
        # Process content delta if available
        if delta.content:
            for content in delta.content:
                if hasattr(content, "text") and content.text:
                    event = {
                        "type": "message_delta",
                        "message_id": snapshot.id,
                        "content": content.text.value
                    }
                    self.event_callback(event)
                    return event
        return None

    # Text event handlers
    @override
    def on_text_created(self, text: Text) -> None:
        """Called when text is created."""
        print(f"Text created: {text.value[:20]}..." if len(text.value) > 20 else text.value)

    @override
    def on_text_delta(self, delta: TextDelta, snapshot: Text) -> None:
        """Called when a text delta is received."""
        print(delta.value, end="", flush=True)
        event = {"type": "message", "content": delta.value}
        self.event_callback(event)
        return event

    # Tool call event handlers
    @override
    def on_tool_call_created(self, tool_call: ToolCall) -> None:
        """Called when a tool call is created."""
        print(f"Tool call created: {tool_call.id}, type: {tool_call.type}", flush=True)

        # Process tool call
        if tool_call.type == "function":
            function_name = tool_call.function.name
            function_args = tool_call.function.arguments

            self.event_callback({
                "type": "tool_call_created",
                "tool_call_id": tool_call.id,
                "function": function_name,
                "arguments": function_args
            })

    @override
    def on_tool_call_delta(self, delta: ToolCallDelta, snapshot: ToolCall) -> None:
        """Called when a tool call delta is received."""
        if delta.type == "function" and delta.function:
            if delta.function.arguments:
                print(f"Function argument delta for {snapshot.id}: {delta.function.arguments}")
                self.event_callback({
                    "type": "tool_call_delta",
                    "tool_call_id": snapshot.id,
                    "argument_delta": delta.function.arguments
                })
            if delta.function.name:
                print(f"Function name delta for {snapshot.id}: {delta.function.name}")
                self.event_callback({
                    "type": "tool_call_delta",
                    "tool_call_id": snapshot.id,
                    "name_delta": delta.function.name
                })

    @override
    def on_tool_call_completed(self, tool_call: ToolCall) -> None:
        """Called when a tool call is completed."""
        print(f"Tool call completed: {tool_call.id}")
        self.event_callback({
            "type": "tool_call_completed",
            "tool_call_id": tool_call.id
        })

    # Run step event handlers
    @override
    def on_run_step_created(self, run_step: RunStep) -> None:
        """Called when a run step is created."""
        print(f"Run step created: {run_step.id}, type: {run_step.type}")

    @override
    def on_run_step_completed(self, run_step: RunStep) -> None:
        """Called when a run step is completed."""
        print(f"Run step completed: {run_step.id}")

    @override
    def on_run_step_failed(self, run_step: RunStep) -> None:
        """Called when a run step fails."""
        print(f"Run step failed: {run_step.id}")
        if run_step.last_error:
            print(f"Error: {run_step.last_error.code} - {run_step.last_error.message}")

    @override
    def on_run_step_cancelled(self, run_step: RunStep) -> None:
        """Called when a run step is cancelled."""
        print(f"Run step cancelled: {run_step.id}")

    @override
    def on_run_step_expired(self, run_step: RunStep) -> None:
        """Called when a run step expires."""
        print(f"Run step expired: {run_step.id}")

    # Tool output handler
    @override
    def on_tool_output_created(self, tool_output: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Called when a tool output is created."""
        output_id = tool_output.get("id")
        tool_call_id = tool_output.get("tool_call_id")
        output = tool_output.get("output")

        print(f"Tool output created: {output_id} for tool call: {tool_call_id}")
        print(f"Output: {output}")

        # Pass tool output to callback
        event = {
            "type": "tool_output",
            "tool_call_id": tool_call_id,
            "output": output
        }
        self.event_callback(event)
        return event
