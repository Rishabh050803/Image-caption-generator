import torch
from PIL import Image
import torchvision.transforms as transforms
from model import load_model  # Import the load_model function from your model.py

# Set device (GPU if available)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Specify the checkpoint path (local path where the checkpoint will be downloaded)
checkpoint_path = "checkpoint.pth"

# Load the model and tokenizer using the helper function
model, tokenizer = load_model(checkpoint_path, device)

# Define the image transformation (should match what was used during training)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

# Specify the path to an example image (update this to a valid image file path on your system)
image_path = "/home/rishabh/coding/minor_project/for deployment/image-captionator/GJwtW4JGdR4.jpg"
# Open and preprocess the image
image = Image.open(image_path).convert("RGB")
image_tensor = transform(image).unsqueeze(0).to(device)

# Use the model's generate function to produce a caption
output_ids = model.generate(pixel_values=image_tensor, max_length=30, num_beams=4)
caption = tokenizer.decode(output_ids[0], skip_special_tokens=True)

# Print the generated caption
print("Generated Caption:", caption)
