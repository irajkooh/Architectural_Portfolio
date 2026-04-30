import os
import signal
import subprocess
import sys
import threading
import time

PORTS    = [8000, 5173]
ROOT     = os.path.dirname(os.path.abspath(__file__))
REQ_FILE = os.path.join(ROOT, "backend", "requirements.txt")


def clear_screen():
    os.system("clear" if os.name != "nt" else "cls")


def kill_ports(ports):
    for port in ports:
        result = subprocess.run(
            ["lsof", "-ti", f"tcp:{port}"],
            capture_output=True, text=True
        )
        for pid in result.stdout.strip().split():
            if pid:
                try:
                    os.kill(int(pid), signal.SIGKILL)
                    print(f"  Killed PID {pid} on port {port}")
                except ProcessLookupError:
                    pass


CHAT_PKGS = ["chromadb", "ollama", "pypdf", "groq"]

def install_backend_deps():
    print("Installing backend dependencies...")
    venv_python = os.path.join(ROOT, "backend", "venv", "bin", "python")
    target_python = venv_python if os.path.exists(venv_python) else sys.executable
    uv = subprocess.run(["which", "uv"], capture_output=True, text=True).stdout.strip()
    if uv:
        subprocess.run(["uv", "pip", "install", "--python", target_python, "-r", REQ_FILE], check=False)
        missing = [p for p in CHAT_PKGS
                   if subprocess.run([target_python, "-c", f"import {p}"],
                                     capture_output=True).returncode != 0]
        if missing:
            print(f"Installing chat packages: {' '.join(missing)}")
            subprocess.run(["uv", "pip", "install", "--python", target_python] + missing, check=True)
    else:
        subprocess.run([target_python, "-m", "pip", "install", "-r", REQ_FILE], check=False)
        missing = [p for p in CHAT_PKGS
                   if subprocess.run([target_python, "-c", f"import {p}"],
                                     capture_output=True).returncode != 0]
        if missing:
            print(f"Installing chat packages: {' '.join(missing)}")
            subprocess.run([target_python, "-m", "pip", "install"] + missing, check=True)


def install_frontend_deps():
    frontend_dir = os.path.join(ROOT, "frontend")
    if not os.path.isdir(os.path.join(frontend_dir, "node_modules")):
        print("Installing frontend dependencies...")
        subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
    return frontend_dir


def get_active_app():
    """Return the name of the currently focused macOS app."""
    if sys.platform != "darwin":
        return None
    r = subprocess.run(
        ["osascript", "-e",
         'tell application "System Events" to get name of first process whose frontmost is true'],
        capture_output=True, text=True
    )
    return r.stdout.strip() or None


def refocus_app(app_name):
    """Bring a macOS app back to the front."""
    if sys.platform == "darwin" and app_name:
        subprocess.run(
            ["osascript", "-e", f'tell application "{app_name}" to activate'],
            capture_output=True
        )


def open_browser_when_ready(terminal_app):
    import socket
    for _ in range(30):
        try:
            with socket.create_connection(("localhost", 5173), timeout=1):
                break
        except OSError:
            time.sleep(1)
    subprocess.run(["open", "http://localhost:5173"])
    time.sleep(0.5)
    refocus_app(terminal_app)


def run():
    clear_screen()
    print("=" * 50)
    print("  Architectural Portfolio — Dev Server")
    print("=" * 50)

    print("\n[1/4] Killing ports", PORTS, "...")
    kill_ports(PORTS)

    print("\n[2/4] Installing backend dependencies...")
    install_backend_deps()

    print("\n[3/4] Setting up frontend...")
    frontend_dir = install_frontend_deps()

    terminal_app = get_active_app()

    print("\n[4/4] Starting servers...")
    # Always use the venv Python so all installed packages (groq, etc.) are available
    venv_python = os.path.join(ROOT, "backend", "venv", "bin", "python")
    backend_python = venv_python if os.path.exists(venv_python) else sys.executable
    backend = subprocess.Popen(
        [backend_python, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
        cwd=os.path.join(ROOT, "backend"),
    )

    frontend = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
    )

    print("\n  Backend  →  http://localhost:8000")
    print("  Frontend →  http://localhost:5173")
    print("  Admin    →  http://localhost:5173/admin")
    print("\n  Press Ctrl+C to stop.\n")

    threading.Thread(
        target=open_browser_when_ready,
        args=(terminal_app,),
        daemon=True
    ).start()

    try:
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        print("\nShutting down...")
        backend.terminate()
        frontend.terminate()


if __name__ == "__main__":
    run()
