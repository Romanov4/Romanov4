"""Клиент для FreeLLMAPI — OpenAI-совместимого прокси над бесплатными LLM-провайдерами."""

from .client import ask, get_client

__all__ = ["ask", "get_client"]
