"""
This is the template Berry profile.

A starting point for creating a new profile.

Learn about all the available settings - https://docs.Berry.com/settings/all-settings

"""

# Import the berry
from berry import berry

# You can import other libraries too
from datetime import date

# You can set variables
today = date.today()

# LLM Settings
berry.llm.model = "groq/llama-3.1-70b-versatile"
berry.llm.context_window = 110000
berry.llm.max_tokens = 4096
berry.llm.api_base = "https://api.example.com"
berry.llm.api_key = "your_api_key_here"
berry.llm.supports_functions = False
berry.llm.supports_vision = False


# berry Settings
berry.offline = False
berry.loop = True
berry.auto_run = False

# Toggle OS Mode - https://docs.Berry.com/guides/os-mode
berry.os = False

# Import Computer API - https://docs.Berry.com/code-execution/computer-api
berry.computer.import_computer_api = True


# Set Custom Instructions to improve your berry's performance at a given task
berry.custom_instructions = f"""
    Today's date is {today}.
    """



