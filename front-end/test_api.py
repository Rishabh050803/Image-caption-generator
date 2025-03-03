import requests
import json
from groq import Groq
import os

# Constants
HF_API_URL = "https://rishabh2234-image-captionator.hf.space/generate_caption/"
GROQ_API_KEY = "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"   # Replace with your actual API key

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

def caption_with_hf_api(image_path: str) -> str:
    """
    Sends an image to the Hugging Face hosted API and returns the generated caption.
    """
    headers = {"accept": "application/json"}
    
    try:
        with open(image_path, "rb") as img_file:
            files = {"file": img_file}
            response = requests.post(HF_API_URL, headers=headers, files=files)
    except Exception as e:
        return f"Failed to open image: {e}"

    if response.status_code == 200:
        try:
            data = response.json()
            return data.get("caption", "No caption found in response.")
        except Exception as e:
            return f"Error parsing response: {e}"
    else:
        return f"Error {response.status_code}: {response.text}"

def call_groq_api(prompt: str) -> dict:
    """
    Sends a prompt to Groq API and ensures the response is valid JSON.
    """
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_completion_tokens=100,
            top_p=1,
            stream=False,
            stop=None,
        )

        response_text = completion.choices[0].message.content.strip()

        # Ensure the response is valid JSON
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {"error": "Invalid JSON response from Groq. Raw response: " + response_text}

    except Exception as e:
        return {"error": f"API request failed: {str(e)}"}

def refine_caption_with_groq(caption: str, tone: str, additional_info: str) -> str:
    """
    Refines the image caption using Groq API with a specific tone and additional context.
    """
    prompt = (
        f"Convert this caption into a '{tone}' tone: {caption}. "
        f"Also include this additional information: {additional_info}. "
        f"Make it short, engaging, and a one-liner. "
        f"Return ONLY in JSON format as:\n"
        f'{{"refined_caption": "your refined caption here"}}'
    )

    response = call_groq_api(prompt)
    return response.get("refined_caption", response.get("error", "Unknown error"))

def generate_hashtags(caption: str) -> list:
    """
    Generates relevant hashtags based on the caption.
    """
    prompt = (
        f"Generate 5-7 trending hashtags based on this caption: '{caption}'. "
        f"Use only *popular and relevant* hashtags. "
        f"Return ONLY in JSON format as:\n"
        f'{{"hashtags": ["#tag1", "#tag2", "#tag3"]}}'
    )

    response = call_groq_api(prompt)
    return response.get("hashtags", [response.get("error", "Unknown error")])

if __name__ == "__main__":
    # User inputs
    image_path = "/home/rishabh/Downloads/20250119_124247.jpg"
    if not os.path.exists(image_path):
        print("Image not found.")
        exit()
    tone = "poetic"  # Example: "formal", "funny", "dramatic"
    additional_info = ""

    # Step 1: Get initial caption from HF API
    initial_caption = caption_with_hf_api(image_path)
    print("Initial Caption:", initial_caption)

    # Step 2: Refine caption using Groq API (JSON output)
    refined_caption = refine_caption_with_groq(initial_caption, tone, additional_info)
    print("\nRefined Caption:", refined_caption)

    # Step 3: Generate hashtags based on the refined caption (JSON output)
    hashtags = generate_hashtags(refined_caption)
    print("\nHashtags:", hashtags)