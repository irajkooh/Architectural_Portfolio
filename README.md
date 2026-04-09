---
title: Architectural_Portfolio
emoji: 🏛️
colorFrom: gray
colorTo: yellow
sdk: docker
app_port: 7860
hardware: cpu-basic
pinned: true
license: mit
---

# Tella Irani Shemirani — Architectural Portfolio

A dark, luxurious architectural portfolio website with full runtime content management.

## Features

- **6 sections**: Hero, About, Portfolio (with image gallery + video), Resume/CV, Contact, Showcase
- **Admin panel** at `/admin` — password protected
- **Runtime customization**: color palettes, fonts, background image
- **File uploads**: profile photo, project images/videos, resume PDF, showcase videos
- **Theming**: 6 preset palettes + custom color pickers + Google Fonts dropdown

## Admin Access

Navigate to `/admin` and enter the admin password (set via `ADMIN_PASSWORD` space secret).

## Environment Variables (HF Space Secrets)

| Variable | Default | Description |
|---|---|---|
| `ADMIN_PASSWORD` | `TAA1346` | Admin panel password |
| `DATA_DIR` | `/data` | Persistent storage directory |
