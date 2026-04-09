FROM python:3.12-slim

RUN apt-get update && apt-get install -y ffmpeg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Backend deps ──────────────────────────────────────────────────────────────
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# ── Backend source + pre-built frontend + uploads (config/photos/resume) ──────
COPY backend/ ./backend/

# ── Static media (portfolio PDF, etc.) ─────────────────────────────────
COPY media/ ./media/

# ── Permissions (HF Spaces runs as non-root uid 1000) ────────────────────────
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app && \
    chmod -R 755 /app/backend/uploads
USER appuser

EXPOSE 7860

ENV ADMIN_PASSWORD=TAA1346
ENV DATA_DIR=/app/backend/uploads

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
