import requests
import json
import time
from jarvis_super_swamp.config import (
    OPENROUTER_API_KEY, OPENROUTER_URL, 
    GROQ_API_KEY, GROQ_URL, 
    OLLAMA_URL, PROVIDER, 
    MAX_RETRIES, FALLBACK_MODEL
)

class BaseAgent:
    """
    Base class for all Jarvis Agents.
    Handles communication with OpenRouter.
    """
    
    def __init__(self, name, model, system_prompt):
        self.name = name
        self.model = model
        self.system_prompt = system_prompt
        
        if PROVIDER == "OLLAMA":
            self.api_key = None
            self.base_url = OLLAMA_URL
        elif PROVIDER == "GROQ":
            self.api_key = GROQ_API_KEY
            self.base_url = GROQ_URL
        else:
            self.api_key = OPENROUTER_API_KEY
            self.base_url = OPENROUTER_URL

    def _send_request(self, messages, model_override=None):
        model = model_override or self.model
        url = self.base_url.strip()
        
        # OLLAMA HANDLING
        if PROVIDER == "OLLAMA":
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": self.system_prompt}
                ] + messages,
                "stream": False
            }
            try:
                response = requests.post(url, json=payload, timeout=120)
                response.raise_for_status()
                data = response.json()
                return data['message']['content']
            except Exception as e:
                print(f"[{self.name}] Ollama Hatası: {e}")
                return f"Error: Local Ollama failed."

        # CLOUD (GROQ/OPENROUTER) HANDLING
        if not self.api_key:
            return "Hata: API anahtarı bulunamadı! Lütfen .env dosyasını kontrol et."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/antigravity-jarvis",
            "X-Title": "Jarvis Super Swamp 2.0"
        }
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": self.system_prompt}
            ] + messages,
            "max_tokens": 4096, # High limit for complex code
            "temperature": 0.2  # More consistent output
        }
        
        for attempt in range(MAX_RETRIES):
            try:
                response = requests.post(url, headers=headers, json=payload, timeout=60)
                
                # Handle Rate Limiting (429) - More aggressive backoff
                if response.status_code == 429:
                    wait_time = (attempt + 1) * 15 # Wait 15, 30, 45, 60, 75 seconds
                    print(f"[{self.name}] Groq Trafik Sınırı (429). {wait_time} saniye bekleniyor...")
                    time.sleep(wait_time)
                    continue

                if response.status_code != 200:
                    print(f"[{self.name}] HTTP {response.status_code}: {response.text}")
                response.raise_for_status()
                data = response.json()
                return data['choices'][0]['message']['content']
            except Exception as e:
                print(f"[{self.name}] Error on attempt {attempt + 1}: {e}")
                if attempt == MAX_RETRIES - 1:
                    # CROSS-PROVIDER FALLBACK
                    if PROVIDER == "GROQ" and OPENROUTER_API_KEY:
                        print(f"[{self.name}] Groq limit bitti veya hata verdi. OpenRouter'a geçiliyor...")
                        # Temporarily swap provider for this request
                        self.api_key = OPENROUTER_API_KEY
                        self.base_url = OPENROUTER_URL
                        return self._send_request(messages, model_override=FALLBACK_MODEL)
                    
                    if model != FALLBACK_MODEL:
                        print(f"[{self.name}] Falling back to {FALLBACK_MODEL}...")
                        return self._send_request(messages, model_override=FALLBACK_MODEL)
                    return f"Error: Unable to get response from {model}."
                time.sleep(2)
        return "Error: Maximum retries reached."

    def ask(self, prompt):
        messages = [{"role": "user", "content": prompt}]
        return self._send_request(messages)
