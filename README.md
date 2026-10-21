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
