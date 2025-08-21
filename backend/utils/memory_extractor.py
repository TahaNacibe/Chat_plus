import re
import json

def extract_memory(text: str):
    # Match both `[BLOCK {...}]` and `[BLOCK:{...}]`
    pattern = r'\[BLOCK[:\s]*\{[^}]*"type"\s*:\s*"memory"[^}]*\}\]\s*(\{[\s\S]*?\})\s*\[/BLOCK\]'
    match = re.search(pattern, text, re.IGNORECASE)

    memory_item = None
    if match:
        try:
            memory_item = json.loads(match.group(1))
        except json.JSONDecodeError:
            pass  # Could log here if needed
        text = re.sub(pattern, '', text, flags=re.IGNORECASE).strip()

    return {
        "message_item": text,
        "memory_item": memory_item
    }
