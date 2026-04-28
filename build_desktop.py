import os
import subprocess
import sys

def build():
    print("Building Berry Desktop Edition...")
    
    # Path to the main entry point
    entry_point = os.path.join("berry", "desktop", "app.py")
    
    # Path to the static UI assets that need to be bundled
    static_dir = os.path.join("berry", "desktop", "static")
    
    # PyInstaller command
    # --noconsole hides the terminal window behind the GUI
    # --onedir creates a directory with the exe and dependencies (better startup time than --onefile)
    # --name names the executable
    # --add-data includes the static files
    
    separator = ";" if sys.platform.startswith("win") else ":"
    
    cmd = [
        "pyinstaller",
        "--noconfirm",
        "--noconsole",
        "--name=Berry",
        f"--add-data={static_dir}{separator}berry/desktop/static",
        entry_point
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print("\nBuild complete! You can find the executable in the 'dist/Berry' folder.")
    except subprocess.CalledProcessError as e:
        print(f"\nBuild failed: {e}")
    except FileNotFoundError:
        print("\nError: PyInstaller not found. Did you run `pip install pyinstaller`?")

if __name__ == "__main__":
    build()
