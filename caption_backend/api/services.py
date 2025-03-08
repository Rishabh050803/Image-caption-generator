# api/services.py
import os
import json
import requests
import threading
import concurrent.futures
from groq import Groq
from dotenv import load_dotenv


# Get the absolute path of the parent directory
parent_dir = os.path.abspath("/home/rishabh/coding/minor_project/Image-caption-app/")

# Construct the full path to the .env file
dotenv_path = os.path.join(parent_dir, ".env")

# Load the .env file
load_dotenv(dotenv_path=dotenv_path)

# Get the API key
api_key = os.getenv("API_KEY")

# Constants (use environment variables for production)
HF_API_URL = "https://rishabh2234-image-captionator.hf.space/generate_caption/"
# GROQ_API_KEY = api_key
GROQ_API_KEY = "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" 
HF_TIMEOUT = 60  # Timeout for caption generation in seconds
GROQ_TIMEOUT = 25  # Timeout for Groq API calls in seconds


# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

def caption_with_hf_api(image_path: str) -> str:
    headers = {"accept": "application/json"}
    try:
        with open(image_path, "rb") as img_file:
            files = {"file": img_file}
            print("Requesting for generating caption")
            # Add timeout parameter to the request
            response = requests.post(HF_API_URL, headers=headers, files=files, timeout=HF_TIMEOUT)
    except requests.exceptions.Timeout:
        print(f"Caption generation timed out after {HF_TIMEOUT} seconds")
        return f"Caption generation timed out after {HF_TIMEOUT} seconds. Please try again."
    except Exception as e:
        print("Failed to open image:", e)
        return f"Failed to open image: {e}"

    if response.status_code == 200:
        try:
            data = response.json()
            print(f"Generated Caption - {data.get('caption', 'No caption found in response.')}")
            return data.get("caption", "No caption found in response.")
        except Exception as e:
            print("Error parsing response:", e)
            return f"Error parsing response: {e}"
    else:
        return f"Error {response.status_code}: {response.text}"

def call_groq_api_with_timeout(prompt: str) -> dict:
    result = {"error": f"Operation timed out after {GROQ_TIMEOUT} seconds"}
    
    def api_call():
        nonlocal result
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
            try:
                result = json.loads(response_text)
            except json.JSONDecodeError:
                result = {"error": "Invalid JSON response from Groq. Raw response: " + response_text}
        except Exception as e:
            result = {"error": f"API request failed: {str(e)}"}
    
    # Use ThreadPoolExecutor to run the API call with a timeout
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(api_call)
        try:
            future.result(timeout=GROQ_TIMEOUT)
        except concurrent.futures.TimeoutError:
            print(f"Groq API call timed out after {GROQ_TIMEOUT} seconds")
            
    return result

def refine_caption_with_groq(caption: str, tone: str, additional_info: str) -> str:
    prompt = (
        f"Convert this caption into a '{tone}' tone: {caption}. "
        f"Also include this additional information: {additional_info}. "
        f"Make it short, engaging, and a one-liner. "
        f"Return ONLY in JSON format as:\n"
        f'{{"refined_caption": "your refined caption here"}}'
    )
    print("requesting groq for refining caption")
    response = call_groq_api_with_timeout(prompt)
    print(f"Refined Caption - {response.get('refined_caption', response.get('error', 'Unknown error'))}")

    return response.get("refined_caption", response.get("error", "Unknown error"))

def generate_hashtags(caption: str) -> list:
    prompt = (
        f"Generate 5-7 trending hashtags based on this caption: '{caption}'. "
        f"Use only *popular and relevant* hashtags. "
        f"Return ONLY in JSON format as:\n"
        f'{{"hashtags": ["#tag1", "#tag2", "#tag3"]}}'
    )
    print("requesting for hashtags generation")
    response = call_groq_api_with_timeout(prompt)
    print(f"generated hashtags- {response.get('hashtags', [response.get('error', 'Unknown error')])}")
    return response.get("hashtags", [response.get("error", "Unknown error")])
