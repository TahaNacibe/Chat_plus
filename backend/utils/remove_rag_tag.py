import re

def remove_specific_block(text: str) -> str:
    # Define the exact block header to match
    block_header = r'\[BLOCK\s*\{type:RAGItem,\s*lang:null\}\]'
    block_footer = r'\[/BLOCK\]'
    
    # Pattern to match the full block with that exact header
    pattern = rf'{block_header}.*?{block_footer}'
    
    # Remove matching blocks
    cleaned = re.sub(pattern, '', text, flags=re.DOTALL)
    
    return cleaned.strip()
