import re

def requires_action(text: str) -> bool:
    """
    High-speed heuristic engine to determine if a user's prompt
    requires OS-level code execution or if it is purely conversational.
    Returns True if an action is required, False otherwise.
    """
    if not text:
        return False
        
    text = text.lower()
    
    # 1. Direct OS Action Verbs coupled with targets
    action_patterns = [
        r"\b(open|close|run|execute|start|stop|kill|install|download|delete|remove|create|make)\b.*\b(app|application|file|folder|dir|directory|script|code|program|process|chrome|discord|browser|explorer|terminal)\b",
        r"\b(write a script|write a python|write a bash|write code)\b",
        r"\b(turn on|turn off|toggle)\b",
        r"\b(search for|find file|locate)\b",
    ]
    
    for pattern in action_patterns:
        if re.search(pattern, text):
            return True
            
    # 2. Specific App names used as verbs (e.g. "chrome", "open discord")
    app_keywords = ["chrome", "discord", "spotify", "vscode", "notepad", "terminal"]
    # If the prompt is very short and just contains an app name, it's likely a launch command
    if len(text.split()) < 5:
        for app in app_keywords:
            if app in text:
                return True
                
    # 3. Explicit code execution requests
    if "write code" in text or "python" in text or "bash script" in text or "shell script" in text:
        # Prevent triggering on "what is python"
        if "what is" not in text and "how do" not in text:
            return True

    return False
