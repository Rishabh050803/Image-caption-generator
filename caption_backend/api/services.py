# api/services.py
import os
import json
import requests
import threading
import concurrent.futures
from groq import Groq
from dotenv import load_dotenv


# # Get the absolute path of the parent directory
# parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# # Construct the full path to the .env file
# dotenv_path = os.path.join(parent_dir, ".env")

# # Load the .env file
# load_dotenv(dotenv_path=dotenv_path)

# Get the API key
# api_key = os.getenv("API_KEY")
api_key = "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"

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
                # Try to parse as JSON first
                result = json.loads(response_text)
            except json.JSONDecodeError:
                # If not valid JSON, check if it's a plain text response
                if "refined_caption" not in response_text.lower():
                    # If not a proper response format, create a manual JSON object
                    result = {"refined_caption": response_text}
                else:
                    # It might contain the refined caption text but not in proper JSON
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
    # Stricter validation for caption input
    if not caption or caption.strip() == "" or caption.lower() == "error" or "failed" in caption.lower() or caption.lower().startswith("caption"):
        print(f"Invalid caption detected: '{caption}'")
        return "Unable to refine caption. Please try again with a different image."
    
    # Ensure tone and additional info are valid
    tone = tone if tone and tone.strip() else "casual"
    additional_info = additional_info if additional_info and additional_info.strip() else "Make it engaging"
    
    print(f"Refining valid caption: '{caption}' with tone: '{tone}'")
    
    # Updated prompt for medium-length captions (20-50 words)
    prompt = (
        f"You are a social media caption expert. Take this basic image caption: '{caption}' "
        f"and transform it into a {tone} tone caption. "
        f"Consider this additional context: {additional_info}. "
        f"Create an engaging caption that is between 20-50 words long - perfect for social media. "
        f"The caption should be descriptive and detailed while maintaining an engaging style. "
        f"Return ONLY in this JSON format without explanation:\n"
        f'{{"refined_caption": "YOUR_CAPTION_HERE"}}'
    )
    
    try:
        response = call_groq_api_with_timeout(prompt)
        
        # Debug the raw response
        print(f"Raw API response: {response}")
        
        # Check for error
        if "error" in response:
            error_msg = response.get("error")
            print(f"Error refining caption: {error_msg}")
            # Return the original caption rather than error message
            return caption
        
        refined = response.get("refined_caption")
        if not refined or "error" in refined.lower() or "fail" in refined.lower():
            print(f"Invalid refined caption detected: '{refined}', using original")
            return caption
            
        # Check word count to ensure it's in the desired range
        word_count = len(refined.split())
        print(f"Refined caption word count: {word_count}")
        
        if word_count < 15 or word_count > 60:  # Using wider bounds for validation to be safe
            print(f"Caption length outside desired range ({word_count} words), using original")
            return caption
        
        print(f"Successfully refined caption: '{refined}'")
        return refined
    except Exception as e:
        print(f"Exception during refinement: {str(e)}")
        return caption

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
