import openai
import pytest

from freellm import ask, get_client
from tests.conftest import completion


def test_ask_returns_answer_text(mock_llm):
    assert ask("Привет") == "echo: Привет"


def test_request_shape(mock_llm):
    ask("Привет")

    [req] = mock_llm.requests
    assert req["path"] == "/v1/chat/completions"
    assert req["headers"]["authorization"] == "Bearer freellmapi-test"
    assert req["body"]["model"] == "auto"
    assert req["body"]["messages"] == [{"role": "user", "content": "Привет"}]


def test_system_prompt_goes_first(mock_llm):
    ask("вопрос", system="Отвечай кратко")

    messages = mock_llm.requests[0]["body"]["messages"]
    assert messages == [
        {"role": "system", "content": "Отвечай кратко"},
        {"role": "user", "content": "вопрос"},
    ]


def test_model_from_env(mock_llm, monkeypatch):
    monkeypatch.setenv("FREELLMAPI_MODEL", "auto:smart")
    ask("x")
    assert mock_llm.requests[0]["body"]["model"] == "auto:smart"


def test_model_argument_overrides_env(mock_llm, monkeypatch):
    monkeypatch.setenv("FREELLMAPI_MODEL", "auto:smart")
    ask("x", model="gemini-2.5-flash")
    assert mock_llm.requests[0]["body"]["model"] == "gemini-2.5-flash"


def test_empty_content_becomes_empty_string(mock_llm):
    mock_llm.reply(200, completion(None))
    assert ask("x") == ""


def test_missing_key_raises(monkeypatch):
    monkeypatch.delenv("FREELLMAPI_KEY", raising=False)
    with pytest.raises(RuntimeError, match="FREELLMAPI_KEY"):
        get_client()


def test_unknown_profile_error_propagates(mock_llm):
    mock_llm.reply(400, {"error": {"message": "unknown profile", "type": "invalid_request_error"}})
    with pytest.raises(openai.BadRequestError):
        ask("x", model="auto:nope")


def test_rate_limit_is_retried_by_sdk(mock_llm):
    # Когда у всех провайдеров кончился лимит, прокси отдаёт 429 — SDK повторяет запрос сам.
    mock_llm.reply(429, {"error": {"message": "rate limited"}})
    assert ask("x") == "echo: x"
    assert len(mock_llm.requests) == 2
