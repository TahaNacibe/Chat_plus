from typing import Dict, List, Optional, Any

from model.api_called import GeminiAgent
from model.providers.local_model import LocalModelAgent
from model.providers.open_ai import OpenAIAgent


class UnifiedAIEngine:
    """
    Unified engine manager that handles OpenAI, Gemini, and Local models
    Priority: OpenAI > Gemini > Local
    """
    
    def __init__(self, settings: dict, system_prompt: str = ""):
        """
        Initialize with settings from SettingsData
        
        settings format (from SettingsData):
        {
            "openaiApiKey": "sk-...",
            "openaiApiModel": "gpt-4",
            "geminiApiKey": "AIza...", 
            "geminiApiModel": "gemini-2.0-flash",
            "selectedModel": "openai|gemini|local",
            "modelPath": "/path/to/local/model",
            "modelType": "gguf|huggingface|pytorch",
            "modelEndPoint": "http://localhost:11434/api/generate",
            "modelName": "llama2",
            "apiType": "ollama|llamacpp|textgen|custom",
            "maxTokens": 2048,
            "temperature": 0.7,
            "contextLength": 4096,
            "gpuLayers": 0
        }
        """
        self.settings = settings
        self.system_prompt = system_prompt
        self.active_agent = None
        self.provider = None
        
        # Determine provider based on priority and selectedModel
        self._initialize_agent()
    
    def _initialize_agent(self):
        """Initialize the appropriate agent based on available configuration"""
        
        selected_model = self.settings.get("selectedModel", "")
        
        # If user explicitly selected a model type, try that first
        if selected_model == "openai" and self.settings.get("openaiApiKey"):
            self._init_openai()
        elif selected_model == "gemini" and self.settings.get("geminiApiKey"):
            self._init_gemini()
        elif selected_model == "local":
            self._init_local()
        else:
            # Fall back to priority order: OpenAI > Gemini > Local
            if self.settings.get("openaiApiKey"):
                self._init_openai()
            elif self.settings.get("geminiApiKey"):
                self._init_gemini()
            elif self.settings.get("modelPath") or self.settings.get("modelEndPoint"):
                self._init_local()
            else:
                raise ValueError("No valid AI configuration provided. Configure at least one provider.")
    
    def _init_openai(self):
        """Initialize OpenAI agent"""
        try:
            self.active_agent = OpenAIAgent(
                api_key=self.settings["openaiApiKey"],
                model=self.settings.get("openaiApiModel", "gpt-4"),
                system_prompt=self.system_prompt
            )
            self.provider = "openai"
            print(f"Initialized OpenAI agent with model: {self.settings.get('openaiApiModel', 'gpt-4')}")
        except Exception as e:
            print(f"Failed to initialize OpenAI: {e}")
            raise
    
    def _init_gemini(self):
        """Initialize Gemini agent"""
        try:
            self.active_agent = GeminiAgent(
                api_key=self.settings["geminiApiKey"],
                model=self.settings.get("geminiApiModel", "gemini-2.0-flash"),
                system_prompt=self.system_prompt
            )
            self.provider = "gemini"
            print(f"Initialized Gemini agent with model: {self.settings.get('geminiApiModel', 'gemini-2.0-flash')}")
        except Exception as e:
            print(f"Failed to initialize Gemini: {e}")
            raise
    
    def _init_local(self):
        """Initialize Local model agent"""
        try:
            # Convert settings to local config format
            local_config = {
                "modelPath": self.settings.get("modelPath", ""),
                "modelType": self.settings.get("modelType", "gguf"),
                "modelEndPoint": self.settings.get("modelEndPoint", ""),
                "modelName": self.settings.get("modelName", ""),
                "apiType": self.settings.get("apiType", "ollama"),
                "maxTokens": self.settings.get("maxTokens", 2048),
                "temperature": self.settings.get("temperature", 0.7),
                "contextLength": self.settings.get("contextLength", 4096),
                "gpuLayers": self.settings.get("gpuLayers", 0)
            }
            
            self.active_agent = LocalModelAgent(
                config=local_config,
                system_prompt=self.system_prompt
            )
            self.provider = "local"
            
            model_name = local_config.get("modelPath") or local_config.get("modelName") or "unknown"
            print(f"Initialized Local agent with model: {model_name}")
        except Exception as e:
            print(f"Failed to initialize Local model: {e}")
            raise
    
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
                result["model"] = self.settings.get("openaiApiModel", "gpt-4")
            elif self.provider == "gemini":
                result["model"] = self.settings.get("geminiApiModel", "gemini-2.0-flash")
            elif self.provider == "local":
                result["model"] = (
                    self.settings.get("modelPath") or 
                    self.settings.get("modelName") or 
                    "unknown"
                )
            
            return result
            
        except Exception as e:
            return {
                "error": f"Generation failed: {str(e)}",
                "tool_used": False,
                "provider": self.provider,
                "method": "error"
            }
    
    def switch_provider(self, provider: str) -> bool:
        """
        Switch to a different provider
        
        Args:
            provider: "openai", "gemini", or "local"
        
        Returns:
            bool: Success status
        """
        try:
            if provider == "openai" and self.settings.get("openaiApiKey"):
                self._init_openai()
                return True
            elif provider == "gemini" and self.settings.get("geminiApiKey"):
                self._init_gemini()
                return True
            elif provider == "local":
                self._init_local()
                return True
            else:
                return False
        except Exception:
            return False
    
    def get_current_config(self) -> dict:
        """Get current configuration info"""
        return {
            "provider": self.provider,
            "model": self.get_current_model(),
            "available_providers": self.get_available_providers()
        }
    
    def get_current_model(self) -> str:
        """Get current model name"""
        if self.provider == "openai":
            return self.settings.get("openaiApiModel", "gpt-4")
        elif self.provider == "gemini":
            return self.settings.get("geminiApiModel", "gemini-2.0-flash")
        elif self.provider == "local":
            return (
                self.settings.get("modelPath") or 
                self.settings.get("modelName") or 
                "unknown"
            )
        return "none"
    
    def get_available_providers(self) -> List[str]:
        """Get list of available providers based on configuration"""
        providers = []
        
        if self.settings.get("openaiApiKey"):
            providers.append("openai")
        if self.settings.get("geminiApiKey"):
            providers.append("gemini")
        if self.settings.get("modelPath") or self.settings.get("modelEndPoint"):
            providers.append("local")
        
        return providers
    
    def update_settings(self, new_settings: dict) -> bool:
        """Update settings and reinitialize if needed"""
        try:
            self.settings.update(new_settings)
            self._initialize_agent()
            return True
        except Exception as e:
            print(f"Failed to update settings: {e}")
            return False


# Factory function to create AI engine from settings
def create_ai_engine(settings_data: dict, system_prompt: str = "") -> UnifiedAIEngine:
    """
    Factory function to create AI engine from settings
    
    Args:
        settings_data: Dictionary containing all settings from SettingsData
        system_prompt: System prompt for the AI
    
    Returns:
        UnifiedAIEngine instance
    """
    return UnifiedAIEngine(settings_data, system_prompt)