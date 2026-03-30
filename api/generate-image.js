export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const { prompt, aspectRatio } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    // Use Gemini 2.0 Flash with image generation
    const model = 'gemini-2.0-flash-preview-image-generation'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Generate a photorealistic interior design render based on this prompt:\n\n${prompt}` }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          }
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    // Extract image data from response
    const parts = data.candidates?.[0]?.content?.parts || []
    const images = []
    let text = ''

    for (const part of parts) {
      if (part.inlineData) {
        images.push({
          mimeType: part.inlineData.mimeType,
          data: part.inlineData.data
        })
      }
      if (part.text) {
        text += part.text
      }
    }

    return res.status(200).json({ images, text })
  } catch (error) {
    console.error('Image generation error:', error)
    return res.status(500).json({ error: error.message })
  }
}
