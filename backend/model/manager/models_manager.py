import os
import json
import requests
import subprocess
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import shutil

class ModelManager:
    """
    Utility class for downloading, managing, and configuring local models
    """
    
    def __init__(self, models_directory: str = "./models"):
        self.models_dir = Path(models_directory)
        self.models_dir.mkdir(exist_ok=True)
        
        # Popular model repositories
        self.gguf_models = {
            "llama-2-7b-chat": "TheBloke/Llama-2-7B-Chat-GGUF",
            "llama-2-13b-chat": "TheBloke/Llama-2-13B-Chat-GGUF", 
            "mistral-7b-instruct": "TheBloke/Mistral-7B-Instruct-v0.1-GGUF",
            "codellama-7b-instruct": "TheBloke/CodeLlama-7B-Instruct-GGUF",
            "neural-chat-7b": "TheBloke/neural-chat-7B-v3-1-GGUF",
            "openchat-7b": "TheBloke/openchat-3.5-1210-GGUF"
        }
        
        self.huggingface_models = {
            "llama-2-7b-chat": "meta-llama/Llama-2-7b-chat-hf",
            "mistral-7b-instruct": "mistralai/Mistral-7B-Instruct-v0.1",
            "codellama-7b-instruct": "codellama/CodeLlama-7b-Instruct-hf",
            "neural-chat-7b": "Intel/neural-chat-7b-v3-1",
            "openchat-7b": "openchat/openchat-3.5-1210"
        }
        
        self.ollama_models = {
            "llama2": "llama2",
            "llama2:13b": "llama2:13b", 
            "mistral": "mistral",
            "codellama": "codellama",
            "neural-chat": "neural-chat",
            "openchat": "openchat"
        }

    def get_available_models(self) -> Dict[str, List[str]]:
        """Get list of available models for each type"""
        return {
            "gguf": list(self.gguf_models.keys()),
            "huggingface": list(self.huggingface_models.keys()),
            "ollama": list(self.ollama_models.keys())
        }

    def get_installed_models(self) -> List[Dict[str, str]]:
        """Get list of locally installed models"""
        installed = []
        
        for model_path in self.models_dir.iterdir():
            if model_path.is_dir():
                # HuggingFace model directory
                config_path = model_path / "config.json"
                if config_path.exists():
                    try:
                        with open(config_path) as f:
                            config = json.load(f)
                        installed.append({
                            "name": model_path.name,
                            "path": str(model_path),
                            "type": "huggingface",
                            "architecture": config.get("architectures", ["unknown"])[0],
                            "size": self._get_directory_size(model_path)
                        })
                    except:
                        pass
            
            elif model_path.suffix == ".gguf":
                # GGUF model file
                installed.append({
                    "name": model_path.stem,
                    "path": str(model_path),
                    "type": "gguf", 
                    "size": self._get_file_size(model_path)
                })
        
        return installed

    def _get_file_size(self, file_path: Path) -> str:
        """Get human readable file size"""
        size = file_path.stat().st_size
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} PB"

    def _get_directory_size(self, dir_path: Path) -> str:
        """Get human readable directory size"""
        total_size = sum(f.stat().st_size for f in dir_path.rglob('*') if f.is_file())
        size = total_size
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} PB"

    def download_gguf_model(self, model_name: str, quantization: str = "Q4_K_M") -> Tuple[bool, str]:
        """
        Download GGUF model from HuggingFace
        
        Args:
            model_name: Model name from gguf_models
            quantization: Quantization level (Q4_K_M, Q5_K_M, Q8_0, etc.)
        
        Returns:
            (success: bool, message: str)
        """
        if model_name not in self.gguf_models:
            return False, f"Model {model_name} not found in available GGUF models"
        
        repo_id = self.gguf_models[model_name]
        filename = f"{model_name.replace('-', '_')}.{quantization}.gguf"
        
        try:
            # Use huggingface_hub to download
            from huggingface_hub import hf_hub_download
            
            model_path = hf_hub_download(
                repo_id=repo_id,
                filename=filename,
                local_dir=self.models_dir,
                local_dir_use_symlinks=False
            )
            
            return True, f"Successfully downloaded {filename} to {model_path}"
            
        except ImportError:
            return False, "huggingface_hub not installed. Run: pip install huggingface_hub"
        except Exception as e:
            return False, f"Failed to download {filename}: {str(e)}"

    def download_huggingface_model(self, model_name: str) -> Tuple[bool, str]:
        """
        Download HuggingFace model
        
        Args:
            model_name: Model name from huggingface_models
        
        Returns:
            (success: bool, message: str)
        """
        if model_name not in self.huggingface_models:
            return False, f"Model {model_name} not found in available HuggingFace models"
        
        repo_id = self.huggingface_models[model_name]
        model_dir = self.models_dir / model_name
        
        try:
            from transformers import AutoTokenizer, AutoModelForCausalLM
            
            # Download tokenizer and model
            tokenizer = AutoTokenizer.from_pretrained(repo_id)
            model = AutoModelForCausalLM.from_pretrained(repo_id)
            
            # Save locally
            tokenizer.save_pretrained(model_dir)
            model.save_pretrained(model_dir)
            
            return True, f"Successfully downloaded {model_name} to {model_dir}"
            
        except ImportError:
            return False, "transformers not installed. Run: pip install transformers torch"
        except Exception as e:
            return False, f"Failed to download {model_name}: {str(e)}"

    def install_ollama_model(self, model_name: str) -> Tuple[bool, str]:
        """
        Install model using Ollama
        
        Args:
            model_name: Model name from ollama_models
        
        Returns:
            (success: bool, message: str)
        """
        if model_name not in self.ollama_models:
            return False, f"Model {model_name} not found in available Ollama models"
        
        ollama_model = self.ollama_models[model_name]
        
        try:
            # Check if Ollama is installed
            result = subprocess.run(["ollama", "version"], capture_output=True, text=True)
            if result.returncode != 0:
                return False, "Ollama not installed. Install from https://ollama.ai"
            
            # Pull the model
            result = subprocess.run(
                ["ollama", "pull", ollama_model],
                capture_output=True,
                text=True,
                timeout=1800  # 30 minute timeout
            )
            
            if result.returncode == 0:
                return True, f"Successfully installed {ollama_model} via Ollama"
            else:
                return False, f"Failed to install {ollama_model}: {result.stderr}"
                
        except subprocess.TimeoutExpired:
            return False, f"Timeout while downloading {ollama_model}"
        except FileNotFoundError:
            return False, "Ollama command not found. Install from https://ollama.ai"
        except Exception as e:
            return False, f"Error installing {ollama_model}: {str(e)}"

    def get_model_recommendations(self) -> Dict[str, Dict[str, str]]:
        """Get model recommendations based on use case"""
        return {
            "beginners": {
                "name": "llama-2-7b-chat",
                "type": "gguf",
                "reason": "Good balance of performance and resource usage",
                "quantization": "Q4_K_M"
            },
            "coding": {
                "name": "codellama-7b-instruct", 
                "type": "gguf",
                "reason": "Specialized for code generation and understanding",
                "quantization": "Q4_K_M"
            },
            "conversation": {
                "name": "openchat-7b",
                "type": "gguf", 
                "reason": "Excellent conversational abilities",
                "quantization": "Q4_K_M"
            },
            "performance": {
                "name": "mistral-7b-instruct",
                "type": "gguf",
                "reason": "Fast and efficient with good quality",
                "quantization": "Q5_K_M"
            }
        }

    def validate_model_path(self, model_path: str, model_type: str) -> Tuple[bool, str]:
        """
        Validate if model path is valid and compatible
        
        Args:
            model_path: Path to model file/directory
            model_type: Type of model (gguf, huggingface, pytorch)
        
        Returns:
            (is_valid: bool, message: str)
        """
        path = Path(model_path)
        
        if not path.exists():
            return False, f"Path does not exist: {model_path}"
        
        if model_type == "gguf":
            if not path.is_file() or path.suffix != ".gguf":
                return False, "GGUF model must be a .gguf file"
            return True, "Valid GGUF model file"
        
        elif model_type == "huggingface":
            if not path.is_dir():
                return False, "HuggingFace model must be a directory"
            
            required_files = ["config.json"]
            for file in required_files:
                if not (path / file).exists():
                    return False, f"Missing required file: {file}"
            
            return True, "Valid HuggingFace model directory"
        
        elif model_type == "pytorch":
            # Add validation for PyTorch models as needed
            return True, "PyTorch model validation not implemented"
        
        else:
            return False, f"Unknown model type: {model_type}"

    def get_model_config(self, model_path: str) -> Optional[Dict]:
        """Get model configuration from file"""
        path = Path(model_path)
        
        if path.is_dir():
            config_path = path / "config.json"
            if config_path.exists():
                try:
                    with open(config_path) as f:
                        return json.load(f)
                except:
                    pass
        
        return None

# Installation commands and setup guides
SETUP_GUIDES = {
    "gguf": {
        "install": "pip install llama-cpp-python",
        "gpu_install": "CMAKE_ARGS='-DLLAMA_CUBLAS=on' pip install llama-cpp-python --force-reinstall --no-cache-dir",
        "description": "GGUF models are quantized and optimized for efficient local inference"
    },
    
    "huggingface": {
        "install": "pip install transformers torch",
        "gpu_install": "pip install transformers torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121",
        "description": "HuggingFace models provide full precision but require more resources"
    },
    
    "ollama": {
        "install": "Download from https://ollama.ai",
        "description": "Ollama provides easy model management with API access"
    }
}