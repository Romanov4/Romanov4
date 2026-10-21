import os

from openai import OpenAI

DEFAULT_BASE_URL = "http://localhost:3001/v1"
DEFAULT_MODEL = "auto"


def get_client() -> OpenAI:
    """Создаёт OpenAI-клиент, направленный на локальный FreeLLMAPI."""
    api_key = os.environ.get("FREELLMAPI_KEY")
    if not api_key:
        raise RuntimeError(
            "Не задан FREELLMAPI_KEY: возьмите ключ freellmapi-… на странице Keys в дашборде"
        )
    base_url = os.environ.get("FREELLMAPI_BASE_URL", DEFAULT_BASE_URL)
    return OpenAI(base_url=base_url, api_key=api_key)


def ask(prompt: str, model: str | None = None, system: str | None = None) -> str:
    """Отправляет один запрос и возвращает текст ответа.

    model: "auto" (цепочка фолбэков), "auto:fast", "auto:smart" или конкретный ID модели.
    """
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    response = get_client().chat.completions.create(
        model=model or os.environ.get("FREELLMAPI_MODEL", DEFAULT_MODEL),
        messages=messages,
    )
    return response.choices[0].message.content or ""
