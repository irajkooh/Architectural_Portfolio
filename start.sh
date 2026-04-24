#!/bin/bash
set -e

ollama serve &

echo "Waiting for Ollama..."
until curl -s http://localhost:11434/ > /dev/null 2>&1; do
    sleep 1
done

MODEL="${CHAT_MODEL:-llama3.2:3b}"
if ! ollama list 2>/dev/null | grep -q "^${MODEL}"; then
    echo "Pulling ${MODEL}..."
    ollama pull "${MODEL}"
fi

exec uvicorn backend.main:app --host 0.0.0.0 --port 7860
