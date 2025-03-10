import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";

interface CaptionRatingProps {
  caption?: string;  // Keep the original prop for backward compatibility
  captionBasic?: string;
  captionRefined?: string;
  captionHashtags?: string;
  imageDataUrl?: string; // The data URL of the uploaded image
  onRatingSubmit: (rating: number, feedback: string) => void;
}

export default function CaptionRating({ 
  caption,  // Add this back
  captionBasic, 
  captionRefined, 
  captionHashtags,
  imageDataUrl,
  onRatingSubmit 
}: CaptionRatingProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Get the effective caption (for display purposes)
  const effectiveCaption = caption || captionBasic || captionRefined || captionHashtags || "";

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onRatingSubmit(rating, feedback);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
        <p className="text-green-700 dark:text-green-300 font-medium">
          Thank you for your feedback!
        </p>
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-md dark:border-gray-700">
      <h3 className="text-lg font-medium mb-2 dark:text-gray-200">Rate this caption</h3>
      <div className="flex mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            size={24}
            className={`cursor-pointer ${
              star <= (hoveredRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          />
        ))}
      </div>
      
      {rating > 0 && (
        <>
          <div className="mb-4">
            <button 
              onClick={() => setShowFeedback(!showFeedback)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showFeedback ? "Hide feedback form" : "Add written feedback (optional)"}
            </button>
          </div>

          {showFeedback && (
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 mb-4"
              placeholder="What did you think of this caption?"
              rows={3}
            />
          )}
          
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </>
      )}
    </div>
  );
}
