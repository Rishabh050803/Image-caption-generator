interface CaptionParams {
  image: string
  model: "basic" | "advanced"
  tone: string
  customPrompt: string
  containHashtags: boolean
  prevCaption: string
}


export async function generateBasicCaption(params: CaptionParams): Promise<string> {
  const res = await fetch(params.image);
  const blob = await res.blob();

  const formData = new FormData();
  formData.append("file", blob, "upload.png");

  const response = await fetch("http://localhost:8000/api/generate-caption/", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data.caption || "error";
}

export async function generateAdvancedCaption(params: CaptionParams): Promise<string> {
  // generate new caption with prevCaption
  const refineResponse = await fetch("http://localhost:8000/api/refine-caption/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      caption: params.prevCaption,
      tone: params.tone,
      additional_info: params.customPrompt,
    }),
  });
  const refineData = await refineResponse.json();
  return refineData.refined_caption || "error";
}

export async function generateHashtags(caption: string): Promise<string[]> {
  const response = await fetch("http://localhost:8000/api/get-hashtags/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caption }),
  });

  const data = await response.json();
  return data.hashtags || [];
}



export async function generateCaption(params: CaptionParams): Promise<string> {
  // Convert base64 image to Blob. This example assumes params.image is a data URL.
  const res = await fetch(params.image);
  const blob = await res.blob();

  // Create FormData and append the image file
  const formData = new FormData();
  formData.append("file", blob, "upload.png");

  // Call the Django endpoint to generate the initial caption
  const response = await fetch("http://localhost:8000/api/generate-caption/", {
    method: "POST",
    body: formData,
  });

  console.log(response);

  const data = await response.json();
  let caption = data.caption || "";

  // If using the advanced model, refine the caption
  if (params.model === "advanced") {
    const refineResponse = await fetch("http://localhost:8000/api/refine-caption/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caption,
        tone: params.tone,
        additional_info: params.customPrompt,
      }),
    });
    const refineData = await refineResponse.json();
    caption = refineData.refined_caption || caption;
  }

  // Optionally, you could add a call here for hashtags if desired.
  if (params.containHashtags) {
    const hashtagResponse = await fetch("http://localhost:8000/api/get-hashtags/", {
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
