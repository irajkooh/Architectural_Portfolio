#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# DEPLOY TO HUGGING FACE SPACES
# ─────────────────────────────────────────────────────────────────────────────
#
# HOW TO RUN:
#   1. Open a terminal in the project root (Architectural_Portfolio/)
#   2. Make the script executable (only needed once):
#        chmod +x deploy_changes.sh
#   3. Run it:
#        ./deploy_changes.sh
#      Or with a custom commit message:
#        ./deploy_changes.sh "your commit message here"
#
# WHAT IT DOES:
#   1. Builds the frontend locally (fast, ~1s) and commits the built files
#   2. Commits any pending changes on your local main branch
#   3. Creates a temporary orphan branch (no history) with the same files
#   4. Strips large video/audio files (too big for git) and secret files
#   5. Force-pushes that clean snapshot to the HF Space
#   6. Cleans up and returns you to main
#
# NOTE:
#   Config, photos, and resume are baked into the Docker image from backend/uploads/.
#   Large videos (hero, showcase, music) must be re-uploaded via the admin panel.
#
# REQUIREMENTS:
#   - git installed and HuggingFace credentials cached. If you get an auth
#     prompt, enter your HF username and a token from:
#     https://huggingface.co/settings/tokens
# ─────────────────────────────────────────────────────────────────────────────

set -e

REMOTE="hf"
DEPLOY_BRANCH="_hf_deploy_tmp"
MSG="${1:-"deploy: $(date '+%Y-%m-%d %H:%M')"}"

# ── 1. Build frontend locally ─────────────────────────────────────────────────
echo ""
echo "▶  Building frontend..."
(cd frontend && npm run build --silent)
echo "   Frontend built → backend/static/"

# ── 2. Commit everything (code + built frontend) ──────────────────────────────
echo "▶  Staging changes..."
git add -u
git add backend/static/

if git diff --cached --quiet; then
  echo "   Nothing new to commit — working tree is clean."
else
  echo "▶  Committing: \"$MSG\""
  git commit -m "$MSG"
fi

# ── 3. Create orphan deploy branch (inherits current index, no history) ───────
echo "▶  Building clean deploy snapshot..."
git checkout --orphan "$DEPLOY_BRANCH"

# Strip large binaries HF rejects, and secret files.
# Keep backend/uploads/ so Docker can COPY config/photos/resume into the image.
# Only strip video/audio files that are too large for git.
git rm -rf --cached _Files/ -q 2>/dev/null || true
git rm -rf --cached _secrets/ -q 2>/dev/null || true
git rm -f --cached .HF_TOKEN.txt -q 2>/dev/null || true
git rm -f --cached backend/uploads/smtp.json -q 2>/dev/null || true
git rm -f --cached "backend/uploads/backgrounds/"*.m4v -q 2>/dev/null || true
git rm -f --cached "backend/uploads/backgrounds/"*.mp4 -q 2>/dev/null || true
git rm -rf --cached "backend/uploads/projects/showcase/" -q 2>/dev/null || true
git rm -f --cached "backend/uploads/showcase_images/"*.mp4 -q 2>/dev/null || true
git rm -f --cached "backend/uploads/showcase_images/"*.m4v -q 2>/dev/null || true
git rm -rf --cached "backend/uploads/showcase_music/" -q 2>/dev/null || true

git commit -q -m "$MSG"

# ── 4. Force-push to HF ───────────────────────────────────────────────────────
echo "▶  Force-pushing to HuggingFace Space ($REMOTE/main)..."
git push "$REMOTE" "$DEPLOY_BRANCH:main" --force

# ── 5. Return to main and clean up ────────────────────────────────────────────
git checkout -f main
git branch -D "$DEPLOY_BRANCH"

echo ""
echo "✓  Deployed! View your Space at:"
echo "   https://huggingface.co/spaces/irajkoohi/Architectural_Portfolio"
echo ""
