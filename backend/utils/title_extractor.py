import re

def extract_title_block(text: str) -> str | None:
    pattern = r'\[BLOCK:\{"type":\s*"title",\s*"lang":\s*"eng"\}\]\s*([\s\S]*?)\s*\[/BLOCK\]'
    match = re.search(pattern, text)
    return match.group(1).strip() if match else None
