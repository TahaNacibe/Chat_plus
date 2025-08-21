import os
import shutil
import json
from typing import Optional
from global_storage import get_app_storage_dir
from utils.image_utils import save_base64_image

def get_profile_path():
    return os.path.join(get_app_storage_dir(), "profile.json")

def get_profile_image_path():
    return os.path.join(get_app_storage_dir(), "profile_image.png")


# Check if the user profile JSON file exists
def check_if_userprofile_exists() -> dict:
    if os.path.exists(get_profile_path()):
        with open(get_profile_path(), 'r') as f:
            profile_data = json.load(f)
        return {"status": "success", "message":profile_data}
    else:
        return {"status": "failed", "message": None}
    
    


# create a user profile json file
def create_userProfile_json(name:str, preferences:str, mode:str,image_path:Optional[str] = None) -> dict:
    # if not os.path.exists(get_profile_path()):
    # create a copy of the image and save it in the profile path
    print("Creating user profile JSON file at:", get_profile_path())
    if image_path is not None:
        save_base64_image(image_path, get_profile_image_path())
    # Create a profile dictionary
    profile_data = {
        "image_path": get_profile_image_path(),
        "username": name,
        "aboutMe": preferences.split("||")[0],
        "additionalInfo": preferences.split("||")[1],
        "responseStyle": mode
    }
    # save the user profile data to a JSON file
    with open(get_profile_path(), 'w') as f:
        json.dump(profile_data, f, indent=4)
    # Return success message with the profile path
    return {"status": "success", "message": profile_data}

    



# edit profile data
def update_userProfile_json(new_data) -> dict:
    if os.path.exists(get_profile_path()):
        image_base64 = new_data.get("profilePicture")
        if image_base64 :
            save_base64_image(image_base64, get_profile_image_path())
            new_data.pop("profilePicture", None)
        # Load the existing profile data
        with open(get_profile_path(), 'r') as f:
            profile_data = json.load(f)
            
        
        for key, value in new_data.items():
            profile_data[key] = value
        
        # Save the updated profile data back to the JSON file
        with open(get_profile_path(), 'w') as f:
            json.dump(profile_data, f, indent=4)
        
        return {"status": "success", "message": profile_data}
    else:
        return {"status": "failed", "message": "User profile does not exist"}
    


# load profile data
def load_userProfile_json() -> dict:
    if os.path.exists(get_profile_path()):
        with open(get_profile_path(), 'r') as f:
            profile_data = json.load(f)
        return {"status": "success", "message": {"data":profile_data}}
    else:
        return {"status": "failed", "message": "User profile does not exist"}