#!/bin/bash
set -e

echo "[start.sh] Starting Ollama server..."
ollama serve &
OLLAMA_PID=$!

echo "[start.sh] Waiting for Ollama to accept connections..."
for i in {1..60}; do
    if curl -s http://localhost:11434/ > /dev/null 2>&1; then
        echo "[start.sh] Ollama is up (took ${i}s)"
        break
    fi
    if ! kill -0 $OLLAMA_PID 2>/dev/null; then
        echo "[start.sh] ERROR: ollama serve crashed during startup"
        exit 1
    fi
    sleep 1
done

MODEL="${CHAT_MODEL:-llama3.2:3b}"
echo "[start.sh] Ensuring model '${MODEL}' is available..."
if ! ollama list 2>/dev/null | awk '{print $1}' | grep -qx "${MODEL}"; then
    echo "[start.sh] Pulling ${MODEL} (this may take several minutes on first boot)..."
    ollama pull "${MODEL}"
fi

echo "[start.sh] Starting uvicorn on 0.0.0.0:7860..."
exec uvicorn backend.main:app --host 0.0.0.0 --port 7860
