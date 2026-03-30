export default async function handler(req, res) {
  // Allow GET for quick API key test
  if (req.method === 'GET') {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ status: 'error', message: 'GEMINI_API_KEY not set' })
    }

    try {
      // Quick test: list models to verify API key works
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      )
      const data = await response.json()

      if (!response.ok) {
        return res.status(response.status).json({
          status: 'error',
          message: data.error?.message || 'API key invalid',
          keyPrefix: apiKey.substring(0, 8) + '...'
        })
      }

      const modelNames = (data.models || [])
        .map(m => m.name?.replace('models/', ''))
        .filter(n => n?.includes('gemini'))
        .sort()

      return res.status(200).json({
        status: 'ok',
        message: 'API key is valid',
        keyPrefix: apiKey.substring(0, 8) + '...',
        availableModels: modelNames
      })
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const { model, body } = req.body

    console.log(`[gemini] Calling model: ${model}`)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error(`[gemini] Error ${response.status} for model ${model}:`, JSON.stringify(data.error || data))
      return res.status(response.status).json(data)
    }

    console.log(`[gemini] Success for model ${model}`)
    return res.status(200).json(data)
  } catch (error) {
    console.error(`[gemini] Fetch error:`, error.message)
    return res.status(500).json({ error: error.message })
  }
}
