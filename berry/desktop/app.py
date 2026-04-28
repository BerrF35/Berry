import threading
import sys
import os
import webview
import socket
from berry.core.async_core import AsyncBerry

# Disable auth requirement for local desktop app
os.environ["berry_REQUIRE_AUTH"] = "False"

# Use AsyncBerry because it has the built-in FastAPI server
berry = AsyncBerry()

def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

def start_server(port):
    print(f"Starting Berry background server on port {port}...")
    try:
        # Start the FastAPI server using Berry's existing logic
        berry.server.run(host="127.0.0.1", port=port)
    except Exception as e:
        print(f"Server error: {e}")

def main():
    # Find an open port dynamically to avoid conflicts
    port = get_free_port()
    
    # Configure Berry for desktop UI mode
    berry.offline = False
    berry.auto_run = False
    
    # Start the server in a daemon thread so it dies when the window closes
    server_thread = threading.Thread(target=start_server, args=(port,), daemon=True)
    server_thread.start()
    
    # Wait for the server to bind to the port
    import time
    for _ in range(20):
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.5):
                break
        except OSError:
            time.sleep(0.5)
    else:
        print("Warning: Server took too long to start.")
        
    # Create the native desktop window using pywebview
    window = webview.create_window(
        'Berry',
        f'http://127.0.0.1:{port}',
        width=1200,
        height=850,
        frameless=False,
        background_color='#121212',
        min_size=(800, 600)
    )
    
    # Launch the native UI
    webview.start(debug=False)

if __name__ == '__main__':
    main()
