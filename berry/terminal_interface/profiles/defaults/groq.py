"""
This is an Berry profile. It configures Berry to run `Llama 3.1 70B` using Groq.

Make sure to set GROQ_API_KEY environment variable to your API key.
"""

from berry import berry

berry.llm.model = "groq/llama-3.1-70b-versatile"

berry.computer.import_computer_api = True

berry.llm.supports_functions = False
berry.llm.supports_vision = False
berry.llm.context_window = 110000
berry.llm.max_tokens = 4096



