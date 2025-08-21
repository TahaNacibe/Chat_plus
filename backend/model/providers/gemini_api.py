import google.generativeai as genai
import re
from typing import Optional, Dict, List
from tools import ImageSearch, YouTubeSearch, WebSearch
import inspect

class GeminiAgent:
    def __init__(self, api_key: str, model: str = "gemini-2.0-flash", system_prompt: str = ""):
        # Tools configuration
        self.tools = {
            "ImageSearch": ImageSearch.func,
            "YouTubeSearch": YouTubeSearch.func,
            "WebSearch": WebSearch.func
        }
        
        self.system_prompt = system_prompt.strip()
        genai.configure(api_key=api_key)
        self.model_name = model
        self.model = genai.GenerativeModel(model)

    async def call_tool(self, tool_fn, tool_input):
        """Execute tool function with proper async handling"""
        if inspect.iscoroutinefunction(tool_fn):
            return await tool_fn(tool_input)
        else:
            return tool_fn(tool_input)

    def extract_tool_call(self, text: str) -> Optional[dict]:
        """Extract tool call from response text"""
        pattern = r"Action:\s*(\w+)\s*[\r\n]+Action Input:\s*\"(.*?)\""
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return {
                "tool": match.group(1),
                "input": match.group(2),
                "pre_action_text": text[:match.start()].strip()
            }
        return None

    def build_chat_history(self, chat_history: List[Dict] = None) -> str:
        """Convert chat history to text format for Gemini"""
        if not chat_history:
            return ""
        
        history_text = "\n\nPrevious conversation:\n"
        for msg in chat_history[-8:]:  # Last 8 messages for context
            role = msg.get("role", "unknown")
            content = msg.get("content", "")
            if role == "user":
                history_text += f"User: {content}\n"
            elif role == "assistant":
                history_text += f"Assistant: {content}\n"
        
        return history_text

    async def run(self, user_input: str, chat_history: List[Dict] = None) -> dict:
        """Main execution method for Gemini"""
        
        try:
            # Build conversation context
            history_context = self.build_chat_history(chat_history)
            
            # Step 1: Construct full prompt
            full_prompt = f"{self.system_prompt}{history_context}\n\nUser: {user_input}\nAssistant:"
            
            response = self.model.generate_content(full_prompt)
            response_text = response.text.strip()

            # Check for tool calls
            tool_call = self.extract_tool_call(response_text)
            
            if not tool_call:
                return {
                    "final": response_text,
                    "tool_used": False,
                    "method": "direct_response"
                }

            print("Using Gemini tool calling...")
            tool_name = tool_call["tool"]
            tool_input = tool_call["input"]
            pre_action_text = tool_call["pre_action_text"]

            tool_fn = self.tools.get(tool_name)
            if not tool_fn:
                return {
                    "error": f"[ERROR] Tool '{tool_name}' not found.",
                    "tool_used": True,
                    "pre_action_text": pre_action_text,
                    "method": "tool_error"
                }

            # Step 2: Execute tool
            observation = await self.call_tool(tool_fn, tool_input)

            # Step 3: Feed back to model with observation
            followup_prompt = (
                f"{self.system_prompt}{history_context}\n\n"
                f"User: {user_input}\n"
                f"Assistant: {response_text}\n"
                f"Observation: {observation}\n"
                f"Assistant (Final Answer):"
            )
            
            final_response = self.model.generate_content(followup_prompt)
            final_text = final_response.text.strip()

            return {
                "final": final_text,
                "tool_used": True,
                "method": "tool_calling",
                "pre_action_text": pre_action_text,
                "tool_name": tool_name,
                "observation": observation
            }

        except Exception as e:
            return {
                "error": f"Gemini API error: {str(e)}",
                "tool_used": False,
                "method": "error"
            }