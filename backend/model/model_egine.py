from typing import Dict, List
from model.api_called import GeminiAgent
from model.providers.local_model import LocalModelAgent
from model.providers.open_ai import OpenAIAgent


class UnifiedAIEngine:
    """
    Unified engine manager that handles OpenAI, Gemini, and Local models
    Priority: OpenAI > Gemini > Local
    """
    
    def __init__(self, ai_config: dict, system_prompt: str = ""):
        """
        Initialize with AI configuration
        
        ai_config format:
        {
            "openai_api_key": "sk-...",           # Optional
            "openai_model": "gpt-4",              # Optional, defaults to gpt-4
            "gemini_api_key": "AIza...",          # Optional
            "gemini_model": "gemini-2.0-flash",   # Optional, defaults to gemini-2.0-flash
            "local_config": {                     # Optional, for local models
                "endpoint": "http://localhost:11434/api/generate",
                "model": "llama2",
                "api_type": "ollama",
                "max_tokens": 2048,
                "temperature": 0.7
            }
        }
        """
        self.ai_config = ai_config
        self.system_prompt = system_prompt
        self.active_agent = None
        self.provider = None
        
        # Determine provider based on priority
        self._initialize_agent()
    
    def _initialize_agent(self):
        """Initialize the appropriate agent based on available configuration"""
        
        # Priority 1: OpenAI (if API key provided)
        if self.ai_config.get("openai_api_key"):
            try:
                self.active_agent = OpenAIAgent(
                    api_key=self.ai_config["openai_api_key"],
                    model=self.ai_config.get("openai_model", "gpt-4"),
                    system_prompt=self.system_prompt
                )
                self.provider = "openai"
                print(f"Initialized OpenAI agent with model: {self.ai_config.get('openai_model', 'gpt-4')}")
                return
            except Exception as e:
                print(f"Failed to initialize OpenAI: {e}")
        
        # Priority 2: Gemini (if API key provided)
        if self.ai_config.get("gemini_api_key"):
            try:
                self.active_agent = GeminiAgent(
                    api_key=self.ai_config["gemini_api_key"],
                    model=self.ai_config.get("gemini_model", "gemini-2.0-flash"),
                    system_prompt=self.system_prompt
                )
                self.provider = "gemini"
                print(f"Initialized Gemini agent with model: {self.ai_config.get('gemini_model', 'gemini-2.0-flash')}")
                return
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")
        
        # Priority 3: Local model (if configuration provided)
        if self.ai_config.get("local_config"):
            try:
                self.active_agent = LocalModelAgent(
                    config=self.ai_config["local_config"],
                    system_prompt=self.system_prompt
                )
                self.provider = "local"
                model_name = self.ai_config["local_config"].get("model", "unknown")
                print(f"Initialized Local agent with model: {model_name}")
                return
            except Exception as e:
                print(f"Failed to initialize Local model: {e}")
        
        # No valid configuration found
        raise ValueError("No valid AI configuration provided. Need at least one of: openai_api_key, gemini_api_key, or local_config")
    
    async def generate_response(self, user_input: str, chat_history: List[Dict] = None) -> dict:
        """
        Generate response using the active agent
        
        Returns:
        {
            "final": "response text",
            "tool_used": bool,
            "method": "response_method",
            "provider": "openai|gemini|local",
            "model": "model_name",
            "error": "error_message" (if any)
        }
        """
        if not self.active_agent:
            return {
                "error": "No active AI agent available",
                "tool_used": False,
                "provider": None,
                "method": "error"
            }
        
        try:
            result = await self.active_agent.run(user_input, chat_history)
            
            # Add provider and model info to result
            result["provider"] = self.provider
            
            if self.provider == "openai":
                result["model"] = self.ai_config.get
        except:
            print("something went wrong!")