<h1 align="center">● Berry</h1>

<p align="center">
    <a href="LICENSE"><img src="https://img.shields.io/static/v1?label=license&message=AGPL&color=white&style=flat" alt="License"/></a>
</p>





**Berry** lets LLMs run code (Python, Javascript, Shell, and more) locally. You can chat with Berry through a ChatGPT-like interface in your terminal by running `$ berry` after installing.

This provides a natural-language interface to your computer's general-purpose capabilities:

- Create and edit photos, videos, PDFs, etc.
- Control a Chrome browser to perform research
- Plot, clean, and analyze large datasets
- ...etc.

**⚠️ Note: You'll be asked to approve code before it's run.**

<br>

## Introduction


## Quick Start

### Install

```shell
pip install git+https://github.com/Berry/berry.git
```

> See our [setup guide](https://docs.Berry.com/getting-started/setup) for optional dependencies.

### Terminal

After installation, simply run `berry`:

```shell
berry
```

Berry will default to OpenAI's **GPT-4o** and will ask you to enter a key, which you can obtain from [OpenAI's API keys page](https://platform.openai.com/api-keys).  For other providers or local models, see below.

### Python

```python
from berry import berry

berry.chat("Plot AAPL and META's normalized stock prices") # Executes a single command
berry.chat() # Starts an interactive chat
```







## Commands

### Interactive Chat

To start an interactive chat in your terminal, either run `berry` from the command line:

```shell
berry
```

Or `berry.chat()` from a .py file:

```python
berry.chat()
```

**You can also stream each chunk:**

```python
message = "What operating system are we on?"

for chunk in berry.chat(message, display=False, stream=True):
  print(chunk)
```

### Programmatic Chat

For more precise control, you can pass messages directly to `.chat(message)`:

```python
berry.chat("Add subtitles to all videos in /videos.")

# ... Streams output to your terminal, completes task ...

berry.chat("These look great but can you make the subtitles bigger?")

# ...
```

### Start a New Chat

In Python, Berry remembers conversation history. If you want to start fresh, you can reset it:

```python
berry.messages = []
```

### Save and Restore Chats

`berry.chat()` returns a List of messages, which can be used to resume a conversation with `berry.messages = messages`:

```python
messages = berry.chat("My name is jaijitesh.") # Save messages to 'messages'
berry.messages = [] # Reset berry ("jaijitesh" will be forgotten)

berry.messages = messages # Resume chat from 'messages' ("jaijitesh" will be remembered)
```

### Customize System Message

You can inspect and configure Berry's system message to extend its functionality, modify permissions, or give it more context.

```python
berry.system_message += """
Run shell commands with -y so the user doesn't have to confirm them.
"""
print(berry.system_message)
```

### Change your Language Model

Berry uses [LiteLLM](https://docs.litellm.ai/docs/providers/) to connect to hosted language models.

You can change the model by setting the model parameter:

```shell
berry --model gpt-3.5-turbo
berry --model claude-2
berry --model command-nightly
```

In Python, set the model on the object:

```python
berry.llm.model = "gpt-3.5-turbo"
```

[Find the appropriate "model" string for your language model here.](https://docs.litellm.ai/docs/providers/)

### Running Berry locally

#### Terminal

Berry can use OpenAI-compatible server to run models locally (in LM Studio, Jan.ai, Ollama, etc.)

Simply run `berry` with the `api_base` URL of your inference server (for LM Studio it is `http://localhost:1234/v1` by default):

```shell
berry --api_base "http://localhost:1234/v1" --api_key "fake_key"
```

Alternatively you can use Llamafile without installing any third party software just by running

```shell
berry --local
```




**How to run LM Studio in the background.**

1. Download [LM Studio](https://lmstudio.ai/) then start it.
2. Select a model then click **↓ Download**.
3. Click the **↔️** button on the left (below 💬).
4. Select your model at the top, then click **Start Server**.

Once the server is running, you can begin your conversation with Berry.

> **Note:** Local mode sets your `context_window` to 3000, and your `max_tokens` to 1000. If your model has different requirements, set these parameters manually (see below).

#### Python

Our Python package gives you more control over each setting. To replicate and connect to LM Studio, use these settings:

```python
from berry import berry

berry.offline = True # Disables online features like Open Procedures
berry.llm.model = "openai/x" # Tells OI to send messages in OpenAI's format
berry.llm.api_key = "fake_key" # LiteLLM, which we use to talk to LM Studio, requires this
berry.llm.api_base = "http://localhost:1234/v1" # Point this at any OpenAI compatible server

berry.chat()
```

#### Context Window, Max Tokens

You can modify the `max_tokens` and `context_window` (in tokens) of locally running models.

For local mode, smaller context windows will use less RAM, so we recommend trying a much shorter window (~1000) if it's failing / if it's slow. Make sure `max_tokens` is less than `context_window`.

```shell
berry --local --max_tokens 1000 --context_window 3000
```

### Verbose mode

To help you inspect Berry we have a `--verbose` mode for debugging.

You can activate verbose mode by using its flag (`berry --verbose`), or mid-chat:

```shell
$ berry
...
> %verbose true <- Turns on verbose mode

> %verbose false <- Turns off verbose mode
```

### Interactive Mode Commands

In the interactive mode, you can use the below commands to enhance your experience. Here's a list of available commands:

**Available Commands:**

- `%verbose [true/false]`: Toggle verbose mode. Without arguments or with `true` it
  enters verbose mode. With `false` it exits verbose mode.
- `%reset`: Resets the current session's conversation.
- `%undo`: Removes the previous user message and the AI's response from the message history.
- `%tokens [prompt]`: (_Experimental_) Calculate the tokens that will be sent with the next prompt as context and estimate their cost. Optionally calculate the tokens and estimated cost of a `prompt` if one is provided. Relies on [LiteLLM's `cost_per_token()` method](https://docs.litellm.ai/docs/completion/token_usage#2-cost_per_token) for estimated costs.
- `%help`: Show the help message.

### Configuration / Profiles

Berry allows you to set default behaviors using `yaml` files.

This provides a flexible way to configure the berry without changing command-line arguments every time.

Run the following command to open the profiles directory:

```
berry --profiles
```

You can add `yaml` files there. The default profile is named `default.yaml`.

#### Multiple Profiles

Berry supports multiple `yaml` files, allowing you to easily switch between configurations:

```
berry --profile my_profile.yaml
```

## Sample FastAPI Server

The generator update enables Berry to be controlled via HTTP REST endpoints:

```python
# server.py

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from berry import berry

app = FastAPI()

@app.get("/chat")
def chat_endpoint(message: str):
    def event_stream():
        for result in berry.chat(message, stream=True):
            yield f"data: {result}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/history")
def history_endpoint():
    return berry.messages
```

```shell
pip install fastapi uvicorn
uvicorn server:app --reload
```

You can also start a server identical to the one above by simply running `berry.server()`.

## Android

The step-by-step guide for installing Berry on your Android device can be found in the [berry-termux repo](https://github.com/MikeBirdTech/berry-termux).

## Safety Notice

Since generated code is executed in your local environment, it can interact with your files and system settings, potentially leading to unexpected outcomes like data loss or security risks.

**⚠️ Berry will ask for user confirmation before executing code.**

You can run `berry -y` or set `berry.auto_run = True` to bypass this confirmation, in which case:

- Be cautious when requesting commands that modify files or system settings.
- Watch Berry like a self-driving car, and be prepared to end the process by closing your terminal.
- Consider running Berry in a restricted environment like Google Colab or Replit. These environments are more isolated, reducing the risks of executing arbitrary code.

There is **experimental** support for a [safe mode](https://github.com/Berry/berry/blob/main/docs/SAFE_MODE.md) to help mitigate some risks.


---
**Note**: This software is not affiliated with OpenAI.




