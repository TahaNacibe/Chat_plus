import requests
import re
import os
from typing import Optional, Dict, List, Any
from tools import ImageSearch, YouTubeSearch, WebSearch
import inspect
import json

# Import different model backends
try:
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
    HF_AVAILABLE = True
except ImportError:
    HF_AVAILABLE = False

try:
    from llama_cpp import Llama
    LLAMACPP_AVAILABLE = True
except ImportError:
    LLAMACPP_AVAILABLE = False

class LocalModelAgent:
    def __init__(self, config: dict, system_prompt: str = ""):
        """
        Initialize local model agent
        
        config should contain:
        {
            # For local file models
            "model_path": "/path/to/model.gguf",     # Local model file path
            "model_type": "gguf",                    # "gguf", "huggingface", "pytorch"
            
            # OR for API-based local servers
            "endpoint": "http://localhost:11434/api/generate",  # For Ollama/other APIs
            "model": "llama2",                       # Model name for API
            "api_type": "ollama",                    # "ollama", "llamacpp", "textgen", "custom"
            
            # Common settings
            "max_tokens": 2048,
            "temperature": 0.7,
            "context_length": 4096,
            "gpu_layers": 0,                         # For GGUF models
            "headers": {},                           # Custom headers for API
            "auth": {}                              # Authentication for API
        }
        """
        self.config = config
        self.system_prompt = system_prompt.strip()
        
        # Model configuration
        self.model_path = config.get("model_path")
        self.model_type = config.get("model_type", "gguf")
        self.endpoint = config.get("endpoint")
        self.model_name = config.get("model")
        self.api_type = config.get("api_type", "ollama")
        
        # Generation settings
        self.max_tokens = config.get("max_tokens", 2048)
        self.temperature = config.get("temperature", 0.7)
        self.context_length = config.get("context_length", 4096)
        self.gpu_layers = config.get("gpu_layers", 0)
        
        # API settings
        self.headers = config.get("headers", {"Content-Type": "application/json"})
        self.auth = config.get("auth", {})
        
        # Tools configuration
        self.tools = {
            "ImageSearch": ImageSearch.func,
            "YouTubeSearch": YouTubeSearch.func,
            "WebSearch": WebSearch.func
        }
        
        # Initialize the appropriate model backend
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self._initialize_model()

    def _initialize_model(self):
        """Initialize the appropriate model backend based on configuration"""
        
        # If model_path is provided, load local model
        if self.model_path and os.path.exists(self.model_path):
            if self.model_type == "gguf":
                self._load_gguf_model()
            elif self.model_type == "huggingface":
                self._load_huggingface_model()
            elif self.model_type == "pytorch":
                self._load_pytorch_model()
            else:
                raise ValueError(f"Unsupported model type: {self.model_type}")
        
        # If endpoint is provided, use API mode
        elif self.endpoint:
            print(f"Using API mode with endpoint: {self.endpoint}")
            # API mode doesn't need model initialization
        
        else:
            raise ValueError("Either model_path or endpoint must be provided")
    
    def _load_gguf_model(self):
        """Load GGUF model using llama-cpp-python"""
        if not LLAMACPP_AVAILABLE:
            raise ImportError("llama-cpp-python not installed. Install with: pip install llama-cpp-python")
        
        try:
            self.model = Llama(
                model_path=self.model_path,
                n_ctx=self.context_length,
                n_gpu_layers=self.gpu_layers,
                verbose=False
            )
            print(f"Loaded GGUF model from: {self.model_path}")
        except Exception as e:
            raise Exception(f"Failed to load GGUF model: {str(e)}")
    
    def _load_huggingface_model(self):
        """Load HuggingFace model"""
        if not HF_AVAILABLE:
            raise ImportError("transformers not installed. Install with: pip install transformers torch")
        
        try:
            # model_path should be a HuggingFace model name or local directory
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            self.model = AutoModelForCausalLM.from_pretrained(self.model_path)
            
            # Create pipeline for easier text generation
            self.pipeline = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                max_new_tokens=self.max_tokens,
                temperature=self.temperature,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            print(f"Loaded HuggingFace model from: {self.model_path}")
        except Exception as e:
            raise Exception(f"Failed to load HuggingFace model: {str(e)}")
    
    def _load_pytorch_model(self):
        """Load custom PyTorch model (placeholder for custom implementations)"""
        # This would be for custom model loading logic
        raise NotImplementedError("PyTorch model loading not implemented yet")

    async def call_tool(self, tool_fn, tool_input: str):
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

    def build_prompt(self, user_input: str, chat_history: List[Dict] = None) -> str:
        """Build full prompt for local model"""
        prompt_parts = []
        
        if self.system_prompt:
            prompt_parts.append(f"System: {self.system_prompt}")
        
        # Add chat history
        if chat_history:
            for msg in chat_history[-8:]:  # Last 8 messages
                role = msg.get("role", "unknown")
                content = msg.get("content", "")
                if role == "user":
                    prompt_parts.append(f"User: {content}")
                elif role == "assistant":
                    prompt_parts.append(f"Assistant: {content}")
        
        prompt_parts.append(f"User: {user_input}")
        prompt_parts.append("Assistant:")
        
        return "\n\n".join(prompt_parts)

    def call_ollama_api(self, prompt: str) -> str:
        """Call Ollama API"""
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": self.temperature,
                "num_predict": self.max_tokens
            }
        }
        
        response = requests.post(
            self.endpoint,
            json=payload,
            headers=self.headers,
            timeout=300  # 5 minute timeout
        )
        response.raise_for_status()
        
        result = response.json()
        return result.get("response", "")

    def call_llamacpp_api(self, prompt: str) -> str:
        """Call llama.cpp server API"""
        payload = {
            "prompt": prompt,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "stop": ["User:", "\nUser:", "Human:", "\nHuman:"]
        }
        
        response = requests.post(
            self.endpoint,
            json=payload,
            headers=self.headers,
            timeout=300
        )
        response.raise_for_status()
        
        result = response.json()
        return result.get("content", "")

    def call_textgen_api(self, prompt: str) -> str:
        """Call text-generation-webui API"""
        payload = {
            "prompt": prompt,
            "max_new_tokens": self.max_tokens,
            "temperature": self.temperature,
            "do_sample": True,
            "stop_sequence": ["User:", "\nUser:", "Human:", "\nHuman:"]
        }
        
        response = requests.post(
            f"{self.endpoint}/api/v1/generate",
            json=payload,
            headers=self.headers,
            timeout=300
        )
        response.raise_for_status()
        
        result = response.json()
        return result.get("results", [{}])[0].get("text", "")

    def call_custom_api(self, prompt: str) -> str:
        """Call custom API endpoint"""
        payload = {
            "prompt": prompt,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature
        }
        
        # Add any custom authentication
        headers = self.headers.copy()
        if self.auth:
            if "bearer" in self.auth:
                headers["Authorization"] = f"Bearer {self.auth['bearer']}"
            elif "api_key" in self.auth:
                headers["X-API-Key"] = self.auth["api_key"]
        
        response = requests.post(
            self.endpoint,
            json=payload,
            headers=headers,
            timeout=300
        )
        response.raise_for_status()
        
        result = response.json()
        # Try common response field names
        return result.get("response") or result.get("text") or result.get("output") or ""

    def generate_response_local(self, prompt: str) -> str:
        """Generate response using local model"""
        try:
            if self.model_type == "gguf" and self.model:
                # Use llama-cpp-python
                output = self.model(
                    prompt,
                    max_tokens=self.max_tokens,
                    temperature=self.temperature,
                    stop=["User:", "\nUser:", "Human:", "\nHuman:"],
                    echo=False
                )
                return output["choices"][0]["text"].strip()
            
            elif self.model_type == "huggingface" and self.pipeline:
                # Use HuggingFace pipeline
                outputs = self.pipeline(
                    prompt,
                    max_new_tokens=self.max_tokens,
                    temperature=self.temperature,
                    return_full_text=False,
                    stop_sequence=["User:", "\nUser:", "Human:", "\nHuman:"]
                )
                return outputs[0]["generated_text"].strip()
            
            else:
                raise Exception("No local model loaded")
                
        except Exception as e:
            raise Exception(f"Local model generation failed: {str(e)}")

    def generate_response(self, prompt: str) -> str:
        """Generate response using appropriate method (local or API)"""
        
        # If we have a local model loaded, use it
        if self.model:
            return self.generate_response_local(prompt)
        
        # Otherwise, use API
        try:
            if self.api_type == "ollama":
                return self.call_ollama_api(prompt)
            elif self.api_type == "llamacpp":
                return self.call_llamacpp_api(prompt)
            elif self.api_type == "textgen":
                return self.call_textgen_api(prompt)
            elif self.api_type == "custom":
                return self.call_custom_api(prompt)
            else:
                raise ValueError(f"Unsupported API type: {self.api_type}")
        except Exception as e:
            raise Exception(f"API call failed: {str(e)}")

    async def run(self, user_input: str, chat_history: List[Dict] = None) -> dict:
        """Main execution method for local model"""
        
        try:
            # Step 1: Build prompt and get initial response
            prompt = self.build_prompt(user_input, chat_history)
            response_text = self.generate_response(prompt).strip()

            # Check for tool calls
            tool_call = self.extract_tool_call(response_text)
            
            if not tool_call:
                return {
                    "final": response_text,
                    "tool_used": False,
                    "method": "direct_response",
                    "model": self.model_path or self.model_name or "unknown",
                    "backend": "local_file" if self.model else "api"
                }

            print(f"Using {self.model} local model tool calling...")
            tool_name = tool_call["tool"]
            tool_input = tool_call["input"]
            pre_action_text = tool_call["pre_action_text"]

            tool_fn = self.tools.get(tool_name)
            if not tool_fn:
                return {
                    "error": f"[ERROR] Tool '{tool_name}' not found.",
                    "tool_used": True,
                    "pre_action_text": pre_action_text,
                    "method": "tool_error",
                    "model": self.model_path or self.model_name or "unknown",
                    "backend": "local_file" if self.model else "api"
                }

            # Step 2: Execute tool
            observation = await self.call_tool(tool_fn, tool_input)

            # Step 3: Build follow-up prompt with observation
            followup_prompt = f"{prompt.rstrip()}\n{response_text}\nObservation: {observation}\nFinal Answer:"
            final_text = self.generate_response(followup_prompt).strip()

            return {
                "final": final_text,
                "tool_used": True,
                "method": "tool_calling",
                "pre_action_text": pre_action_text,
                "tool_name": tool_name,
                "observation": observation,
                "model": self.model_path or self.model_name or "unknown",
                "backend": "local_file" if self.model else "api"
            }

        except Exception as e:
            return {
                "error": f"Local model error: {str(e)}",
                "tool_used": False,
                "method": "error",
                "model": self.model_path or self.model_name or "unknown",
                "backend": "local_file" if self.model else "api"
            }


# Example usage configurations:
EXAMPLE_CONFIGS = {
    # Local GGUF model (recommended for most users)
    "local_gguf": {
        "model_path": "/path/to/models/llama-2-7b-chat.Q4_K_M.gguf",
        "model_type": "gguf",
        "max_tokens": 2048,
        "temperature": 0.7,
        "context_length": 4096,
        "gpu_layers": 20  # Number of layers to offload to GPU (0 for CPU only)
    },
    
    # Local HuggingFace model
    "local_huggingface": {
        "model_path": "/path/to/models/llama-2-7b-chat-hf",  # or "microsoft/DialoGPT-medium"
        "model_type": "huggingface",
        "max_tokens": 2048,
        "temperature": 0.7
    },
    
    # Ollama API (for when you have Ollama running locally)
    "ollama_api": {
        "endpoint": "http://localhost:11434/api/generate",
        "model": "llama2",  # or "mistral", "codellama", "neural-chat", etc.
        "api_type": "ollama",
        "max_tokens": 2048,
        "temperature": 0.7
    },
    
    # llama.cpp server API
    "llamacpp_server": {
        "endpoint": "http://localhost:8080/completion",
        "model": "local_model",
        "api_type": "llamacpp", 
        "max_tokens": 2048,
        "temperature": 0.7
    },
    
    # text-generation-webui API
    "textgen_webui": {
        "endpoint": "http://localhost:5000",
        "model": "local_model",
        "api_type": "textgen",
        "max_tokens": 2048,
        "temperature": 0.7
    },
    
    # Custom API endpoint
    "custom_api": {
        "endpoint": "http://your-custom-endpoint.com/generate",
        "model": "custom_model",
        "api_type": "custom",
        "max_tokens": 2048,
        "temperature": 0.7,
        "headers": {"Content-Type": "application/json"},
        "auth": {"api_key": "your_api_key"}  # or {"bearer": "your_token"}
    }
}

# Installation commands for dependencies:
INSTALLATION_COMMANDS = {
    "gguf": "pip install llama-cpp-python",
    "huggingface": "pip install transformers torch",
    "pytorch": "pip install torch torchvision torchaudio"
}