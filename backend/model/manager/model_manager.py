from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import httpx
import asyncio
import os
import aiofiles
from pathlib import Path
from typing import List, Optional, Dict, Any
import json
from urllib.parse import urlparse
import logging
import shutil

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for request/response
class ModelDownloadRequest(BaseModel):
    modelId: str
    modelType: Optional[str] = "gguf"

class HuggingFaceModel(BaseModel):
    id: str
    name: str
    description: Optional[str]
    author: str
    downloads: int
    likes: int
    tags: List[str]
    size: Optional[str] = None
    lastModified: Optional[str] = None

class DownloadResponse(BaseModel):
    success: bool
    message: str
    modelPath: Optional[str] = None
    modelName: Optional[str] = None


class ModelManager:
    """Model management class handling downloads and local model operations"""
    
    def __init__(self, models_dir: str = "./models"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(exist_ok=True)
        
        # Popular model mappings (HuggingFace model IDs to download URLs)
        self.popular_models = {
            "llama-2-7b-chat-gguf": {
                "name": "Llama 2 7B Chat",
                "repo": "TheBloke/Llama-2-7b-Chat-GGUF",
                "filename": "llama-2-7b-chat.Q4_K_M.gguf",
                "size": "4.1GB"
            },
            "mistral-7b-instruct-gguf": {
                "name": "Mistral 7B Instruct", 
                "repo": "TheBloke/Mistral-7B-Instruct-v0.1-GGUF",
                "filename": "mistral-7b-instruct-v0.1.Q4_K_M.gguf",
                "size": "4.4GB"
            },
            "codellama-7b-instruct-gguf": {
                "name": "Code Llama 7B Instruct",
                "repo": "TheBloke/CodeLlama-7B-Instruct-GGUF", 
                "filename": "codellama-7b-instruct.Q4_K_M.gguf",
                "size": "4.2GB"
            },
            "neural-chat-7b-gguf": {
                "name": "Neural Chat 7B",
                "repo": "TheBloke/neural-chat-7B-v3-1-GGUF",
                "filename": "neural-chat-7b-v3-1.Q4_K_M.gguf", 
                "size": "4.1GB"
            },
            "openchat-3.5-7b-gguf": {
                "name": "OpenChat 3.5 7B",
                "repo": "TheBloke/openchat_3.5-GGUF",
                "filename": "openchat_3.5.Q4_K_M.gguf",
                "size": "4.3GB"
            },
            "phi-2-gguf": {
                "name": "Phi-2",
                "repo": "TheBloke/phi-2-GGUF", 
                "filename": "phi-2.Q4_K_M.gguf",
                "size": "1.8GB"
            }
        }

    async def download_file_with_progress(self, url: str, filepath: Path, chunk_size: int = 8192) -> bool:
        """Download a file with progress tracking"""
        try:
            async with httpx.AsyncClient(timeout=300.0) as client:
                async with client.stream("GET", url) as response:
                    response.raise_for_status()
                    
                    total_size = int(response.headers.get("content-length", 0))
                    downloaded = 0
                    
                    async with aiofiles.open(filepath, "wb") as f:
                        async for chunk in response.aiter_bytes(chunk_size):
                            await f.write(chunk)
                            downloaded += len(chunk)
                            
                            # Log progress every 100MB
                            if downloaded % (100 * 1024 * 1024) == 0:
                                progress = (downloaded / total_size * 100) if total_size > 0 else 0
                                logger.info(f"Download progress: {progress:.1f}%")
                    
                    logger.info(f"Download completed: {filepath}")
                    return True
                    
        except Exception as e:
            logger.error(f"Download failed: {str(e)}")
            # Clean up partial download
            if filepath.exists():
                filepath.unlink()
            return False

    async def get_huggingface_models(
        self, 
        search: Optional[str] = None,
        task: Optional[str] = "text-generation", 
        limit: int = 20,
        sort: str = "downloads"
    ) -> List[HuggingFaceModel]:
        """Get list of models from HuggingFace Hub"""
        try:
            params = {
                "limit": limit,
                "sort": sort,
                "direction": -1,
                "filter": task
            }
            
            if search:
                params["search"] = search
                
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    "https://huggingface.co/api/models",
                    params=params
                )
                response.raise_for_status()
                
                models_data = response.json()
                models = []
                
                for model in models_data:
                    # Filter for GGUF models or other local-friendly formats
                    tags = model.get("tags", [])
                    if any(tag in tags for tag in ["gguf", "quantized", "ggml"]):
                        hf_model = HuggingFaceModel(
                            id=model.get("id", ""),
                            name=model.get("id", "").split("/")[-1],
                            description=model.get("description", "")[:200] + "..." if model.get("description", "") else "",
                            author=model.get("id", "").split("/")[0] if "/" in model.get("id", "") else "",
                            downloads=model.get("downloads", 0),
                            likes=model.get("likes", 0),
                            tags=tags,
                            lastModified=model.get("lastModified", "")
                        )
                        models.append(hf_model)
                
                return models[:limit]
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching HuggingFace models: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch models: {str(e)}")
        except Exception as e:
            logger.error(f"Error fetching HuggingFace models: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    async def download_local_model(self, model_id: str) -> DownloadResponse:
        """Download a popular local model"""
        try:
            model_info = self.popular_models.get(model_id)
            if not model_info:
                return DownloadResponse(
                    success=False,
                    message=f"Model {model_id} not found in popular models list"
                )
            
            # Construct HuggingFace download URL
            repo = model_info["repo"]
            filename = model_info["filename"]
            download_url = f"https://huggingface.co/{repo}/resolve/main/{filename}"
            
            # Create model-specific directory
            model_dir = self.models_dir / model_id
            model_dir.mkdir(exist_ok=True)
            
            model_path = model_dir / filename
            
            # Check if already downloaded
            if model_path.exists():
                return DownloadResponse(
                    success=True,
                    message=f"Model {model_info['name']} already exists",
                    modelPath=str(model_path),
                    modelName=model_info["name"]
                )
            
            # Start download
            success = await self.download_file_with_progress(download_url, model_path)
            
            if success:
                return DownloadResponse(
                    success=True,
                    message=f"Successfully downloaded {model_info['name']}",
                    modelPath=str(model_path),
                    modelName=model_info["name"]
                )
            else:
                return DownloadResponse(
                    success=False,
                    message=f"Failed to download {model_info['name']}"
                )
                
        except Exception as e:
            logger.error(f"Error downloading model: {str(e)}")
            return DownloadResponse(
                success=False,
                message=f"Download error: {str(e)}"
            )

    async def download_huggingface_model(self, model_id: str) -> DownloadResponse:
        """Download a model from HuggingFace (for GGUF files)"""
        try:
            # This is a simplified version - you'd need to implement
            # proper HuggingFace Hub integration for arbitrary models
            
            # For GGUF models, we typically need to find the .gguf file in the repo
            # This would require additional API calls to list repo files
            
            # For now, return a placeholder response
            return DownloadResponse(
                success=False,
                message="HuggingFace arbitrary model download not yet implemented. Use popular models instead."
            )
            
        except Exception as e:
            logger.error(f"Error downloading HuggingFace model: {str(e)}")
            return DownloadResponse(
                success=False,
                message=f"Download error: {str(e)}"
            )

    async def list_local_models(self) -> Dict[str, Any]:
        """List locally downloaded models"""
        try:
            local_models = []
            
            if self.models_dir.exists():
                for model_dir in self.models_dir.iterdir():
                    if model_dir.is_dir():
                        # Find .gguf files in the directory
                        gguf_files = list(model_dir.glob("*.gguf"))
                        if gguf_files:
                            for gguf_file in gguf_files:
                                size_mb = gguf_file.stat().st_size / (1024 * 1024)
                                local_models.append({
                                    "id": model_dir.name,
                                    "name": gguf_file.name,
                                    "path": str(gguf_file),
                                    "size": f"{size_mb:.1f}MB",
                                    "type": "gguf"
                                })
            
            return {"models": local_models}
            
        except Exception as e:
            logger.error(f"Error listing local models: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to list local models: {str(e)}")

    async def delete_local_model(self, model_id: str) -> Dict[str, Any]:
        """Delete a locally downloaded model"""
        try:
            model_dir = self.models_dir / model_id
            
            if not model_dir.exists():
                raise HTTPException(status_code=404, detail="Model not found")
            
            # Remove the entire model directory
            shutil.rmtree(model_dir)
            
            return {"success": True, "message": f"Model {model_id} deleted successfully"}
            
        except Exception as e:
            logger.error(f"Error deleting model: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to delete model: {str(e)}")

    async def get_popular_models(self) -> Dict[str, Any]:
        """Get list of popular models available for download"""
        try:
            models = []
            for model_id, info in self.popular_models.items():
                model_path = self.models_dir / model_id / info["filename"]
                models.append({
                    "id": model_id,
                    "name": info["name"],
                    "size": info["size"],
                    "downloaded": model_path.exists(),
                    "path": str(model_path) if model_path.exists() else None
                })
            
            return {"models": models}
            
        except Exception as e:
            logger.error(f"Error getting popular models: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to get popular models: {str(e)}")

    def get_health_status(self) -> Dict[str, Any]:
        """Get health status"""
        return {"status": "healthy", "models_dir": str(self.models_dir)}

