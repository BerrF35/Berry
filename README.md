<h1 align="center">🫐 Berry — Your Personal AI Desktop Assistant</h1>

<p align="center">
    <a href="LICENSE"><img src="https://img.shields.io/static/v1?label=license&message=AGPL&color=white&style=flat" alt="License"/></a>
    <img src="https://img.shields.io/badge/version-1.1.0-blue?style=flat" alt="Version"/>
    <img src="https://img.shields.io/badge/python-3.10+-green?style=flat" alt="Python"/>
    <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat" alt="Platform"/>
</p>

<p align="center">
    <b>Berry</b> is a production-grade, privacy-first AI desktop assistant that gives a large language model full control over your computer — launching apps, managing files, running scripts, browsing the web, and executing arbitrary code — all through natural language conversation or voice commands.
</p>

---

## ✨ What Makes Berry Different

Berry is not a chatbot. It is an **operating system command layer** that sits between you and your machine. You speak or type a command in plain English, and Berry writes and executes real code on your system to fulfill it.

| Feature | Berry | Typical Chatbot |
|---|---|---|
| Opens apps (Chrome, Discord, VS Code) | ✅ Writes & runs code | ❌ Text only |
| Creates, edits, deletes files | ✅ Full filesystem access | ❌ |
| Runs Python, Shell, PowerShell, JS | ✅ 10 language runtimes | ❌ |
| Voice-activated (wake word) | ✅ "Berry, open Chrome" | ❌ |
| Works 100% offline with local models | ✅ Ollama integration | ❌ |
| 90+ configurable settings | ✅ Persistent JSON config | ❌ |
| Sandbox / security enforcement | ✅ Blocked dirs, command filters | ❌ |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **pip** (Python package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/BerrF35/Berry.git
cd Berry/open-interpreter-main

# Install dependencies
pip install -e .
```

### Launch the Desktop App

```bash
python -m berry.desktop.app
```

This opens the **Berry Desktop UI** — a sleek, dark-mode native window powered by `pywebview`. On first launch, you'll see an **onboarding wizard** that lets you choose between:

- ☁️ **Cloud API** — Connect to GPT-4o, Claude, Gemini, etc. with an API key
- 💻 **Local Model** — Run completely offline with Ollama (Llama 3, Qwen, etc.)

### Launch the Terminal Interface

```bash
berry
```

Or use it programmatically:

```python
from berry import berry

berry.chat("Open Chrome and go to github.com")
berry.chat("Create a Python script that lists all files in my Downloads folder")
berry.chat("What's the weather like today?")
```

---

## 🖥️ Desktop Application

The Berry Desktop App is a full-featured native GUI built with **pywebview** and a **FastAPI** backend, connected via WebSocket for real-time streaming.

### Interface Features

- **Real-time streaming** — AI responses stream token-by-token with live Markdown rendering
- **Syntax-highlighted code blocks** — All generated code is highlighted with `highlight.js`
- **Code execution confirmations** — Every code block shows a "Do you want to run this code?" prompt with Run/Cancel buttons
- **Dark & Light mode toggle** — One-click theme switching with persistent preference
- **Chat history** — Full conversation persistence within sessions
- **Export Chat** — Download your entire conversation as a Markdown file
- **Stop Generation** — Cancel long-running AI responses mid-stream
- **Responsive layout** — Resizable window with collapsible code execution panel

### Speech-to-Text (STT) System

Berry includes a fully integrated voice input system:

- **Live transcript indicator** — A pulsing red bar appears above the input area showing exactly what the microphone is hearing in real-time (interim results)
- **Wake word mode** — Say **"Berry"** followed by your command (e.g., *"Berry, open Discord"*). Berry strips the wake word and processes only the command
- **Direct mode** — Disable the wake word in Settings to send all speech directly as input
- **Configurable sensitivity** — Adjust voice activation sensitivity from 1–10 in Settings
- **Auto-restart** — If the speech recognition engine crashes, it automatically restarts while listening mode is active
- **Error handling** — Toast notifications for microphone access denial, no-speech detection, and engine errors
- **Multiple STT backends** — Choose between Browser Native, OpenAI Whisper (local), or Cloud API in Settings

### Toast Notification System

A lightweight notification system provides instant feedback for all user actions:
- ✅ Green toasts for successful operations (settings saved, memory wiped)
- ❌ Red toasts for errors (save failures, mic denied)
- 🔵 Blue toasts for informational messages (mic active, update checks)

---

## 🧠 AI / Model Support

Berry supports **any LLM backend** through [LiteLLM](https://github.com/BerriAI/litellm), giving you access to 100+ models:

### Cloud Providers

| Provider | Models | Setup |
|---|---|---|
| **OpenAI** | GPT-4o, GPT-4o Mini | API key |
| **Google** | Gemini 2.5 Flash, Gemini 3 Pro Preview | API key |
| **Anthropic** | Claude 3.5 Sonnet | API key |

### Local Models (Ollama)

| Model | Size | Best For |
|---|---|---|
| **Qwen 2.5 Coder 7B** | ~4GB | Code execution (recommended) |
| **Llama 3.2** | ~2GB | General conversation |
| **Llama 3.1** | ~4GB | Balanced performance |

To use a local model:
```bash
# Install Ollama (https://ollama.com)
ollama run qwen2.5-coder:7b

# Then select "Local Model" during Berry's onboarding
```

> **Advanced users:** You can use any Ollama model by entering its tag in the Settings → AI / Model → Model Selector dropdown. Berry is model-agnostic.

### Intelligent Intent Routing

Berry includes a **Heuristic Intent Analyzer** (`berry/core/utils/intent_analyzer.py`) that runs in under 1ms before every LLM inference:

- **Action detection** — Scans for OS action verbs (`open`, `close`, `install`, `delete`, `create`) combined with targets (`app`, `file`, `folder`, `chrome`, `discord`)
- **Code execution jailbreak** — When an action is detected, Berry injects a system override into the final user message forcing the local model to write executable code instead of refusing
- **Conversational mode** — When no action is detected (e.g., "What is 2+2?"), Berry injects a conversational override telling the model NOT to write code and to answer directly
- **Zero latency** — Uses compiled regular expressions, not a secondary LLM call

This solves the critical problem where local models (Llama, Qwen) would refuse to execute OS commands due to safety alignment training.

---

## ⚙️ Berry Control Center (90+ Settings)

The Settings panel is a comprehensive configuration suite organized into **15 categories** with **90+ individually configurable options**. All settings are persisted to `~/.berry/config.json` and survive application restarts.

### Settings Categories

#### 🔧 General
- **Language** — English (US/UK), Spanish, French, German, Japanese
- **Region** — US, Europe, Asia
- **Time Format** — 24-hour / 12-hour AM/PM
- **Startup Behavior** — Normal, Minimize to Tray, Hidden Daemon
- **Default Mode** — Assistant (Safe), Operator (Action Bias), Root (Unrestricted)
- **Reset All Settings** — Full factory reset with confirmation dialog

#### 🔒 Permissions & Security
- **Permission Mode** — Strict (ask everything), Smart (ask on destructive), Auto-run (root)
- **Confirmation Behavior** — Always / Smart / Never
- **Critical Process Protection** — Toggle protection for system-critical processes
- **Sandbox / Safe Mode** — Blocks destructive code patterns (`os.system`, `subprocess`, `rm -rf`, `del /s`)
- **Blocked Directories** — Comma-separated list of paths the AI cannot access (enforced in the execution layer)
- **Trusted Actions** — Whitelist of allowed commands
- **Session Timeout** — Auto-lock after inactivity (minutes)
- **Audit Logs Viewer** — Opens a real-time log popup showing all executed commands

#### 🤖 AI / Model
- **Model Selector** — Grouped by provider (Google, OpenAI, Anthropic, Local/Ollama)
- **API Key** — Secure password field
- **Backend Selection** — Auto-Detect, Local Hardware Only, Cloud API Only
- **Temperature** — Slider from 0.0 to 1.0
- **Max Tokens** — Configurable output length limit
- **Timeout** — Request timeout in seconds
- **Retry Attempts** — Auto-retry on failure
- **Structured Output Enforcement** — Toggle JSON-structured responses
- **Fallback Behavior** — Enable/disable model fallback routing
- **System Prompt Editor** — Full textarea to customize Berry's personality and instructions
- **Context Length Limit** — Maximum context window size

#### 🎤 Voice
- **Microphone Selection** — System Default, USB, Virtual Audio Cable
- **Wake Word Enable/Disable** — Toggle the "Berry" wake word requirement
- **Wake Word Phrase** — Customizable (default: "Berry")
- **Voice Activation Sensitivity** — Slider from 1–10
- **Speech-to-Text Model** — Browser Native, OpenAI Whisper, Cloud API
- **Text-to-Speech Voice** — System Default, ElevenLabs Premium, Coqui TTS Local
- **Response Playback** — Toggle TTS for AI responses

#### 🎨 UI / Interface
- **Theme** — System Auto, Dark Mode, Light Mode, Hacker Green
- **Accent Color** — Full color picker
- **Font Size** — Extra Small (12px) through Extra Large (22px)
- **UI Density** — Comfortable / Compact (Dev Mode)
- **Animations** — Enable/disable UI animations
- **Overlay Hotkey** — Configurable keyboard shortcut
- **Transparency** — Window transparency slider (0–100%)
- **Notification Style** — Toast, Blocking Modals, Silent (Log Only)

#### ⌨️ Hotkeys
- **Global Activation Key** — Default: `Alt+Space`
- **Quick Command Key** — Default: `Ctrl+Shift+C`
- **Cancel/Interrupt Key** — Default: `Esc`
- **Push-to-Talk Key** — Default: `` ` ``

#### 📱 Apps & Process Control
- **App Alias Mappings** — Map custom names to executables (opens a full alias editor popup)
- **Preferred Browser** — System Default, Chrome, Firefox, Edge, Safari
- **Process Matching** — Strict (exact) or Fuzzy (partial) matching
- **Kill Behavior** — Graceful (SIGTERM) or Force Kill (SIGKILL) — *enforced in the backend via `psutil`*
- **Allow Background Control** — Toggle background process management

#### 📁 File System
- **Allowed Commands** — All Commands, Safe Only (read-only), No System Commands — *enforced: blocks `rm`, `del`, `format`, `chmod`, `wget`, `curl` in Safe mode*
- **Max File Read Size (MB)** — Configurable limit
- **Default Save Location** — Customizable download path
- **Auto-open Files** — Toggle auto-launch after creation
- **File Preview Length** — Lines to preview
- **Background Indexing** — Toggle filesystem indexing

#### 🧠 Memory & Context
- **Memory Depth** — Maximum messages retained in context
- **Auto-Summarize** — Automatically compress old conversation context
- **Vector DB Provider** — ChromaDB (Local), Pinecone (Cloud), In-Memory (Fast)
- **Clear Memory** — Wipe all conversation memory with confirmation

#### 🤖 Automation
- **Scheduled Tasks** — Opens a task scheduler popup (task + schedule input)
- **Auto-run on Boot** — Launch Berry when your OS starts
- **Macro Recording** — Off / On (Save as Scripts)

#### 🧩 Plugins & Tools
- **Plugin Directory** — Configurable plugin path (default: `~/.berry/plugins`)
- **Auto-Update Plugins** — Toggle automatic plugin updates
- **Manage Extensions** — Plugin manager popup showing active plugins with status indicators

#### ⚡ Performance
- **CPU Usage Limit** — Unlimited, 75% (Balanced), 50% (Eco), 25% (Low Power)
- **Background Priority** — High / Normal / Low
- **Cache Size Limit (GB)** — Configurable cache cap

#### 📊 Logs & Analytics
- **Audit Logs** — Toggle execution logging
- **Error Reporting** — Opt-in telemetry
- **Trace Level** — Info (Standard), Warnings Only, Debug (Verbose), Errors Only

#### 🔄 Updates
- **Check for Updates** — Manual check with loading animation
- **Auto-Update** — Toggle automatic updates
- **Beta Channel** — Opt into pre-release builds

#### 🛠️ Developer
- **Debug Mode** — Enable verbose debugging output
- **Raw JSON Context Viewer** — Opens a popup that fetches and displays the live `config.json` with syntax highlighting
- **Browser Dev Tools** — Quick access instructions (F12)

### Settings Persistence Architecture

All settings are managed by the **`ConfigManager`** class (`berry/core/config_manager.py`):

```
~/.berry/config.json
├── general: { language, region, time_format, startup_behavior, default_mode }
├── security: { permission_mode, sandbox_mode, blocked_directories, ... }
├── llm: { model, api_key, temperature, max_tokens, ... }
├── voice: { mic_selection, wake_word_enable, stt_model, ... }
├── ui: { theme, accent_color, fontSize, transparency, ... }
├── apps: { preferred_browser, kill_behavior, process_matching, ... }
├── fs: { max_file_read_size_mb, allowed_commands, ... }
├── memory: { memory_depth, auto_summarize, vector_db }
├── performance: { cpu_usage_limit, background_priority, cache_size }
└── ... (15 categories total)
```

- **Deep merge strategy** — New settings merge non-destructively with existing config
- **UI Hydration** — When you open Settings, a `GET /settings` API call fetches the live config and physically updates every slider, toggle, and dropdown to reflect the saved state
- **Instant feedback** — Save confirmation via toast notification system

---

## 🔧 Computer API (16 Tool Modules)

Berry exposes a comprehensive `computer` API with **16 specialized tool modules**, each providing domain-specific OS control:

| Module | Description | Example Methods |
|---|---|---|
| `computer.terminal` | Execute code in 10 languages | `run(language, code)`, `stop()`, `terminate()` |
| `computer.browser` | Web browsing & research | `search(query)`, `navigate(url)` |
| `computer.files` | File management | `read(path)`, `write(path, content)` |
| `computer.os` | OS-level operations | `get_info()`, `notify()` |
| `computer.keyboard` | Keyboard automation | `type(text)`, `press(key)`, `hotkey()` |
| `computer.mouse` | Mouse automation | `click(x, y)`, `move(x, y)`, `scroll()` |
| `computer.display` | Screen capture & analysis | `screenshot()`, `get_resolution()` |
| `computer.clipboard` | Clipboard management | `get()`, `set(text)` |
| `computer.vision` | Computer vision & OCR | `analyze(image)` |
| `computer.mail` | Email integration | `send(to, subject, body)` |
| `computer.sms` | SMS messaging | `send(to, message)` |
| `computer.calendar` | Calendar management | `create_event()`, `list_events()` |
| `computer.contacts` | Contacts access | `search(name)`, `list()` |
| `computer.docs` | Document processing | `generate()`, `convert()` |
| `computer.ai` | AI sub-calls | `chat(prompt)` |
| `computer.skills` | Learned skill library | `import_skills()`, `save()` |

### Supported Programming Languages

Berry can execute code in **10 languages** through its terminal subsystem:

- 🐍 Python
- 🐚 Shell (Bash)
- ⚡ PowerShell
- 🟨 JavaScript
- ☕ Java
- 💎 Ruby
- 📊 R
- 🍎 AppleScript
- 🌐 HTML
- ⚛️ React (JSX)

---

## 🛡️ Security Architecture

Berry implements multiple layers of security enforcement that are **actively enforced in the Python execution pipeline**, not just UI toggles:

### Execution Interception Layer (`computer.py`)

Every call to `computer.run()` passes through a security interceptor that checks:

1. **Sandbox Mode** — If enabled, blocks code containing `os.system`, `subprocess`, `rm -rf`, `del /s`
2. **Blocked Directories** — Scans code for blacklisted paths and rejects with a Security Exception
3. **Allowed Commands Filter** — In "Safe Only" mode, blocks destructive commands (`rm`, `del`, `format`, `mkfs`, `chmod`, `chown`, `wget`, `curl`)
4. **Process Protection** — Prevents termination of critical system processes

### Kill Behavior Enforcement (`terminal.py`)

The `terminate()` method in the Terminal class respects the Kill Behavior setting:
- **Graceful** — Standard `SIGTERM` signal
- **Force Kill** — Uses `psutil` to recursively discover all child PIDs and force-kill them with `SIGKILL`

### Code Execution Confirmations

By default, every code block generated by the AI displays a confirmation dialog:
> "Do you want to run this code?"
> [Running...] [Cancel]

This can be configured to "Auto-run" in the Permission Mode setting for power users.

---

## 📁 Project Structure

```
Berry/
├── berry/
│   ├── __init__.py                  # Package entry point
│   ├── core/
│   │   ├── async_core.py            # FastAPI server (WebSocket + REST routes)
│   │   ├── core.py                  # Core Berry interpreter class
│   │   ├── config_manager.py        # ConfigManager — 90+ settings persistence
│   │   ├── default_system_message.py # AI system prompt definition
│   │   ├── respond.py               # Response generation pipeline
│   │   ├── render_message.py        # Message formatting
│   │   ├── llm/
│   │   │   ├── llm.py              # LLM abstraction layer (LiteLLM)
│   │   │   ├── run_text_llm.py     # Text completion + intent routing
│   │   │   ├── run_tool_calling_llm.py  # Tool-calling completion + intent routing
│   │   │   └── utils/              # JSON parsing, delta merging, message conversion
│   │   ├── computer/
│   │   │   ├── computer.py         # Computer API hub + security interceptor
│   │   │   ├── terminal/           # 10-language code execution engine
│   │   │   ├── browser/            # Web browser automation
│   │   │   ├── files/              # File system operations
│   │   │   ├── keyboard/           # Keyboard input simulation
│   │   │   ├── mouse/              # Mouse control
│   │   │   ├── display/            # Screen capture
│   │   │   ├── clipboard/          # Clipboard access
│   │   │   ├── vision/             # Computer vision
│   │   │   ├── mail/               # Email integration
│   │   │   ├── sms/                # SMS messaging
│   │   │   ├── calendar/           # Calendar management
│   │   │   ├── contacts/           # Contacts access
│   │   │   ├── docs/               # Document generation
│   │   │   ├── ai/                 # Sub-AI calls
│   │   │   └── skills/             # Learned skills library
│   │   └── utils/
│   │       ├── intent_analyzer.py  # Heuristic intent routing engine
│   │       ├── scan_code.py        # Code safety analysis
│   │       ├── truncate_output.py  # Output length management
│   │       └── telemetry.py        # Usage analytics
│   ├── desktop/
│   │   ├── app.py                  # PyWebView native window launcher
│   │   └── static/
│   │       ├── index.html          # Full UI with 90+ settings inputs
│   │       ├── style.css           # Dark/light theme, glassmorphism
│   │       └── app.js              # WebSocket client, STT, settings hydration
│   └── terminal_interface/
│       ├── terminal_interface.py   # CLI interface
│       ├── profiles/               # Pre-configured model profiles
│       └── utils/                  # Token counting, markdown display
├── tests/                          # Test suite
├── installers/                     # Platform installers (Windows, macOS, Linux)
├── pyproject.toml                  # Python project configuration
├── poetry.lock                     # Dependency lock file
├── Dockerfile                      # Container support
└── LICENSE                         # AGPL license
```

---

## 🔌 API Reference

### WebSocket API

Connect to `ws://localhost:{port}/` for real-time communication:

```javascript
// Send a message
ws.send(JSON.stringify({ role: "user", type: "message", content: "Open Chrome" }));

// Receive streaming response
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // data.type: "message" | "code" | "confirmation" | "status" | "error"
    // data.content: string
    // data.start / data.end: boolean (block boundaries)
};
```

### REST API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/settings` | Retrieve current config from `ConfigManager` |
| `POST` | `/settings` | Save settings payload to `~/.berry/config.json` |
| `POST` | `/run` | Execute a one-shot command |

---

## 🛠️ Development

### Running Tests

```bash
pytest tests/
```

### Building Desktop Executable

```bash
python build_desktop.py
```

### Docker

```bash
docker build -t berry .
docker run -it berry
```

---

## 📋 Changelog

### v1.1.0 — Berry Desktop Assistant (Current)

- ✅ **Desktop GUI** — Full native window with pywebview, dark/light themes, glassmorphism
- ✅ **90+ Settings** — 15-category Control Center with persistent `ConfigManager` backend
- ✅ **Intent Analyzer** — Heuristic engine that conditionally routes prompts to code-execution or conversational mode
- ✅ **STT System** — Live speech-to-text with interim transcripts, wake word detection, and configurable backends
- ✅ **Toast Notifications** — Visual feedback system for all user actions
- ✅ **Security Enforcement** — Sandbox mode, blocked directories, command whitelisting, force-kill behavior
- ✅ **UI State Hydration** — Settings modal loads saved config on every open
- ✅ **Settings Action Buttons** — All "Manage", "View Logs", "Wipe Memory" buttons open functional popups
- ✅ **Onboarding Wizard** — First-run setup for Cloud API or Local Model

### v1.0.0 — Core Engine

- ✅ Terminal-based AI interpreter
- ✅ 10-language code execution
- ✅ 16 computer tool modules
- ✅ LiteLLM multi-provider support

---

## 📜 License

Berry is licensed under the [AGPL License](LICENSE).

---

<p align="center">
    Built with ❤️ by <a href="https://github.com/BerrF35">BerrF35</a>
</p>
