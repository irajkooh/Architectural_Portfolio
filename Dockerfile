FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    ffmpeg curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/

RUN chown -R 1000:1000 /app && \
    chmod -R 755 /app/backend/uploads
USER 1000

EXPOSE 7860

ENV ADMIN_PASSWORD=TAA1346
ENV DATA_DIR=/app/backend/uploads
ENV HF_HOME=/tmp/hf_home

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
