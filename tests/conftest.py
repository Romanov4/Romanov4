import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest


class MockLLM:
    """Локальный OpenAI-совместимый сервер: записывает запросы и отдаёт заданные ответы."""

    def __init__(self):
        self.requests = []
        self.responses = []  # очередь (status, body); пустая — отвечаем эхо
        server = self

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                length = int(self.headers.get("Content-Length", 0))
                body = json.loads(self.rfile.read(length) or b"{}")
                server.requests.append(
                    {"path": self.path, "headers": {k.lower(): v for k, v in self.headers.items()}, "body": body}
                )
                if server.responses:
                    status, payload = server.responses.pop(0)
                else:
                    status, payload = 200, completion(f"echo: {body['messages'][-1]['content']}", body["model"])
                data = json.dumps(payload).encode()
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)

            def log_message(self, *args):
                pass

        self._httpd = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.base_url = f"http://127.0.0.1:{self._httpd.server_port}/v1"
        self._thread = threading.Thread(target=self._httpd.serve_forever, daemon=True)
        self._thread.start()

    def reply(self, status, payload):
        self.responses.append((status, payload))

    def close(self):
        self._httpd.shutdown()
        self._httpd.server_close()


def completion(content, model="auto"):
    return {
        "id": "chatcmpl-test",
        "object": "chat.completion",
        "created": 0,
        "model": model,
        "choices": [
            {"index": 0, "finish_reason": "stop", "message": {"role": "assistant", "content": content}}
        ],
    }


@pytest.fixture
def mock_llm(monkeypatch):
    server = MockLLM()
    monkeypatch.setenv("FREELLMAPI_KEY", "freellmapi-test")
    monkeypatch.setenv("FREELLMAPI_BASE_URL", server.base_url)
    monkeypatch.delenv("FREELLMAPI_MODEL", raising=False)
    monkeypatch.setenv("NO_PROXY", "127.0.0.1,localhost")
    yield server
    server.close()
