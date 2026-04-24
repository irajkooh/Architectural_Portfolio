FROM ollama/ollama:latest AS ollama_src

FROM python:3.12-slim

RUN apt-get update && apt-get install -y ffmpeg curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy Ollama binary from official image (avoids unreliable network download during build)
COPY --from=ollama_src /usr/bin/ollama /usr/bin/ollama

WORKDIR /app

# ── Backend deps ──────────────────────────────────────────────────────────────
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# ── Backend source + pre-built frontend + uploads ─────────────────────────────
COPY backend/ ./backend/

# ── Static media ──────────────────────────────────────────────────────────────
COPY media/ ./media/

# ── Startup script ────────────────────────────────────────────────────────────
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENV OLLAMA_MODELS=/app/.ollama/models
RUN mkdir -p /app/.ollama/models

# ── Permissions (HF Spaces runs as non-root uid 1000) ─────────────────────────
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app && \
    chmod -R 755 /app/backend/uploads
USER appuser

EXPOSE 7860

ENV ADMIN_PASSWORD=TAA1346
ENV DATA_DIR=/app/backend/uploads
ENV OLLAMA_HOST=http://localhost:11434
ENV OLLAMA_MODELS=/app/.ollama/models
ENV CHAT_MODEL=llama3.1:8b

CMD ["/app/start.sh"]
