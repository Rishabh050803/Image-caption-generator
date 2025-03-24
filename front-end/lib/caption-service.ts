import { toast } from "sonner";

interface CaptionParams {
  image: string
  model: "basic" | "advanced"
  tone: string
  customPrompt: string
  containHashtags: boolean
  prevCaption: string
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL 


export async function generateBasicCaption(params: CaptionParams): Promise<string> {
  const res = await fetch(params.image);
  const blob = await res.blob();

  const formData = new FormData();
  formData.append("file", blob, "upload.png");

  const response = await fetch(BACKEND_URL+"/api/generate-caption/", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data.caption || "error";
}

export async function generateAdvancedCaption(params: CaptionParams): Promise<string> {
  console.log("Advanced caption params received:", {
    hasPrevCaption: !!params.prevCaption,
    prevCaption: params.prevCaption,
    tone: params.tone,
    customPrompt: params.customPrompt
  });
  
  // Use the provided prevCaption or fallback to generating a basic one
  let captionToRefine = params.prevCaption;
  
  // If no prevCaption is provided or it's an error, generate a basic one
  if (!captionToRefine || captionToRefine === "error") {
    console.log("No valid previous caption found, generating basic caption first");
    try {
      captionToRefine = await generateBasicCaption(params);
      console.log("Generated basic caption:", captionToRefine);
    } catch (err) {
      console.error("Error generating basic caption:", err);
      return "Failed to generate caption. Please try again.";
    }
  } else {
    console.log("Using provided caption for refinement:", captionToRefine);
  }
  
  // Now refine the caption
  console.log("Sending to refine-caption API:", {
    caption: captionToRefine,
    tone: params.tone,
    additional_info: params.customPrompt
  });
  
  try {
    const refineResponse = await fetch(BACKEND_URL+"/api/refine-caption/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caption: captionToRefine,
        tone: params.tone,
        additional_info: params.customPrompt,
      }),
    });
    
    if (!refineResponse.ok) {
      console.error("Refine caption API error:", refineResponse.status);
      return captionToRefine; // Return the basic caption if refinement fails
    }
    
    const refineData = await refineResponse.json();
    console.log("Refined caption response:", refineData);
    
    if (!refineData.refined_caption || refineData.refined_caption.includes("error")) {
      console.warn("No valid refined caption returned");
      return captionToRefine; // Return the basic caption if refinement has errors
    }
    
    return refineData.refined_caption;
  } catch (err) {
    console.error("Error during caption refinement:", err);
    return captionToRefine; // Return the basic caption if refinement fails
  }
}

export async function generateHashtags(caption: string): Promise<string[]> {
  const response = await fetch(BACKEND_URL+"/api/get-hashtags/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caption }),
  });

  const data = await response.json();
  return data.hashtags || [];
}



export async function generateCaption(params: CaptionParams): Promise<string> {
  // For advanced model, we need to ensure basic caption is correctly passed to refinement
  if (params.model === "advanced") {
    console.log("Starting advanced caption generation flow");
    
    try {
      // Step 1: Generate basic caption
      console.log("Step 1: Generating basic caption");
      const res = await fetch(params.image);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append("file", blob, "upload.png");
      
      const basicResponse = await fetch(BACKEND_URL+"/api/generate-caption/", {
        method: "POST",
        body: formData,
      });
      
      const basicData = await basicResponse.json();
      const basicCaption = basicData.caption || "";
      
      console.log("Basic caption directly from API:", basicCaption);
      
      // Check if we got a valid caption
      if (!basicCaption || basicCaption === "error" || basicCaption.includes("error")) {
        console.error("Invalid basic caption received");
        return "Could not generate a caption for this image. Please try another.";
      }
      
      // Step 2: Directly send the basic caption for refinement
      console.log("Step 2: Sending basic caption directly for refinement:", basicCaption);
      
      const refineResponse = await fetch(BACKEND_URL+"/api/refine-caption/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: basicCaption, // Directly use the basic caption from step 1
          tone: params.tone,
          additional_info: params.customPrompt
        }),
      });
      
      // Step 3: Process refinement response
      const refineData = await refineResponse.json();
      console.log("Step 3: Refinement response:", refineData);
      
      let finalCaption = basicCaption; // Default to basic caption
      
      if (refineData.refined_caption && 
          !refineData.refined_caption.includes("error") && 
          !refineData.refined_caption.includes("fail") &&
          !refineData.refined_caption.includes("unable")) {
        finalCaption = refineData.refined_caption;
        console.log("Using refined caption:", finalCaption);
      } else {
        console.warn("Invalid refined caption, using basic caption instead");
      }
      
      // Step 4: Add hashtags if requested
      if (params.containHashtags) {
        try {
          const hashtagResponse = await fetch(BACKEND_URL+"/api/get-hashtags/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ caption: finalCaption }),
          });
          
          const hashtagData = await hashtagResponse.json();
          const hashtags = hashtagData.hashtags || [];
          
          if (hashtags.length > 0) {
            return finalCaption + "\n\n" + hashtags.join(" ");
          }
        } catch (err) {
          console.error("Hashtag generation failed:", err);
        }
      }
      
      return finalCaption;
    } catch (err) {
      console.error("Caption process failed:", err);
      return "Caption generation failed. Please try again.";
    }
  } else {
    // For basic model, just use the original implementation
    const res = await fetch(params.image);
    const blob = await res.blob();
    
    const formData = new FormData();
    formData.append("file", blob, "upload.png");
    
    const response = await fetch(BACKEND_URL+"/api/generate-caption/", {
      method: "POST",
      body: formData,
    });
    
    const data = await response.json();
    let caption = data.caption || "";
    
    if (params.containHashtags) {
      const hashtagResponse = await fetch(BACKEND_URL+"/api/get-hashtags/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption }),
      });
      const hashtagData = await hashtagResponse.json();
      const hashtags = hashtagData.hashtags || [];
      caption += "\n\n" + hashtags.join(" ");
    }
    
    return caption;
  }
}

export async function translateCaption(text: string, targetLanguage: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/translate-caption/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        target_language: targetLanguage,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    // Get the translated text from the response
    let translated = data.translated_text;
    
    // Extra check in case we still have a JSON string
    if (typeof translated === 'string' && translated.startsWith('{') && translated.includes('refined_caption')) {
      try {
        const parsedJson = JSON.parse(translated.replace(/'/g, '"'));
        if (parsedJson.refined_caption) {
          translated = parsedJson.refined_caption;
        }
      } catch (e) {
        console.warn('Failed to parse JSON in translation:', e);
      }
    }
    
    return translated;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}
