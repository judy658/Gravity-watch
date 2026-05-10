import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the same directory as this file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# Provider Settings
# Choices: "OLLAMA", "GROQ", "OPENROUTER"
PROVIDER = "OLLAMA" 

# API Keys (Keep these in .env)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# URLs
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
OLLAMA_URL = "http://localhost:11434/api/chat"

# Model Selection
OLLAMA_MODELS = {
    "COORDINATOR": "llama3.1:8b",
    "RESEARCHER": "llama3.1:8b",
    "ARCHITECT": "deepseek-coder-v2:lite",
    "WORKER": "deepseek-coder-v2:lite",
    "INSPECTOR": "deepseek-coder-v2:lite",
}

GROQ_MODELS = {
    "COORDINATOR": "llama-3.1-8b-instant",
    "RESEARCHER": "llama-3.1-8b-instant",
    "ARCHITECT": "llama-3.3-70b-versatile",
    "WORKER": "llama-3.3-70b-versatile",
    "INSPECTOR": "llama-3.3-70b-versatile",
}

OPENROUTER_MODELS = {
    "COORDINATOR": "meta-llama/llama-3.3-70b-instruct:free",
    "RESEARCHER": "meta-llama/llama-3.3-70b-instruct:free",
    "ARCHITECT": "meta-llama/llama-3.3-70b-instruct:free",
    "WORKER": "meta-llama/llama-3.3-70b-instruct:free",
    "INSPECTOR": "meta-llama/llama-3.3-70b-instruct:free",
}

# Final Mapping
if PROVIDER == "OLLAMA":
    MODELS = OLLAMA_MODELS
    FALLBACK_MODEL = "llama3.1:8b"
elif PROVIDER == "GROQ":
    MODELS = GROQ_MODELS
    FALLBACK_MODEL = "llama-3.1-8b-instant"
else:
    MODELS = OPENROUTER_MODELS
    FALLBACK_MODEL = "meta-llama/llama-3.3-70b-instruct:free"

# System Settings
MAX_RETRIES = 3
MEMORY_DIR = "memory"
SANDBOX_DIR = "sandbox"
