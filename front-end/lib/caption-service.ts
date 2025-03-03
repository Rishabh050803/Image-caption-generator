interface CaptionParams {
  image: string
  model: "basic" | "advanced"
  tone: string
  customPrompt: string
}

const randomCaptions = [
  "A beautiful moment captured in time.",
  "This image speaks a thousand words.",
  "An incredible sight that catches the eye.",
  "A perfect example of visual storytelling.",
  "What a remarkable scene to behold!",
  "This picture perfectly encapsulates the moment.",
  "A stunning visual that leaves you speechless.",
  "An artistic composition that draws you in.",
  "A captivating image that tells a unique story.",
  "This photo brings the scene to life.",
]

export async function generateCaption(_params: CaptionParams): Promise<string> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Return a random caption from the array
  return randomCaptions[Math.floor(Math.random() * randomCaptions.length)]
}

