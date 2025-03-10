const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface RatingSubmission {
  caption_basic?: string;
  caption_refined?: string;
  caption_hashtags?: string;
  image?: File;
  rating: number;
  feedback?: string;
}

// Update the submitRating function with more robust handling

export const submitRating = async (ratingData: RatingSubmission): Promise<any> => {
  try {
    console.log("Rating submission data:", ratingData);
    
    // Always use FormData
    const formData = new FormData();
    
    // Process image first if it exists - this is critical!
    if (ratingData.image && ratingData.image instanceof File) {
      // Simple validation
      if (ratingData.image.size === 0) {
        console.error("Image file has zero size!");
      } else {
        console.log("Adding image to FormData:", 
          ratingData.image.name, 
          ratingData.image.size, 
          ratingData.image.type
        );
        
        // Append with explicit filename
        formData.append('image', ratingData.image, ratingData.image.name);
      }
    } else {
      console.log("No image file to upload");
    }
    
    // Add text fields
    if (ratingData.caption_basic) formData.append('caption_basic', ratingData.caption_basic);
    if (ratingData.caption_refined) formData.append('caption_refined', ratingData.caption_refined);
    if (ratingData.caption_hashtags) formData.append('caption_hashtags', ratingData.caption_hashtags);
    
    // Add caption field always
    const mainCaption = ratingData.caption_basic || ratingData.caption_refined || ratingData.caption_hashtags || "";
    formData.append('caption', mainCaption);
    
    // Add rating (required)
    formData.append('rating', ratingData.rating.toString());
    
    // Add optional feedback
    if (ratingData.feedback) formData.append('feedback', ratingData.feedback);
    
    // Show exactly what we're sending
    console.log("FormData contents:");
    for (const pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: File - ${(pair[1] as File).name} (${(pair[1] as File).size} bytes)`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
    
    // Send the request - important: no Content-Type header!
    const response = await fetch(`${API_URL}/ratings/`, {
      method: 'POST',
      body: formData,
      // Do NOT set Content-Type header - browser will set it with correct boundary
    });
    
    // Handle response
    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw error;
  }
};

export const getCaptionRatings = async (caption: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/ratings/?caption=${encodeURIComponent(caption)}`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching ratings:', error);
    throw error;
  }
};
