FROM ollama/ollama:latest

RUN apt-get update && apt-get install -y \
    python3 python3-venv ffmpeg curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY media/ ./media/
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENV OLLAMA_MODELS=/app/.ollama/models
RUN mkdir -p /app/.ollama/models

RUN chown -R 1000:1000 /app && \
    chmod -R 755 /app/backend/uploads
USER 1000

EXPOSE 7860

ENV ADMIN_PASSWORD=TAA1346
ENV DATA_DIR=/app/backend/uploads
ENV OLLAMA_HOST=http://localhost:11434
ENV OLLAMA_MODELS=/app/.ollama/models
ENV CHAT_MODEL=llama3.2:3b
ENV LLM_PROVIDER=ollama

ENTRYPOINT []
CMD ["/app/start.sh"]
