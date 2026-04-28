import json
import os
from pathlib import Path

class ConfigManager:
    """
    Manages the 90+ advanced settings from the Berry Control Center UI.
    Persists configuration to ~/.berry/config.json and routes active
    settings into the Open Interpreter execution engine.
    """
    def __init__(self):
        self.config_dir = Path.home() / ".berry"
        self.config_path = self.config_dir / "config.json"
        
        # Default architecture for the 90+ settings
        self.settings = {
            "general": {
                "language": "en-US",
                "region": "US",
                "time_format": "24h",
                "startup_behavior": "normal",
                "default_mode": "assist",
                "fontSize": "16px",
                "theme": "dark"
            },
            "security": {
                "sandbox_mode": False,
                "process_protection": False,
                "blocked_directories": [],
                "session_timeout": 60,
                "trusted_actions": []
            },
            "llm": {
                "model": "auto",
                "api_key": "",
                "temperature": 0.2,
                "max_tokens": 2000,
                "timeout": 60,
                "retry_attempts": 3,
                "context_window": 8000,
                "custom_instructions": ""
            },
            "memory": {
                "memory_depth": 100, # truncate messages past this
                "auto_summarize": False
            },
            "performance": {
                "max_file_read_size_mb": 5,
                "cpu_usage_limit": "unlimited",
                "background_priority": "normal"
            }
        }
        self.load()

    def load(self):
        if not self.config_dir.exists():
            self.config_dir.mkdir(parents=True, exist_ok=True)
            
        if self.config_path.exists():
            try:
                with open(self.config_path, "r") as f:
                    data = json.load(f)
                    # Deep merge to preserve structure
                    self._deep_merge(self.settings, data)
            except Exception as e:
                print(f"Error loading config: {e}")
                self.save() # rewrite defaults if corrupted
        else:
            self.save()

    def save(self):
        try:
            with open(self.config_path, "w") as f:
                json.dump(self.settings, f, indent=4)
        except Exception as e:
            print(f"Error saving config: {e}")

    def update(self, payload: dict):
        """Recursively update settings and save to disk."""
        self._deep_merge(self.settings, payload)
        self.save()

    def _deep_merge(self, d, u):
        for k, v in u.items():
            if isinstance(v, dict) and k in d and isinstance(d[k], dict):
                self._deep_merge(d[k], v)
            else:
                d[k] = v

    def apply_to_berry(self, berry):
        """Applies relevant config settings directly to the live Open Interpreter instance."""
        # LLM settings
        berry.llm.model = self.settings["llm"].get("model", berry.llm.model)
        if self.settings["llm"].get("api_key"):
            berry.llm.api_key = self.settings["llm"]["api_key"]
        
        berry.llm.temperature = self.settings["llm"].get("temperature", 0.2)
        berry.llm.max_tokens = self.settings["llm"].get("max_tokens", 2000)
        berry.llm.context_window = self.settings["llm"].get("context_window", 8000)
        
        berry.custom_instructions = self.settings["llm"].get("custom_instructions", "")

        # System behavior
        berry.offline = self.settings["security"].get("sandbox_mode", False)
        
        # Truncate memory immediately if needed
        depth = self.settings["memory"].get("memory_depth", 100)
        if len(berry.messages) > depth:
            berry.messages = berry.messages[-depth:]

# Singleton instance
config_manager = ConfigManager()
