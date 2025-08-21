import re

def extract_tool_call(text: str):
    tool_pattern = r"Action:\s*(\w+)\s*[\r\n]+Action Input:\s*\"(.*?)\""
    match = re.search(tool_pattern, text)
    if match:
        tool_name = match.group(1)
        tool_input = match.group(2)
        return {"tool": tool_name, "input": tool_input}
    return None
