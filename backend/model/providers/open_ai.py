import openai
import re
from typing import Optional, Dict, List
from tools import ImageSearch, YouTubeSearch, WebSearch
import inspect
import json

class OpenAIAgent:
    def __init__(self, api_key: str, model: str = "gpt-4", system_prompt: str = ""):
        self.client = openai.OpenAI(api_key=api_key)
        self.model = model
        self.system_prompt = system_prompt.strip()
        
        # Tools configuration
        self.tools = {
            "ImageSearch": ImageSearch.func,
            "YouTubeSearch": YouTubeSearch.func,
            "WebSearch": WebSearch.func
        }
        
        # OpenAI function definitions for tool calling
        self.function_definitions = [
            {
                "type": "function",
                "function": {
                    "name": "ImageSearch",
                    "description": "Search for images based on a query",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query for images"
                            }
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function", 
                "function": {
                    "name": "YouTubeSearch",
                    "description": "Search for YouTube videos based on a query",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query for YouTube videos"
                            }
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "WebSearch",
                    "description": "Perform a web search based on a query",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string", 
                                "description": "Search query for web search"
                            }
                        },
                        "required": ["query"]
                    }
                }
            }
        ]

    async def call_tool(self, tool_fn, tool_input: str):
        """Execute tool function with proper async handling"""
        if inspect.iscoroutinefunction(tool_fn):
            return await tool_fn(tool_input)
        else:
            return tool_fn(tool_input)

    def extract_tool_call_legacy(self, text: str) -> Optional[dict]:
        """Legacy tool calling format for fallback"""
        pattern = r"Action:\s*(\w+)\s*[\r\n]+Action Input:\s*\"(.*?)\""
        match = re.search(pattern, text)
        if match:
            return {
                "tool": match.group(1),
                "input": match.group(2),
                "pre_action_text": text[:match.start()].strip()
            }
        return None

    async def run(self, user_input: str, chat_history: List[Dict] = None) -> dict:
        """Main execution method with both native and legacy tool calling support"""
        
        # Prepare messages
        messages = []
        
        if self.system_prompt:
            messages.append({"role": "system", "content": self.system_prompt})
        
        # Add chat history if provided
        if chat_history:
            messages.extend(chat_history[-10:])  # Last 10 messages for context
        
        messages.append({"role": "user", "content": user_input})

        try:
            # Try with native function calling first
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=self.function_definitions,
                tool_choice="auto",
                temperature=0.7
            )

            message = response.choices[0].message

            # Check if model wants to call functions
            if message.tool_calls:
                print("Using OpenAI native tool calling...")
                
                # Add assistant message to conversation
                messages.append(message)
                
                # Process each tool call
                for tool_call in message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)
                    
                    if function_name in self.tools:
                        tool_fn = self.tools[function_name]
                        query = function_args.get("query", "")
                        
                        # Execute tool
                        observation = await self.call_tool(tool_fn, query)
                        
                        # Add tool result to messages
                        messages.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": str(observation)
                        })

                # Get final response with tool results
                final_response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.7
                )
                
                return {
                    "final": final_response.choices[0].message.content,
                    "tool_used": True,
                    "method": "native_function_calling"
                }

            else:
                # Check for legacy tool format
                content = message.content
                tool_call = self.extract_tool_call_legacy(content)
                
                if tool_call:
                    print("Using legacy tool calling format...")
                    
                    tool_name = tool_call["tool"]
                    tool_input = tool_call["input"]
                    pre_action_text = tool_call["pre_action_text"]

                    tool_fn = self.tools.get(tool_name)
                    if not tool_fn:
                        return {
                            "error": f"[ERROR] Tool '{tool_name}' not found.",
                            "tool_used": True,
                            "pre_action_text": pre_action_text,
                            "method": "legacy_error"
                        }

                    # Execute tool
                    observation = await self.call_tool(tool_fn, tool_input)

                    # Add tool execution to messages and get final response
                    messages.append({"role": "assistant", "content": content})
                    messages.append({"role": "user", "content": f"Observation: {observation}\n\nFinal Answer:"})
                    
                    final_response = self.client.chat.completions.create(
                        model=self.model,
                        messages=messages,
                        temperature=0.7
                    )

                    return {
                        "final": final_response.choices[0].message.content,
                        "tool_used": True,
                        "method": "legacy_tool_calling"
                    }
                
                # No tool calling needed
                return {
                    "final": content,
                    "tool_used": False,
                    "method": "direct_response"
                }

        except Exception as e:
            return {
                "error": f"OpenAI API error: {str(e)}",
                "tool_used": False,
                "method": "error"
            }