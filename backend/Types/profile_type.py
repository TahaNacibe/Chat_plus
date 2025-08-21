from pydantic import BaseModel
from typing import Optional


class ProfileData(BaseModel):
    image_path: str
    name: str
    preferences: str
    mode: str
    
    
class EditProfileData(BaseModel):
    image_path: Optional[str] = None
    name: Optional[str] = None
    preferences: Optional[str] = None
    mode: Optional[str] = None

