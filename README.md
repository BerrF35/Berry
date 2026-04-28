# Berry Desktop Assistant

Berry is a high-performance, local-first desktop agent designed to bridge the gap between large language models and your operating system. Unlike standard chat interfaces, Berry possesses the capability to execute code, manipulate files, and control web browsers directly from your desktop.

## Technical Architecture

Berry operates as a multi-component system designed for low-latency interaction and high reliability:

1. **The Core Engine**: A centralized coordinator that manages session state, model communication, and task orchestration.
2. **Berry CUA (Computer Use Agent)**: A specialized sidecar process that handles system-level interactions, including file system operations and terminal execution.
3. **Browser Relay**: A high-speed bridge connecting Berry to Chromium-based browsers, enabling real-time web automation and data extraction.
4. **Skill Codex**: A modular library of pre-defined capabilities (Skills) that extend the agent's functionality without requiring core updates.

## Key Capabilities

### 1. Autonomous Code Execution
Berry features a built-in runtime for Python and JavaScript. It can generate, test, and execute scripts locally to solve complex mathematical problems, process data, or automate repetitive tasks.

### 2. Browser Automation
Through the integrated Browser Extension Relay, Berry can:
- Navigate complex web interfaces.
- Extract structured data from websites.
- Interact with web-based applications on behalf of the user.
- Manage multiple browser sessions simultaneously.

### 3. Modular Skill System
The system is built on a "Skill" architecture. Each skill is defined by a set of instructions and metadata located in the `resources/codex-skills` directory. Users can extend Berry by adding custom markdown-based skills to this folder.

### 4. Local-First Design
Berry prioritizes local data processing. While it can connect to remote intelligence providers, your files, logs, and sensitive data remain on your local machine unless explicitly instructed otherwise.

## Installation and Setup

### System Requirements
- **Operating System**: Windows 10 or 11 (x64).
- **Disk Space**: Minimum 2.5 GB for installation; additional space for logs and cache.
- **RAM**: 8 GB minimum (16 GB recommended for complex automation).

### Deployment Process
Berry is distributed as a portable application bundle.
1. Download the `Berry.zip` archive from the official Releases page.
2. Extract the contents to a permanent directory (e.g., `C:\Apps\Berry`).
3. Execute `Berry.exe` to initialize the environment.

## Advanced Usage

### Customizing Skills
To add a new capability to Berry:
1. Navigate to `resources/codex-skills`.
2. Create a new subdirectory for your skill.
3. Add a `SKILL.md` file defining the triggers and logic for the capability.
4. Restart Berry to ingest the new skill.

### The Berry Vault
Berry utilizes a persistent "Vault" system for long-term memory and document retrieval. This is managed through the `wiki-query` skill, allowing the agent to cite and reference your personal documents during tasks.

## Security Considerations

Berry executes code directly on your hardware. It is recommended to:
- Run Berry in a controlled environment when processing untrusted data.
- Monitor terminal outputs for system-altering commands.
- Use the built-in Sandbox mode for high-risk operations.

## Troubleshooting

### Browser Connection Issues
If Berry fails to connect to your browser:
- Ensure the Berry Chrome Extension is installed and active.
- Check that the `browser-extension-relay` process is not blocked by a firewall.
- Restart the application to reset the WebSocket bridge.

### Execution Errors
If a script fails to run, check the `logs` directory within the application folder for detailed traceback information.

## License

Berry is provided under the MIT License. Portions of the software utilize third-party components (Chromium, Node.js, and Aspose), which are subject to their respective licenses found in the `resources/licenses` directory.


<p align="center">
    Built with by <a href="https://github.com/BerrF35">BerrF35</a> with reference to open-interpreter's design
</p>
