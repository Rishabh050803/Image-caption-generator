import os

os.environ["HF_HUB_DOWNLOAD_TIMEOUT"] = "120"  # Increase timeout to 120 seconds
# Set the cache directory to /tmp/cache, which is usually writable in most environments
os.environ["TRANSFORMERS_CACHE"] = "/tmp/cache"
os.makedirs("/tmp/cache", exist_ok=True)

import torch
import torch.nn as nn
from transformers import ViTModel, T5ForConditionalGeneration, T5Tokenizer
from transformers.modeling_outputs import BaseModelOutput
import requests



class ViTT5(nn.Module):
    def __init__(self, vit_encoder, t5_decoder):
        super(ViTT5, self).__init__()
        self.vit_encoder = vit_encoder
        self.t5_decoder = t5_decoder
        # Project ViT's hidden size (768) to T5's d_model (512 for t5-small)
        self.projection = nn.Linear(vit_encoder.config.hidden_size, t5_decoder.config.d_model)
        
    def forward(self, pixel_values, labels=None):
        # Extract ViT encoder outputs
        vit_outputs = self.vit_encoder(pixel_values=pixel_values)
        vit_hidden_states = vit_outputs.last_hidden_state
        
        # Project to T5's dimension
        encoder_hidden_states = self.projection(vit_hidden_states)
        
        # Pass to T5 decoder
        outputs = self.t5_decoder(
            encoder_outputs=(encoder_hidden_states,),  # T5 expects a tuple
            labels=labels
        )
        return outputs
    
    def generate(self, pixel_values, **kwargs):
        # Extract ViT encoder outputs
        vit_outputs = self.vit_encoder(pixel_values=pixel_values)
        vit_hidden_states = vit_outputs.last_hidden_state
        
        # Project to T5's dimension
        encoder_hidden_states = self.projection(vit_hidden_states)
        
        # Wrap the hidden states in a BaseModelOutput which has a last_hidden_state attribute
        encoder_outputs = BaseModelOutput(last_hidden_state=encoder_hidden_states)
        
        # Generate captions using T5's decoder
        return self.t5_decoder.generate(
            encoder_outputs=encoder_outputs,
            no_repeat_ngram_size=2,  # Prevents repeating phrases
            repetition_penalty=1.2,  # Penalizes repeated words
            temperature=0.9,         # More diverse outputs
            **kwargs
        )
def download_checkpoint(checkpoint_path):
    """
    Downloads the checkpoint from Hugging Face Model Hub if not found locally.
    """
    model_url = "https://huggingface.co/Rishabh2234/image-caption-generator/resolve/main/checkpoint.pth"
    print("Checkpoint not found locally. Downloading from Hugging Face Model Hub...")
    response = requests.get(model_url, stream=True)
    if response.status_code == 200:
        with open(checkpoint_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print("Download complete!")
    else:
        raise RuntimeError(f"Error downloading model, status code: {response.status_code}")


def load_model(checkpoint_path, device):
    """
    Loads the ViTT5 model along with the T5 tokenizer.
    Downloads the checkpoint from Hugging Face Hub if not available locally.
    """
    # Load pre-trained vision encoder and T5 decoder
    encoder = ViTModel.from_pretrained("google/vit-base-patch16-224-in21k")
    decoder = T5ForConditionalGeneration.from_pretrained("t5-small")
    
    # Initialize the combined model
    model = ViTT5(encoder, decoder).to(device)
    
    # Load the tokenizer
    tokenizer = T5Tokenizer.from_pretrained("t5-small")
    
    # Configure decoder settings
    model.t5_decoder.config.decoder_start_token_id = tokenizer.pad_token_id
    model.t5_decoder.config.eos_token_id = tokenizer.eos_token_id
    model.t5_decoder.config.pad_token_id = tokenizer.pad_token_id
    model.t5_decoder.config.max_length = 40
    model.t5_decoder.config.num_beams = 6
    model.t5_decoder.config.repetition_penalty = 1.2
    model.t5_decoder.config.no_repeat_ngram_size = 2
    model.t5_decoder.config.temperature = 0.9
    model.to(device)
    
    # Check if checkpoint exists; if not, download it
    if not os.path.exists(checkpoint_path):
        download_checkpoint(checkpoint_path)
    
    # Load checkpoint if available
    if os.path.exists(checkpoint_path):
        checkpoint = torch.load(checkpoint_path, map_location=device)
        # Use strict=False to allow minor key mismatches (if any)
        missing_keys, unexpected_keys = model.load_state_dict(checkpoint['model_state_dict'], strict=False)
        print("Checkpoint loaded from", checkpoint_path)
        if missing_keys:
            print("Missing keys:", missing_keys)
        if unexpected_keys:
            print("Unexpected keys:", unexpected_keys)
    else:
        print("No checkpoint found even after download. Using base pre-trained model.")
    
    return model, tokenizer

# For deployment, when running this file directly:
if __name__ == "__main__":
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    checkpoint_path = "checkpoint.pth"  # Save in the current directory
    model, tokenizer = load_model(checkpoint_path, device)
    print("Model and tokenizer loaded successfully!")
