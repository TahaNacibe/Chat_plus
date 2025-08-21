APP_STORAGE_DIR = None  # Global variable

def set_app_storage_dir(path: str):
    global APP_STORAGE_DIR
    APP_STORAGE_DIR = path

def get_app_storage_dir() -> str:
    if APP_STORAGE_DIR is None:
        raise RuntimeError("Storage path not initialized")
    return APP_STORAGE_DIR
