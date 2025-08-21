import google.generativeai as genai
import re
from typing import Optional
from tools import ImageSearch, YouTubeSearch, WebSearch
import inspect

class GeminiAgent:
    def __init__(self, api_key: str, system_prompt: str):
    #? tools  
        self.tools = {
                "ImageSearch": ImageSearch.func,
                "YouTubeSearch": YouTubeSearch.func,
                "WebSearch": WebSearch.func
            }
        
        #? 
        self.system_prompt = system_prompt.strip()
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash")


    async def call_tool(self,tool_fn, tool_input):
            if inspect.iscoroutinefunction(tool_fn):
                return await tool_fn(tool_input)
            else:
                return tool_fn(tool_input)


    def extract_tool_call(self, text: str) -> Optional[dict]:
        pattern = r"Action:\s*(\w+)\s*[\r\n]+Action Input:\s*\"(.*?)\""
        match = re.search(pattern, text)
        if match:
            return {
                "tool": match.group(1),
                "input": match.group(2),
                "pre_action_text": text[:match.start()].strip()
            }
        return None

    async def run(self, user_input: str) -> dict:
        # Step 1: Construct full prompt
        full_prompt = f"{self.system_prompt}\n\nUser: {user_input}\nAssistant:"
        response = self.model.generate_content(full_prompt).text.strip()

        tool_call = self.extract_tool_call(response)
        
        if not tool_call:
            return {
                "final": response,
                "tool_used": False
            }

        print("using tools....")
        tool_name = tool_call["tool"]
        tool_input = tool_call["input"]
        pre_action_text = tool_call["pre_action_text"]

        tool_fn = self.tools.get(tool_name)
        if not tool_fn:
            return {
                "error": f"[ERROR] Tool '{tool_name}' not found.",
                "tool_used": True,
                "pre_action_text": pre_action_text
            }

        # Step 2: Run tool
        observation = await self.call_tool(tool_fn, tool_input)

        # Step 3: Feed back to model
        followup_prompt = (
            f"{self.system_prompt}\n\n"
            f"User: {user_input}\n"
            f"Assistant: {response}\n"
            f"Observation: {observation}\n"
            f"Final Answer:"
        )
        final_response = self.model.generate_content(followup_prompt).text.strip()

        return {
            "final": final_response
        }
