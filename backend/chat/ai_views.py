"""
AI Chat API - Streaming endpoint for Vercel AI SDK useChat
"""
import json
import os
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request


def extract_text_from_parts(parts):
    """Extract text content from message parts."""
    if not parts:
        return ""
    texts = []
    for p in parts:
        if isinstance(p, dict) and p.get("type") == "text":
            texts.append(p.get("text", ""))
    return "".join(texts)


def messages_to_openai(messages):
    """Convert UI messages to OpenAI API format."""
    result = []
    for msg in messages:
        role = msg.get("role", "user")
        parts = msg.get("parts", [])
        content = extract_text_from_parts(parts)
        if not content and role == "assistant":
            continue
        result.append({"role": role, "content": content or "(empty)"})
    return result


class AIChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request):
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            return StreamingHttpResponse(
                self._stream_error("OPENAI_API_KEY is not configured"),
                content_type="text/plain; charset=utf-8",
                status=500,
            )

        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return StreamingHttpResponse(
                self._stream_error("Invalid JSON body"),
                content_type="text/plain; charset=utf-8",
                status=400,
            )

        messages = body.get("messages", [])
        if not messages:
            return StreamingHttpResponse(
                self._stream_error("No messages provided"),
                content_type="text/plain; charset=utf-8",
                status=400,
            )

        openai_messages = messages_to_openai(messages)
        if not openai_messages:
            return StreamingHttpResponse(
                self._stream_error("No valid messages"),
                content_type="text/plain; charset=utf-8",
                status=400,
            )

        system_prompt = (
            "You are a helpful AI assistant integrated into Trutim, a team collaboration app. "
            "Be concise, friendly, and helpful. Format responses clearly when appropriate."
        )
        # Prepend system message
        full_messages = [{"role": "system", "content": system_prompt}] + openai_messages

        try:
            from openai import OpenAI

            client = OpenAI(api_key=api_key)

            def generate():
                stream = client.chat.completions.create(
                    model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
                    messages=full_messages,
                    stream=True,
                )
                for chunk in stream:
                    delta = chunk.choices[0].delta if chunk.choices else None
                    if delta and getattr(delta, "content", None):
                        yield delta.content

            response = StreamingHttpResponse(
                generate(),
                content_type="text/plain; charset=utf-8",
            )
            response["Cache-Control"] = "no-cache"
            response["X-Accel-Buffering"] = "no"
            return response

        except ImportError:
            return StreamingHttpResponse(
                self._stream_error("OpenAI package not installed. Run: pip install openai"),
                content_type="text/plain; charset=utf-8",
                status=500,
            )
        except Exception as e:
            return StreamingHttpResponse(
                self._stream_error(str(e)),
                content_type="text/plain; charset=utf-8",
                status=500,
            )

    def _stream_error(self, msg):
        def gen():
            yield msg

        return gen()
