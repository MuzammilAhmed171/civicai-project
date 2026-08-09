"""Text preprocessing module for AI models."""
import re

def preprocess_text(text: str) -> str:
    if not text or not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'[^a-zA-Z0-9\s.,!?]', '', text)
    return text
