ку-ку

## FreeLLMAPI

Проект обращается к LLM через [FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) — локальный
OpenAI-совместимый прокси, который объединяет бесплатные лимиты разных провайдеров
и сам переключается между ними. Он для экспериментов, не для продакшена.

### 1. Поднять прокси (нужен Docker)

```bash
git clone https://github.com/tashfeenahmed/freellmapi.git ~/freellmapi
cd ~/freellmapi
printf "ENCRYPTION_KEY=%s\nPORT=3001\n" "$(openssl rand -hex 32)" > .env
docker compose up -d
```

Откройте дашборд http://localhost:3001, создайте аккаунт, на странице **Keys** добавьте
ключи провайдеров (Groq, Gemini, OpenRouter и т.д.) и скопируйте общий ключ `freellmapi-…`.

### 2. Настроить проект

```bash
pip install -r requirements.txt
cp .env.example .env   # впишите FREELLMAPI_KEY
set -a; . ./.env; set +a
```

### 3. Использовать

```bash
python -m freellm "Привет! Кто ты?"
```

```python
from freellm import ask

print(ask("Объясни рекурсию в двух предложениях", model="auto:fast"))
```

## Тесты

```bash
pip install -r requirements-dev.txt
pytest                 # офлайн-тесты клиента на локальной заглушке + интеграционные, если прокси доступен
pytest -m integration  # только проверки живого FreeLLMAPI
```

Офлайн-тесты (`tests/test_client.py`) поднимают свой мок OpenAI-совместимого API и проверяют
формат запроса, выбор модели, system-промпт и обработку ошибок (400, 429).

Интеграционные (`tests/test_integration.py`) пропускаются, пока прокси не запущен. Чтобы запустить:

```bash
ENCRYPTION_KEY=$(openssl rand -hex 32) docker compose -f docker-compose.test.yml up -d
# в дашборде http://localhost:3001 добавьте хотя бы один ключ провайдера и скопируйте freellmapi-…
export FREELLMAPI_KEY=freellmapi-…
pytest -m integration -v
```

Они проверяют список доступных моделей, ответы в режимах `auto`, `auto:fast`, `auto:smart`,
соблюдение system-промпта и отказ (400) на несуществующий профиль. Каждый прогон расходует
немного бесплатных лимитов.
