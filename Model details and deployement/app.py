import io
from fastapi import FastAPI, File, UploadFile
from PIL import Image
import torchvision.transforms as transforms
import torch
from model import load_model

app = FastAPI()

# Set device and use a writable checkpoint path (e.g., /tmp)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
checkpoint_path = "/tmp/checkpoint.pth"  # Updated path

# Load the model and tokenizer
model, tokenizer = load_model(checkpoint_path, device)

# Define image preprocessing (same as in your test file)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Image Captioning API!"}

@app.post("/generate_caption/")
async def generate_caption(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_tensor = transform(image).unsqueeze(0).to(device)
        output_ids = model.generate(pixel_values=image_tensor, max_length=30, num_beams=4)
        caption = tokenizer.decode(output_ids[0], skip_special_tokens=True)
        return {"caption": caption}
    except Exception as e:
        return {"error": str(e)}
