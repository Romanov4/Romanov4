"""Проверки живого FreeLLMAPI. Запуск: pytest -m integration

Нужно: поднятый прокси, хотя бы один ключ провайдера в дашборде и FREELLMAPI_KEY в окружении.
"""

import os
import urllib.request

import openai
import pytest

from freellm import ask, get_client

pytestmark = pytest.mark.integration

BASE_URL = os.environ.get("FREELLMAPI_BASE_URL", "http://localhost:3001/v1")


def _proxy_reachable() -> bool:
    try:
        urllib.request.urlopen(BASE_URL.removesuffix("/v1") + "/", timeout=3)
        return True
    except urllib.error.HTTPError:
        return True  # сервер ответил, пусть и не 200
    except OSError:
        return False


if not os.environ.get("FREELLMAPI_KEY") or not _proxy_reachable():
    pytest.skip(f"FreeLLMAPI недоступен на {BASE_URL} или не задан FREELLMAPI_KEY", allow_module_level=True)


def test_available_models_listed():
    # Без фильтра /v1/models отдаёт весь каталог, включая модели без подключённых ключей.
    models = [m.id for m in get_client().models.list(extra_query={"available": "true"})]
    assert models, "прокси не вернул ни одной модели — добавьте ключи провайдеров в дашборде"


@pytest.mark.parametrize("model", ["auto", "auto:fast", "auto:smart"])
def test_routing_modes_answer(model):
    answer = ask("Ответь одним словом: столица Франции?", model=model)
    assert "париж" in answer.lower() or "paris" in answer.lower()


def test_system_prompt_is_respected():
    answer = ask("Как дела?", system="Отвечай только словом ку-ку, без других слов.")
    assert "ку-ку" in answer.lower()


def test_unknown_profile_rejected():
    with pytest.raises(openai.BadRequestError):
        ask("x", model="auto:no-such-profile")
