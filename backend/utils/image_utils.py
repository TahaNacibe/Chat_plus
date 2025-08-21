import base64
import re

def save_base64_image(base64_string: str, output_path: str):
    print("Saving base64 image to:", output_path)
    # Remove header (e.g., 'data:image/png;base64,') if it exists
    header_pattern = re.compile(r"^data:image\/[a-zA-Z]+;base64,")
    if header_pattern.match(base64_string):
        base64_string = header_pattern.sub("", base64_string)
        
    print("Base64 string length:", len(base64_string))
    # Decode base64 and write to file
    image_data = base64.b64decode(base64_string)
    with open(output_path, "wb") as f:
        f.write(image_data)


def load_base64_image(path: str) -> str:
    with open(path, "rb") as f:
        image_data = f.read()
    # Encode image data to base64
    base64_string = base64.b64encode(image_data).decode('utf-8')
    # Add header for data URI
    return f"data:image/png;base64,{base64_string}"