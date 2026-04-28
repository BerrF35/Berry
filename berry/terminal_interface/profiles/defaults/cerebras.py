"""
This is an Berry profile to use Cerebras. 

Please set the CEREBRAS_API_KEY environment variable.

See https://inference-docs.cerebras.ai/introduction for more information.
"""

from berry import berry
import os

# LLM settings
berry.llm.api_base = "https://api.cerebras.ai/v1"
berry.llm.model = "openai/llama3.1-70b"  # or "openai/Llama-3.1-8B"
berry.llm.api_key = os.environ.get("CEREBRAS_API_KEY")
berry.llm.supports_functions = False
berry.llm.supports_vision = False
berry.llm.max_tokens = 4096
berry.llm.context_window = 8192


# Computer settings
berry.computer.import_computer_api = False

# Misc settings
berry.offline = False
berry.auto_run = False

# Custom Instructions
berry.custom_instructions = f"""

    """



