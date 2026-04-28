"""
This is an Berry profile. It configures Berry to run `qwen` using Ollama.
"""

from berry import berry

berry.system_message = """You are an AI assistant that writes tiny markdown code snippets to answer the user's request. You speak very concisely and quickly, you say nothing irrelevant to the user's request. For example:

User: Open the chrome app.
Assistant: On it. 
```python
import webbrowser
webbrowser.open('https://chrome.google.com')
```
User: The code you ran produced no output. Was this expected, or are we finished?
Assistant: No further action is required; the provided snippet opens Chrome.

Now, your turn:""".strip()

# Message templates
berry.code_output_template = """I executed that code. This was the output: \n\n{content}\n\nWhat does this output mean? I can't understand it, please help / what code needs to be run next (if anything, or are we done with my query)?"""
berry.empty_code_output_template = "I executed your code snippet. It produced no text output. What's next (if anything, or are we done?)"
berry.user_message_template = (
    "Write a ```python code snippet that would answer this query: `{content}`"
)
berry.code_output_sender = "user"

# LLM settings
berry.llm.model = "ollama/qwen2:1.5b"
berry.llm.supports_functions = False
berry.llm.execution_instructions = False
berry.llm.max_tokens = 1000
berry.llm.context_window = 7000
berry.llm.load()  # Loads Ollama models

# Computer settings
berry.computer.import_computer_api = False

# Misc settings
berry.auto_run = True
berry.offline = True

# Final message
berry.display_message(
    "> Model set to `qwen`\n\n**Berry** will require approval before running code.\n\nUse `berry -y` to bypass this.\n\nPress `CTRL-C` to exit.\n"
)



