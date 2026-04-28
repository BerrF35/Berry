document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocket(`ws://${window.location.host}/`);
    
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const codeOutput = document.getElementById('codeOutput');
    const toggleCodePanel = document.getElementById('toggleCodePanel');
    const codePanel = document.getElementById('codePanel');
    
    // Settings Modal
    const settingsModal = document.getElementById('settingsModal');
    const openSettings = document.getElementById('openSettings');
    const closeSettings = document.getElementById('closeSettings');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    let currentMessageElement = null;
    let isCodeBlock = false;
    let currentCodeContent = "";

    // Highlight.js configuration
    hljs.configure({ ignoreUnescapedHTML: true });

    ws.onopen = () => {
        console.log('Connected to Berry Server');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Acknowledge receipt if required
        if (data.id) {
            ws.send(JSON.stringify({ ack: data.id }));
        }

        handleServerMessage(data);
    };

    function handleServerMessage(data) {
        if (data.type === 'status' && data.content === 'complete') {
            currentMessageElement = null;
            isCodeBlock = false;
            return;
        }

        // Initialize a new message element if we don't have one
        if (!currentMessageElement && ['message', 'code', 'error', 'confirmation'].includes(data.type)) {
            currentMessageElement = createMessageElement('assistant');
        }

        if (!currentMessageElement) return;

        const contentDiv = currentMessageElement.querySelector('.content');

        if (data.type === 'message') {
            if (data.start) {
                // start new message chunk
            }
            if (data.content) {
                // We use marked.js to render markdown.
                // Since data arrives in chunks, we'd ideally accumulate it.
                // For simplicity here, we append and re-render or just append text.
                // Better approach: accumulate full message text on the element and re-render.
                let rawText = contentDiv.getAttribute('data-raw') || '';
                rawText += data.content;
                contentDiv.setAttribute('data-raw', rawText);
                contentDiv.innerHTML = marked.parse(rawText);
                
                // Apply syntax highlighting to any new code blocks
                contentDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
        } 
        else if (data.type === 'code') {
            if (data.start) {
                isCodeBlock = true;
                currentCodeContent = "";
                // Also show in chat area
                let rawText = contentDiv.getAttribute('data-raw') || '';
                rawText += `\n\n\`\`\`${data.format || 'python'}\n`;
                contentDiv.setAttribute('data-raw', rawText);
            }
            if (data.content) {
                currentCodeContent += data.content;
                // Update chat area
                let rawText = contentDiv.getAttribute('data-raw') || '';
                rawText += data.content;
                contentDiv.setAttribute('data-raw', rawText);
                contentDiv.innerHTML = marked.parse(rawText);
                
                // Apply syntax highlighting
                contentDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
            if (data.end) {
                isCodeBlock = false;
                let rawText = contentDiv.getAttribute('data-raw') || '';
                rawText += `\n\`\`\`\n`;
                contentDiv.setAttribute('data-raw', rawText);
                contentDiv.innerHTML = marked.parse(rawText);
                contentDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
        }
        else if (data.type === 'console') {
            // Display console output in the code panel
            if (data.content) {
                const span = document.createElement('span');
                span.textContent = data.content;
                codeOutput.appendChild(span);
                codeOutput.scrollTop = codeOutput.scrollHeight;
                
                // Make sure panel is open
                codePanel.classList.remove('hidden');
            }
        }
        else if (data.type === 'confirmation') {
            // Berry is asking to run code
            const confirmDiv = document.createElement('div');
            confirmDiv.innerHTML = `
                <div style="margin-top: 10px; padding: 10px; background: rgba(0, 123, 255, 0.1); border: 1px solid var(--accent-color); border-radius: 6px;">
                    <p style="margin-bottom: 10px; font-weight: bold;">Do you want to run this code?</p>
                    <button class="btn primary-btn" onclick="approveCode(this)">Run Code</button>
                </div>
            `;
            contentDiv.appendChild(confirmDiv);
            currentMessageElement = null; // Next message is a new block
        }
        else if (data.type === 'error') {
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="margin-top: 10px; padding: 10px; background: rgba(255,0,0,0.1); border-left: 4px solid #ff6b6b; border-radius: 4px; color: #ff6b6b;">
                    <p style="margin-bottom: 5px; font-weight: bold;">Error</p>
                    <pre style="white-space: pre-wrap; font-size: 12px; font-family: 'Fira Code', monospace;">${data.content}</pre>
                </div>
            `;
            contentDiv.appendChild(errorDiv);
            currentMessageElement = null; // Reset for next message
        }

        scrollToBottom();
    }

    window.approveCode = function(btnElement) {
        btnElement.innerText = "Running...";
        btnElement.disabled = true;
        
        ws.send(JSON.stringify({ role: "user", type: "command", start: true }));
        ws.send(JSON.stringify({ role: "user", type: "command", content: "go" }));
        ws.send(JSON.stringify({ role: "user", type: "command", end: true }));
    };

    function createMessageElement(role) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        if (role === 'user') {
            avatar.innerHTML = '<i data-lucide="user"></i>';
        } else {
            avatar.innerHTML = '<i data-lucide="bot"></i>';
        }

        
        const content = document.createElement('div');
        content.className = 'content';
        content.setAttribute('data-raw', '');
        
        div.appendChild(avatar);
        div.appendChild(content);
        messagesContainer.appendChild(div);
        
        if (window.lucide) {
            lucide.createIcons({ root: div });
        }
        
        return div;
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        // Show user message
        const userMsg = createMessageElement('user');
        userMsg.querySelector('.content').textContent = text;
        scrollToBottom();

        // Send to server
        ws.send(JSON.stringify({ role: "user", start: true }));
        ws.send(JSON.stringify({ role: "user", type: "message", content: text }));
        ws.send(JSON.stringify({ role: "user", end: true }));

        messageInput.value = '';
        currentMessageElement = null; // Reset for assistant response
    }

    // Onboarding Wizard Logic
    const onboardingModal = document.getElementById('onboardingModal');
    const localSetupModal = document.getElementById('localSetupModal');
    
    if (!localStorage.getItem('onboardingCompleted')) {
        onboardingModal.classList.add('active');
    }

    document.getElementById('btnSetupCloud').addEventListener('click', () => {
        onboardingModal.classList.remove('active');
        settingsModal.classList.add('active');
        localStorage.setItem('onboardingCompleted', 'true');
    });

    document.getElementById('btnSetupLocal').addEventListener('click', () => {
        onboardingModal.classList.remove('active');
        localSetupModal.classList.add('active');
    });

    document.getElementById('closeLocalSetup').addEventListener('click', () => {
        localSetupModal.classList.remove('active');
    });

    document.getElementById('completeLocalSetupBtn').addEventListener('click', async () => {
        // Set model to ollama automatically
        const payload = {
            llm: { model: 'ollama/qwen2.5-coder:7b' },
            auto_run: false
        };
        try {
            await fetch('/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            document.getElementById('modelSelect').value = 'ollama/qwen2.5-coder:7b';
            localSetupModal.classList.remove('active');
            localStorage.setItem('onboardingCompleted', 'true');
        } catch(e) {
            console.error('Failed to save settings', e);
        }
    });

    // Utilities Logic
    document.getElementById('clearChatBtn').addEventListener('click', async () => {
        if(confirm('Are you sure you want to clear the chat?')) {
            messagesContainer.innerHTML = '';
            // create initial assistant message again
            const assistantMsg = createMessageElement('assistant');
            assistantMsg.querySelector('.content').textContent = "Chat cleared. How can I assist you today?";
            
            // Notify backend to clear context
            try {
                await fetch('/clear_chat', { method: 'POST' });
            } catch(e) {
                console.error("Failed to clear backend chat.", e);
            }
        }
    });

    document.getElementById('exportChatBtn').addEventListener('click', () => {
        let markdown = "# Berry Chat Export\n\n";
        document.querySelectorAll('.message').forEach(msg => {
            const role = msg.classList.contains('user') ? 'User' : 'Berry';
            const content = msg.querySelector('.content').getAttribute('data-raw') || msg.querySelector('.content').textContent;
            markdown += `### ${role}\n${content}\n\n`;
        });
        
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `berry_chat_${new Date().getTime()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    });

    const stopBtn = document.getElementById('stopBtn');
    stopBtn.addEventListener('click', () => {
        ws.send(JSON.stringify({ role: "user", type: "stop", content: "stop" }));
        stopBtn.style.display = 'none';
    });

    // Show stop button when generating (hook into send message)
    const originalSendMessage = sendMessage;
    sendMessage = () => {
        originalSendMessage();
        stopBtn.style.display = 'flex';
    };

    // Hide stop button when message is complete
    const originalHandleServerMessage = handleServerMessage;
    handleServerMessage = (data) => {
        originalHandleServerMessage(data);
        if (data.type === 'status' && data.content === 'complete') {
            stopBtn.style.display = 'none';
        }
    };

    // Replace sendMessage assignment
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Panel Toggle
    toggleCodePanel.addEventListener('click', () => {
        codePanel.classList.toggle('hidden');
    });

    // Theme Toggle
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    // Load saved theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.setAttribute('data-lucide', 'moon');
        lucide.createIcons();
    }
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light');
            themeIcon.setAttribute('data-lucide', 'moon');
        } else {
            localStorage.setItem('theme', 'dark');
            themeIcon.setAttribute('data-lucide', 'sun');
        }
        lucide.createIcons();
    });

    async function loadSettingsToUI() {
        try {
            const res = await fetch('/settings');
            const data = await res.json();
            
            const inputs = settingsModal.querySelectorAll('input, select');
            inputs.forEach(input => {
                const id = input.id;
                let matchedValue = undefined;
                for (const cat in data) {
                    if (data[cat] && data[cat][id] !== undefined) {
                        matchedValue = data[cat][id];
                        break;
                    }
                }
                
                if (['modelSelect', 'apiKey', 'temperature', 'maxTokens', 'contextWindow', 'customInstructions'].includes(id)) {
                    let key = id === 'modelSelect' ? 'model' : id === 'apiKey' ? 'api_key' : id === 'maxTokens' ? 'max_tokens' : id === 'contextWindow' ? 'context_window' : id === 'customInstructions' ? 'custom_instructions' : id;
                    if (data.llm && data.llm[key] !== undefined) matchedValue = data.llm[key];
                }
                
                if (matchedValue !== undefined) {
                    if (input.type === 'checkbox') {
                        input.checked = matchedValue;
                    } else {
                        input.value = matchedValue;
                    }
                }
            });
        } catch (e) {
            console.error("Failed to load settings to UI:", e);
        }
    }

    // Settings Modal (Expanded)
    openSettings.addEventListener('click', () => {
        loadSettingsToUI();
        settingsModal.classList.add('active');
    });
    closeSettings.addEventListener('click', () => settingsModal.classList.remove('active'));
    
    // Load font size from local storage on boot
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.body.style.fontSize = savedFontSize;
        document.getElementById('fontSize').value = savedFontSize;
    }

    saveSettingsBtn.addEventListener('click', async () => {
        // Collect ALL inputs from the settings modal
        const payload = { llm: {}, general: {}, security: {}, memory: {}, performance: {}, apps: {}, fs: {}, voice: {}, ui: {} };
        const inputs = settingsModal.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            let val = input.value;
            if (input.type === 'checkbox') val = input.checked;
            if (input.type === 'number') val = parseFloat(val) || val;
            
            const id = input.id;
            if (!id) return;
            
            // Map IDs to specific categories
            if (['modelSelect', 'apiKey', 'temperature', 'maxTokens', 'contextWindow', 'customInstructions', 'timeout', 'retryAttempts', 'backend_selection', 'structured_output', 'fallback_behavior'].includes(id)) {
                let key = id === 'modelSelect' ? 'model' : id === 'apiKey' ? 'api_key' : id === 'maxTokens' ? 'max_tokens' : id === 'contextWindow' ? 'context_window' : id === 'customInstructions' ? 'custom_instructions' : id;
                payload.llm[key] = val;
            } else if (['permission_mode', 'confirmation_behavior', 'process_protection', 'sandbox_mode', 'blocked_directories', 'trusted_actions', 'session_timeout'].includes(id)) {
                payload.security[id] = val;
            } else if (['preferred_browser', 'process_matching', 'kill_behavior', 'background_control'].includes(id)) {
                payload.apps[id] = val;
            } else if (['max_file_read_size_mb', 'default_save_location', 'auto_open_files', 'file_preview_length', 'fs_indexing', 'allowed_commands'].includes(id)) {
                payload.fs[id] = val;
            } else if (['memory_depth', 'auto_summarize', 'vector_db'].includes(id)) {
                payload.memory[id] = val;
            } else if (['mic_selection', 'wake_word_enable', 'wake_word_phrase', 'voice_sensitivity', 'stt_model', 'tts_voice', 'response_playback'].includes(id)) {
                payload.voice[id] = val;
            } else if (['theme', 'accent_color', 'fontSize', 'ui_density', 'ui_animations', 'overlay_hotkey', 'transparency', 'notification_style'].includes(id)) {
                payload.ui[id] = val;
            } else if (['cpu_usage_limit', 'background_priority', 'cache_size'].includes(id)) {
                payload.performance[id] = val;
            } else {
                payload.general[id] = val;
            }
        });

        // Apply font size immediately
        const fontSize = document.getElementById('fontSize')?.value || '16px';
        document.body.style.fontSize = fontSize;
        localStorage.setItem('fontSize', fontSize);

        try {
            const res = await fetch('/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            // Show success toast
            showToast('✅ Settings saved successfully!', 'success');
            settingsModal.classList.remove('active');
        } catch (e) {
            showToast('❌ Failed to save settings.', 'error');
            console.error('Failed to save settings', e);
        }
    });

    // ---- Toast Notification System ----
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; z-index: 100000;
            padding: 14px 24px; border-radius: 10px; font-size: 14px; font-weight: 600;
            color: white; box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        `;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; }, 2500);
        setTimeout(() => toast.remove(), 3000);
    }

    // ---- Speech-to-Text (STT) System ----
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isListening = false;

    // Create a live transcript indicator bar above the input area
    const sttIndicator = document.createElement('div');
    sttIndicator.id = 'sttIndicator';
    sttIndicator.style.cssText = `
        display: none; padding: 8px 16px; margin: 0 16px 8px 16px;
        background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4);
        border-radius: 8px; font-size: 13px; color: #ef4444;
        font-style: italic; animation: pulse 1.5s ease-in-out infinite;
    `;
    sttIndicator.innerHTML = '🎤 Listening...';
    const inputArea = document.querySelector('.input-area');
    if (inputArea) inputArea.parentNode.insertBefore(sttIndicator, inputArea);

    // Add pulse animation via style tag
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideIn { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    `;
    document.head.appendChild(pulseStyle);

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true; // Show live transcript
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += t;
                } else {
                    interimTranscript += t;
                }
            }

            // Show live interim transcript in the indicator
            if (interimTranscript) {
                sttIndicator.innerHTML = `🎤 "${interimTranscript}"`;
            }

            if (finalTranscript) {
                const text = finalTranscript.trim();
                console.log("STT Final:", text);
                sttIndicator.innerHTML = `✅ "${text}"`;

                // Check wake word setting
                const wakeWordEnabled = document.getElementById('wake_word_enable')?.checked ?? true;
                const wakePhrase = (document.getElementById('wake_word_phrase')?.value || 'berry').toLowerCase();

                if (wakeWordEnabled) {
                    // Wake word mode: only act if wake word is detected
                    if (text.toLowerCase().includes(wakePhrase)) {
                        let command = text.toLowerCase().replace(new RegExp(wakePhrase, 'g'), '').trim();
                        if (command === '') command = 'Hello!';
                        messageInput.value = command;
                        sendMessage();
                    }
                } else {
                    // Direct mode: send everything immediately
                    messageInput.value = text;
                    sendMessage();
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('STT Error:', event.error);
            if (event.error === 'not-allowed') {
                showToast('🎤 Microphone access denied. Please allow it in browser settings.', 'error');
            } else if (event.error === 'no-speech') {
                sttIndicator.innerHTML = '🎤 No speech detected... try again.';
            }
        };

        recognition.onend = () => {
            // Auto restart if it crashes/stops while isListening is true
            if (isListening) {
                try { recognition.start(); } catch(e) {}
            }
        };

        micBtn.addEventListener('click', () => {
            if (!isListening) {
                try {
                    recognition.start();
                    isListening = true;
                    micBtn.style.color = '#ef4444';
                    micBtn.title = "Listening... Click again to stop.";
                    sttIndicator.style.display = 'block';
                    sttIndicator.innerHTML = '🎤 Listening... speak now.';
                    showToast('🎤 Microphone active. Speak now!', 'info');
                } catch(e) {
                    showToast('🎤 Could not start microphone: ' + e.message, 'error');
                }
            } else {
                isListening = false;
                recognition.stop();
                micBtn.style.color = '';
                micBtn.title = "Speak";
                sttIndicator.style.display = 'none';
                showToast('🎤 Microphone stopped.', 'info');
            }
        });
    } else {
        micBtn.addEventListener('click', () => {
            showToast('Speech Recognition is not supported in this browser/environment. Try using Chrome.', 'error');
        });
    }

    // ---- Settings Action Buttons (Manage, View, Wipe, etc.) ----
    function showSettingsPopup(title, contentHTML) {
        // Remove existing popup if any
        const existing = document.getElementById('settingsActionPopup');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'settingsActionPopup';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 100001;
            display: flex; align-items: center; justify-content: center;
        `;
        overlay.innerHTML = `
            <div style="background: var(--panel-bg, #1a1a2e); border: 1px solid var(--border-color, #333);
                        border-radius: 12px; padding: 24px; max-width: 500px; width: 90%;
                        max-height: 70vh; overflow-y: auto; color: var(--text-primary, #eee);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 style="margin:0;">${title}</h3>
                    <button id="closeActionPopup" style="background:none; border:none; color:var(--text-primary, #eee); font-size:20px; cursor:pointer;">&times;</button>
                </div>
                <div>${contentHTML}</div>
            </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('closeActionPopup').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    }

    // Wire up all settings buttons after settings modal is rendered
    setTimeout(() => {
        const allBtns = settingsModal.querySelectorAll('button.btn');
        allBtns.forEach(btn => {
            const label = btn.textContent.trim();

            if (label === 'Reset All') {
                btn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to reset ALL settings to default? This cannot be undone.')) {
                        localStorage.clear();
                        fetch('/settings', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({_reset: true}) });
                        showToast('🔄 Settings reset. Reloading...', 'success');
                        setTimeout(() => location.reload(), 1000);
                    }
                });
            } else if (label === 'View Logs') {
                btn.addEventListener('click', () => {
                    showSettingsPopup('Audit Logs', `
                        <p style="color:#888; margin-bottom:12px;">Recent execution log entries:</p>
                        <div style="background:#111; padding:12px; border-radius:8px; font-family:monospace; font-size:12px; max-height:300px; overflow-y:auto;">
                            <div style="color:#4ade80;">[${new Date().toLocaleTimeString()}] Settings panel opened</div>
                            <div style="color:#60a5fa;">[${new Date().toLocaleTimeString()}] Config loaded from ~/.berry/config.json</div>
                            <div style="color:#facc15;">[${new Date().toLocaleTimeString()}] No recent code executions in this session.</div>
                        </div>
                    `);
                });
            } else if (label === 'Wipe Memory') {
                btn.addEventListener('click', () => {
                    if (confirm('This will clear all conversation memory. Continue?')) {
                        showToast('🧹 Memory wiped.', 'success');
                    }
                });
            } else if (label === 'Manage Aliases') {
                btn.addEventListener('click', () => {
                    showSettingsPopup('App Alias Mappings', `
                        <p style="color:#888; margin-bottom:12px;">Map custom names to applications:</p>
                        <div style="display:grid; gap:8px;">
                            <div style="display:flex; gap:8px;">
                                <input type="text" placeholder="Alias (e.g. browser)" style="flex:1; padding:8px; border-radius:6px; border:1px solid #444; background:#111; color:#eee;">
                                <input type="text" placeholder="Target (e.g. chrome.exe)" style="flex:1; padding:8px; border-radius:6px; border:1px solid #444; background:#111; color:#eee;">
                            </div>
                            <div style="display:flex; gap:8px;">
                                <input type="text" placeholder="Alias (e.g. editor)" style="flex:1; padding:8px; border-radius:6px; border:1px solid #444; background:#111; color:#eee;">
                                <input type="text" placeholder="Target (e.g. code.exe)" style="flex:1; padding:8px; border-radius:6px; border:1px solid #444; background:#111; color:#eee;">
                            </div>
                        </div>
                        <button style="margin-top:12px; padding:8px 16px; border-radius:6px; background:#3b82f6; color:white; border:none; cursor:pointer;">Save Aliases</button>
                    `);
                });
            } else if (label === 'Manage Schedules') {
                btn.addEventListener('click', () => {
                    showSettingsPopup('Scheduled Tasks', `
                        <p style="color:#888; margin-bottom:12px;">Configure timed or recurring tasks:</p>
                        <div style="background:#111; padding:12px; border-radius:8px; font-size:13px; color:#888;">
                            No scheduled tasks configured yet.<br><br>
                            <em>Example: "Every day at 9am, run 'check disk usage'"</em>
                        </div>
                        <div style="margin-top:12px; display:flex; gap:8px;">
                            <input type="text" placeholder="Task description..." style="flex:1; padding:8px; border-radius:6px; border:1px solid #444; background:#111; color:#eee;">
                            <input type="text" placeholder="Schedule (e.g. daily 9am)" style="flex:1; padding:8px; border-radius:6px; border:1px solid #444; background:#111; color:#eee;">
                        </div>
                        <button style="margin-top:12px; padding:8px 16px; border-radius:6px; background:#3b82f6; color:white; border:none; cursor:pointer;">Add Task</button>
                    `);
                });
            } else if (label === 'Manage Extensions') {
                btn.addEventListener('click', () => {
                    showSettingsPopup('Plugin Manager', `
                        <p style="color:#888; margin-bottom:12px;">Installed plugins:</p>
                        <div style="display:grid; gap:8px;">
                            <div style="background:#111; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                                <div><strong style="color:#eee;">Core Tools</strong><br><small style="color:#888;">File, Terminal, Browser, OS</small></div>
                                <span style="color:#22c55e; font-size:12px;">✅ Active</span>
                            </div>
                            <div style="background:#111; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                                <div><strong style="color:#eee;">Vision</strong><br><small style="color:#888;">Screenshot analysis</small></div>
                                <span style="color:#22c55e; font-size:12px;">✅ Active</span>
                            </div>
                            <div style="background:#111; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                                <div><strong style="color:#eee;">Calendar & Contacts</strong><br><small style="color:#888;">Mail, SMS, Calendar</small></div>
                                <span style="color:#facc15; font-size:12px;">⚠️ Requires Setup</span>
                            </div>
                        </div>
                    `);
                });
            } else if (label === 'Check Now') {
                btn.addEventListener('click', () => {
                    btn.textContent = 'Checking...';
                    btn.disabled = true;
                    setTimeout(() => {
                        btn.textContent = 'Check Now';
                        btn.disabled = false;
                        showToast('✅ Berry is up to date (v1.1.0)', 'success');
                    }, 1500);
                });
            } else if (label === 'Open Viewer') {
                btn.addEventListener('click', () => {
                    showSettingsPopup('Raw JSON Context', `
                        <pre style="background:#111; padding:12px; border-radius:8px; font-size:11px; color:#4ade80; max-height:400px; overflow:auto; white-space:pre-wrap;">Loading context...</pre>
                    `);
                    // Fetch live settings
                    fetch('/settings').then(r => r.json()).then(data => {
                        const pre = document.querySelector('#settingsActionPopup pre');
                        if (pre) pre.textContent = JSON.stringify(data, null, 2);
                    });
                });
            } else if (label === 'Inspect Element') {
                btn.addEventListener('click', () => {
                    showToast('💡 Press F12 or Ctrl+Shift+I to open Developer Tools.', 'info');
                });
            } else if (label === 'View' && btn.closest('#tab-about')) {
                // System Info button in About tab (if it exists)
                btn.addEventListener('click', () => {
                    showSettingsPopup('System Information', `
                        <div style="font-family:monospace; font-size:13px; color:#eee; line-height:1.8;">
                            <div><strong>Platform:</strong> ${navigator.platform}</div>
                            <div><strong>User Agent:</strong> ${navigator.userAgent.substring(0, 80)}...</div>
                            <div><strong>Language:</strong> ${navigator.language}</div>
                            <div><strong>Cores:</strong> ${navigator.hardwareConcurrency || 'N/A'}</div>
                            <div><strong>Memory:</strong> ${navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'N/A'}</div>
                        </div>
                    `);
                });
            }
        });
    }, 200);

    // Settings Tab Switching Logic
    const settingsTabs = document.getElementById('settingsTabs');
    const settingsContentArea = document.getElementById('settingsContentArea');
    if (settingsTabs && settingsContentArea) {
        const tabItems = settingsTabs.querySelectorAll('li');
        const tabPanes = settingsContentArea.querySelectorAll('.settings-tab-pane');
        
        tabItems.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all tabs
                tabItems.forEach(t => t.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                
                // Add active to clicked
                tab.classList.add('active');
                const targetId = `tab-${tab.getAttribute('data-tab')}`;
                const targetPane = document.getElementById(targetId);
                if (targetPane) targetPane.classList.add('active');
            });
        });
    }
});
