import { useState, useRef } from 'react'
import './App.css'
import {
  Sparkles, Upload, X, ChevronDown, ChevronUp, Copy, Check,
  Loader2, Image as ImageIcon, Paintbrush, Sofa, Sun, Camera,
  Maximize, Layers, Home, Building2, ArrowRight, Download, Wand2
} from 'lucide-react'

// API key is now stored securely on the server side

const ROOM_TYPES = [
  'Living Room', 'Bedroom', 'Master Bedroom', 'Kitchen', 'Bathroom',
  'Dining Room', 'Home Office', 'Walk-in Closet', 'Hallway', 'Balcony',
  'Lobby', 'Reception', 'Conference Room', 'Restaurant', 'Hotel Room',
  'Retail Store', 'Spa', 'Gym', 'Library', 'Nursery', 'Other...'
]

const STYLES = [
  'Modern Minimalist', 'Scandinavian', 'Industrial', 'Mid-Century Modern',
  'Contemporary', 'Japandi', 'Wabi-Sabi', 'Art Deco', 'Neoclassical',
  'Bohemian', 'Coastal / Hamptons', 'Rustic / Farmhouse', 'Tropical',
  'Mediterranean', 'French Country', 'Luxury Modern', 'Brutalist',
  'Biophilic', 'Memphis', 'Maximalist', 'Other...'
]

const CAMERA_ANGLES = [
  'Eye-level straight', 'Eye-level corner (2-point perspective)',
  'Slightly elevated (bird\'s eye lite)', 'Low angle (dramatic)',
  'Top-down / Plan view', 'Wide establishing shot',
  'Close-up vignette', 'Through doorway / frame-in-frame'
]

const DETAIL_LEVELS = [
  'Concept sketch', 'Mood board render', 'Realistic render', 'Photorealistic (V-Ray quality)'
]

const ASPECT_RATIOS = [
  '16:9 (Widescreen)', '4:3 (Classic)', '1:1 (Square)',
  '3:2 (Photography)', '9:16 (Portrait/Social)', '2:1 (Ultrawide)'
]

const LIGHTING_PRESETS = [
  'Natural daylight (large windows)', 'Golden hour warm',
  'Cool morning light', 'Dramatic single-source',
  'Ambient + accent (layered)', 'Chandelier / pendant warm',
  'Recessed spotlights', 'Backlit / silhouette',
  'Neon accent', 'Candlelight / moody'
]

const NANO_MODELS = [
  'Nano Banana', 'Nano Banana Pro 2'
]

const NANO_QUALITY = [
  '2K', '4K', '8K'
]

function SelectField({ label, icon: Icon, options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  return (
    <div className="field" ref={ref}>
      <label><Icon size={16} /> {label}</label>
      <div className={`select-trigger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        <span className={value ? 'selected' : 'placeholder'}>
          {value || placeholder || `Choose ${label.toLowerCase()}...`}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      {open && (
        <div className="select-dropdown">
          {options.map(opt => (
            <div
              key={opt}
              className={`select-option ${opt === value ? 'active' : ''}`}
              onClick={() => { onChange(opt); setOpen(false) }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TextField({ label, icon: Icon, value, onChange, placeholder, multiline }) {
  return (
    <div className="field">
      <label><Icon size={16} /> {label}</label>
      {multiline ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={3}
        />
      ) : (
        <input
          type="text" value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}

function ImageUpload({ label, images, onAdd, onRemove }) {
  const inputRef = useRef(null)

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    const currentCount = images.length
    const remaining = 5 - currentCount

    if (remaining <= 0) {
      alert('Maximum 5 images allowed.')
      return
    }

    const filesToProcess = files.slice(0, remaining)

    filesToProcess.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        onAdd({ file, preview: ev.target.result, name: file.name })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  return (
    <div className="field image-upload-field">
      <label><ImageIcon size={16} /> {label}</label>
      <div className="image-upload-area">
        {images.map((img, i) => (
          <div key={i} className="image-thumb">
            <img src={img.preview} alt={img.name} />
            <button className="remove-img" onClick={() => onRemove(i)}>
              <X size={12} />
            </button>
          </div>
        ))}
        <button className="add-image-btn" onClick={() => inputRef.current?.click()}>
          <Upload size={20} />
          <span>Upload</span>
        </button>
        <input
          ref={inputRef} type="file" accept="image/*" multiple
          onChange={handleFiles} style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}

function PromptCard({ prompt, index, label, description, onGenImage, isGenning, genImages, targetModel }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (img, idx) => {
    const ext = img.mimeType?.includes('png') ? 'png' : 'jpg'
    const link = document.createElement('a')
    link.href = `data:${img.mimeType};base64,${img.data}`
    link.download = `render-${label.toLowerCase().replace(/\s+/g, '-')}-${idx + 1}.${ext}`
    link.click()
  }

  return (
    <div className="prompt-card">
      <div className="prompt-card-header">
        <div className="prompt-label">
          <span className="prompt-badge">{String.fromCharCode(65 + index)}</span>
          <div>
            <span className="prompt-label-text">{label}</span>
            {description && <span className="prompt-desc">{description}</span>}
          </div>
        </div>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>

      <pre className="prompt-text">{prompt}</pre>

      {/* Gen image with Nano Banana */}
      <div className="image-gen-container">
        <button className="btn-image-gen" onClick={() => onGenImage(prompt)} disabled={isGenning}>
          {isGenning ? (
            <><Loader2 size={16} className="spin" /> Generating image...</>
          ) : (
            <><Wand2 size={16} /> Generate Image with {targetModel || 'Nano Banana'}</>
          )}
        </button>

        {genImages && genImages.length > 0 && (
          <div className="generated-images-grid">
            {genImages.map((img, idx) => (
              <div key={idx} className="generated-image-card">
                <img src={`data:${img.mimeType};base64,${img.data}`} alt={`Render ${idx + 1}`} />
                <button className="btn-download-image" onClick={() => handleDownload(img, idx)}>
                  <Download size={12} /> Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [projectName, setProjectName] = useState('')
  const [floor, setFloor] = useState('')
  const [roomType, setRoomType] = useState('')
  const [customRoomType, setCustomRoomType] = useState('')
  const [style, setStyle] = useState('')
  const [customStyle, setCustomStyle] = useState('')
  const [mainColors, setMainColors] = useState('')
  const [ceilingHeight, setCeilingHeight] = useState('')
  const [roomDimensions, setRoomDimensions] = useState('')
  const [materials, setMaterials] = useState('')
  const [keyFurniture, setKeyFurniture] = useState('')
  const [windowLight, setWindowLight] = useState('')
  const [lighting, setLighting] = useState('')
  const [moodVibe, setMoodVibe] = useState('')
  const [cameraAngle, setCameraAngle] = useState('')
  const [detailLevel, setDetailLevel] = useState('')
  const [aspectRatio, setAspectRatio] = useState('')
  const [refImages, setRefImages] = useState([])
  const [sketchImages, setSketchImages] = useState([])
  const [prompts, setPrompts] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState('')
  const [error, setError] = useState('')
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash')
  const [nanoModel, setNanoModel] = useState('Nano Banana Pro 2')
  const [nanoQuality, setNanoQuality] = useState('4K')
  const [strictSketchMatch, setStrictSketchMatch] = useState(true)
  const [imageGenStates, setImageGenStates] = useState({})
  const [generatedImages, setGeneratedImages] = useState({})

  const resultsRef = useRef(null)

  const buildSystemPrompt = () => {
    const strictMode = strictSketchMatch

    return `You are an expert interior design photographer and prompt engineer. You specialize in transforming 3D sketch models (SketchUp, 3ds Max wireframes) into prompts that produce images looking like REAL PHOTOGRAPHS taken inside actual built spaces — not 3D renders, not CGI, but real-life interior photography.

TARGET: ${nanoModel} at ${nanoQuality} resolution.

YOUR GOAL: Generate 3 prompts that, when used with ${nanoModel} image AI, will produce images that:
1. MATCH THE EXACT LAYOUT from the sketch — same wall positions, same furniture placement, same door/window locations, same camera angle and perspective
2. LOOK LIKE REAL PHOTOGRAPHS — as if a professional photographer walked into the finished room and shot it with a high-end camera
${strictMode ? `
===== STRICT SKETCH MATCH MODE — ENABLED =====
This is the HIGHEST PRIORITY instruction. The generated image MUST be at least 90% identical to the sketch layout.

MANDATORY SPATIAL MAPPING — You must create a PRECISE spatial inventory from the sketch:

1. CAMERA (highest priority):
   - Exact viewpoint position (e.g. "camera placed at the doorway threshold, 1.5m height, facing 30 degrees to the right")
   - Exact lens perspective: wide-angle, normal, or telephoto feel
   - Exact tilt: level, slightly looking up, or slightly looking down
   - The output image MUST have the IDENTICAL camera angle as the sketch — this is non-negotiable

2. OBJECT-BY-OBJECT INVENTORY (list EVERY visible item):
   For EACH object in the sketch, describe:
   - What it is (e.g. "tall open bookshelf with 5 glass shelves")
   - Exact position: which wall, how far from corners, how far from floor
   - Exact size relative to the room (e.g. "bookshelf occupies the left 30% of the back wall, floor to 80% ceiling height")
   - Relationship to neighboring objects (e.g. "floor lamp stands between the bookshelf and console table, 40cm from each")

3. WALL-BY-WALL DESCRIPTION:
   - LEFT WALL: List everything on/against it, from front to back
   - RIGHT WALL: List everything on/against it, from front to back
   - FRONT/BACK WALL: List everything visible
   - Describe wall color, texture, any architectural details (molding, panels, niches)

4. FLOOR & CEILING:
   - Floor material, pattern, color
   - Ceiling height, any details (recessed areas, crown molding, lighting fixtures)

5. PROPORTIONS — Critical for 90% match:
   - Describe the room's width-to-depth ratio as visible from camera
   - Describe how much of the frame each wall occupies
   - Describe foreground vs. background depth

STRICT MATCH RULES:
- Do NOT add ANY furniture or objects that are NOT in the sketch
- Do NOT remove ANY objects that ARE in the sketch
- Do NOT change the position of ANY object
- Do NOT change the camera angle or perspective
- You MAY enhance: materials, textures, lighting quality, surface details
- You MAY add: realistic shadows, reflections, ambient lighting
- The prompt MUST start with: "Recreate this exact interior layout as a real photograph:"
=====
` : ''}
CRITICAL — SKETCH ANALYSIS (if sketch images provided):
When analyzing the sketch, you MUST describe in the prompt:
- Exact camera position and viewing angle (e.g. "viewed from the hallway entrance looking straight ahead")
- What is on the LEFT wall, RIGHT wall, FRONT wall, and any visible BACK wall
- Exact position of each piece of furniture relative to walls (e.g. "a console table against the right wall, 1 meter from the corner")
- Position and style of doors (e.g. "double doors with X-pattern panels centered on the back wall")
- Position and type of lighting fixtures (e.g. "wall sconce on the right wall above the console, pendant lamp in the alcove")
- Architectural features: niches, shelving, crown molding, ceiling details, floor patterns
- Depth and proportions of the space

PROMPT STYLE FOR NANO BANANA:
- Write in natural, flowing English paragraphs — no coded parameters, no flags
${strictMode ? '- Start each prompt with: "Recreate this exact interior layout as a real photograph:"' : '- Start each prompt with: "A professional interior photograph of..."'}
- Describe the scene as if you are standing in the room and describing what the camera sees, from foreground to background, left to right
- For materials, use REAL-WORLD descriptions: "polished Portoro marble with gold veining", "brushed brass with patina", "dark walnut wood veneer with book-matched grain"
- For lighting, describe it photographically: "warm ambient glow from recessed ceiling spots casting soft pools of light", "golden light from the wall sconce creating a warm halo on the textured wall"
- Reference the look of REAL interior photography: "shot on a Canon EOS R5 with a 24mm tilt-shift lens, f/8, natural white balance"
- End with resolution-appropriate quality tags:
  * For 2K: photorealistic, high resolution, professional interior photography, natural lighting
  * For 4K: photorealistic, ultra high resolution, 4K detail, professional interior photography, depth of field, natural lighting, editorial quality
  * For 8K: photorealistic, 8K ultra high resolution, extreme fine detail, micro-texture rendering, professional interior photography, shallow depth of field, natural lighting, editorial quality, award-winning
- For ${nanoModel === 'Nano Banana Pro 2' ? 'Pro 2: use more detailed and longer prompts (300-450 words for strict mode, 250-350 for normal), Pro 2 handles complex descriptions better and produces higher fidelity results' : 'standard Nano Banana: keep prompts focused and concise (250-350 words for strict mode, 200-280 for normal) for best results'}
- Current target: ${nanoQuality} resolution

THREE VARIANTS:
${strictMode ? `- Prompt A (Exact Match): Reproduce the sketch with 90%+ spatial accuracy as a real photograph. EVERY object in the EXACT same position. Only enhance with realistic materials, textures, and professional lighting.
- Prompt B (Luxury Match): SAME exact layout and positions (90%+ match), but with premium luxury materials — richer marble, gold accents, crystal fixtures, dramatic warm lighting. No position changes.
- Prompt C (Editorial Match): SAME exact layout and positions (90%+ match), styled for Architectural Digest. Add ONLY small lifestyle props (books, small vase) on surfaces that already have space. Cinematic golden-hour lighting.` : `- Prompt A (Faithful): Reproduce the sketch EXACTLY as a real photograph. Same layout, same items, same perspective. Only add realistic materials, textures, and lighting.
- Prompt B (Elevated): Same layout, but upgrade materials and lighting for luxury effect — richer textures, more dramatic warm lighting, higher-end finishes. Still the same room.
- Prompt C (Editorial): Same layout, add lifestyle staging (books, flowers, coffee cup on console, soft throw). Cinematic golden-hour lighting. Styled as if shot for Architectural Digest.`}

REFERENCE IMAGES (if provided):
Match the exact material quality, color temperature, lighting warmth, and photographic style from the reference images. These show the TARGET quality level.

OUTPUT FORMAT — respond ONLY with valid JSON, no markdown, no backticks:
{
  "prompts": [
    {
      "label": "${strictMode ? 'Exact Match' : 'Faithful to Specs'}",
      "description": "Brief 1-line description",
      "prompt": "The full prompt text..."
    },
    {
      "label": "${strictMode ? 'Luxury Match' : 'Elevated Creative'}",
      "description": "Brief 1-line description",
      "prompt": "The full prompt text..."
    },
    {
      "label": "${strictMode ? 'Editorial Match' : 'Editorial Magazine'}",
      "description": "Brief 1-line description",
      "prompt": "The full prompt text..."
    }
  ]
}`
  }

  const buildUserMessage = () => {
    let msg = `Generate 3 interior design render prompts for this project:\n\n`
    const finalRoomType = roomType === 'Other...' ? customRoomType : roomType
    const finalStyle = style === 'Other...' ? customStyle : style
    msg += `PROJECT: ${projectName || 'Untitled'}\n`
    if (floor) msg += `FLOOR: ${floor}\n`
    msg += `ROOM TYPE: ${finalRoomType || 'Not specified'}\n`
    msg += `STYLE: ${finalStyle || 'Not specified'}\n`
    if (mainColors) msg += `COLOR PALETTE: ${mainColors}\n`
    if (ceilingHeight) msg += `CEILING HEIGHT: ${ceilingHeight}\n`
    if (roomDimensions) msg += `ROOM DIMENSIONS: ${roomDimensions}\n`
    if (materials) msg += `MATERIALS & FINISHES: ${materials}\n`
    if (keyFurniture) msg += `KEY FURNITURE / FIXTURES: ${keyFurniture}\n`
    if (windowLight) msg += `WINDOWS & NATURAL LIGHT: ${windowLight}\n`
    if (lighting) msg += `LIGHTING: ${lighting}\n`
    if (moodVibe) msg += `MOOD & VIBE: ${moodVibe}\n`
    if (cameraAngle) msg += `CAMERA ANGLE: ${cameraAngle}\n`
    if (detailLevel) msg += `DETAIL LEVEL: ${detailLevel}\n`
    if (aspectRatio) msg += `ASPECT RATIO: ${aspectRatio}\n`
    msg += `TARGET AI MODEL: ${nanoModel}\n`
    msg += `TARGET QUALITY: ${nanoQuality}\n`
    msg += `STRICT SKETCH MATCH: ${strictSketchMatch ? 'YES — output image must match sketch layout 90%+. Every object in the EXACT same position, same camera angle, same proportions.' : 'NO — use sketch as general reference'}\n`
    if (refImages.length > 0) msg += `\nREFERENCE IMAGES: ${refImages.length} reference image(s) attached — analyze their style, color palette, materials, and spatial layout to inform the prompts.\n`
    if (sketchImages.length > 0) msg += `SKETCH/3D MODEL: ${sketchImages.length} sketch image(s) attached — CRITICAL: analyze the exact spatial layout, furniture positions, wall placements, architectural features, door/window locations, and camera perspective. ${strictSketchMatch ? 'Create an OBJECT-BY-OBJECT inventory: list every single item, its exact position relative to walls and other objects, its size relative to the room. The prompt must describe the scene so precisely that someone could recreate the sketch layout without seeing it.' : 'Describe this layout precisely in each prompt.'}\n`
    return msg
  }

  const handleGenerate = async () => {
    if (!roomType && !style) {
      setError('Please select at least a Room Type or Style to generate prompts.')
      return
    }

    setIsLoading(true)
    setLoadingStatus('Preparing request...')
    setError('')
    setPrompts(null)
    setGeneratedImages({})
    setImageGenStates({})

    try {
      const contentParts = []
      if (refImages.length > 0 || sketchImages.length > 0) {
        setLoadingStatus('Processing images...')
      }

      for (const img of sketchImages) {
        const base64 = img.preview.split(',')[1]
        const mimeType = img.file.type || 'image/jpeg'
        contentParts.push({ inlineData: { mimeType, data: base64 } })
      }

      for (const img of refImages) {
        const base64 = img.preview.split(',')[1]
        const mimeType = img.file.type || 'image/jpeg'
        contentParts.push({ inlineData: { mimeType, data: base64 } })
      }

      contentParts.push({ text: buildUserMessage() })

      // Model fallback chain: try selected model first, then fallbacks
      const FALLBACK_MODELS = {
        'gemini-3.1-pro-preview': ['gemini-3-pro-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'],
        'gemini-3-pro-preview': ['gemini-3.1-pro-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'],
        'gemini-3-flash-preview': ['gemini-3.1-pro-preview', 'gemini-2.5-flash'],
        'gemini-2.5-flash': ['gemini-3-flash-preview', 'gemini-2.5-pro'],
        'gemini-2.5-pro': ['gemini-2.5-flash', 'gemini-3-flash-preview'],
      }
      const modelsToTry = [geminiModel, ...(FALLBACK_MODELS[geminiModel] || ['gemini-3-flash-preview', 'gemini-2.5-flash'])]

      let data = null
      let lastError = ''

      for (const currentModel of modelsToTry) {
        const isProModel = currentModel.includes('pro')
        const timeoutMs = isProModel ? 180000 : 90000

        if (currentModel !== geminiModel) {
          setLoadingStatus(`${geminiModel} overloaded — trying ${currentModel}...`)
          await new Promise(r => setTimeout(r, 1500))
        } else {
          setLoadingStatus(isProModel ? 'Sending to Gemini Pro (may take 30-90s)...' : 'Sending to Gemini Flash (usually 10-30s)...')
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

        try {
          const response = await fetch('/api/gemini', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                model: currentModel,
                body: {
                  system_instruction: { parts: [{ text: buildSystemPrompt() }] },
                  contents: [{ parts: contentParts }],
                  generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                    responseMimeType: 'application/json',
                  }
                }
              })
            }
          )
          clearTimeout(timeoutId)

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}))
            lastError = errData.error?.message || `API error: ${response.status}`
            // If overloaded or rate limited, try next model
            if (response.status === 503 || response.status === 429) {
              continue
            }
            throw new Error(lastError)
          }

          data = await response.json()
          break // Success — exit loop
        } catch (fetchErr) {
          clearTimeout(timeoutId)
          if (fetchErr.name === 'AbortError') {
            lastError = 'Request timed out'
            continue
          }
          throw fetchErr
        }
      }

      if (!data) {
        throw new Error(`All models are overloaded. ${lastError}. Please try again in a few minutes.`)
      }
      setLoadingStatus('Parsing response...')
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) {
        // Check if response was blocked or had other issues
        const finishReason = data.candidates?.[0]?.finishReason
        if (finishReason === 'MAX_TOKENS') {
          throw new Error('Response was too long and got cut off. Try selecting a simpler style or fewer details.')
        }
        if (finishReason === 'SAFETY') {
          throw new Error('Response was blocked by safety filters. Try adjusting your input.')
        }
        throw new Error(`No response from Gemini (reason: ${finishReason || 'unknown'})`)
      }

      let parsed;
      // Step 1: Try direct JSON parse (responseMimeType should give clean JSON)
      try {
        parsed = JSON.parse(text)
      } catch (e1) {
        // Step 2: Clean markdown wrappers
        try {
          const cleaned = text.replace(/```json\s*/g, '').replace(/```/g, '').trim()
          parsed = JSON.parse(cleaned)
        } catch (e2) {
          // Step 3: Extract JSON object from text
          try {
            // Find the outermost { ... } block
            let depth = 0, start = -1, end = -1
            for (let i = 0; i < text.length; i++) {
              if (text[i] === '{') { if (depth === 0) start = i; depth++ }
              if (text[i] === '}') { depth--; if (depth === 0) { end = i; break } }
            }
            if (start >= 0 && end > start) {
              let jsonStr = text.substring(start, end + 1)
              // Fix common issues: control characters, trailing commas
              jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
              jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
              parsed = JSON.parse(jsonStr)
            } else {
              throw new Error('No JSON found')
            }
          } catch (e3) {
            console.error("Raw response:", text.substring(0, 500))
            throw new Error('AI returned malformed data. Try re-generating. (Tip: try Gemini 2.5 Pro for more reliable JSON output)')
          }
        }
      }

      // Normalize: handle both {prompts: [...]} and direct array [...]
      if (Array.isArray(parsed)) {
        parsed = { prompts: parsed }
      }

      if (!parsed?.prompts || parsed.prompts.length === 0) {
        throw new Error('Invalid response format — no prompts found')
      }

      setPrompts(parsed.prompts)

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)

    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Pro models may take longer — try Flash for faster results, or use fewer/smaller images.')
      } else {
        setError(err.message || 'Failed to generate prompts. Please try again.')
      }
    } finally {
      setIsLoading(false)
      setLoadingStatus('')
    }
  }

  const handleGenImage = async (promptText, promptIndex) => {
    setImageGenStates(prev => ({ ...prev, [promptIndex]: true }))
    setError('')

    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Generate a photorealistic interior render based on this prompt:\n\n${promptText}`,
          sketchImages: sketchImages.map(img => ({
            mimeType: img.file.type || 'image/jpeg',
            data: img.preview.split(',')[1]
          })),
          refImages: refImages.map(img => ({
            mimeType: img.file.type || 'image/jpeg',
            data: img.preview.split(',')[1]
          }))
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `API error: ${response.status}`)

      if (data.images?.length > 0) {
        setGeneratedImages(prev => ({
          ...prev,
          [promptIndex]: [...(prev[promptIndex] || []), ...data.images]
        }))
      } else {
        throw new Error('No image generated. Try a different prompt.')
      }
    } catch (err) {
      setError(`Image generation error: ${err.message}`)
    } finally {
      setImageGenStates(prev => ({ ...prev, [promptIndex]: false }))
    }
  }

  const handleReset = () => {
    setProjectName(''); setFloor(''); setRoomType(''); setCustomRoomType(''); setStyle(''); setCustomStyle('')
    setMainColors(''); setCeilingHeight(''); setRoomDimensions('')
    setMaterials(''); setKeyFurniture(''); setWindowLight('')
    setLighting(''); setMoodVibe(''); setCameraAngle('')
    setDetailLevel(''); setAspectRatio('')
    setRefImages([]); setSketchImages([])
    setNanoModel('Nano Banana Pro 2'); setNanoQuality('4K'); setStrictSketchMatch(true)
    setPrompts(null); setError('')
    setGeneratedImages({}); setImageGenStates({})
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon" style={{ background: 'transparent' }}>
              <img src="/Black - HOJ.png" alt="HOJ Logo" style={{ height: '144px', width: 'auto' }} />
            </div>
            <div>
              <h1>Interior Prompt Studio</h1>
              <p className="tagline">AI-powered render prompts for interior design.</p>
            </div>
          </div>
          <div className="model-selectors">
            <div className="model-selector">
              <label>Prompt Model</label>
              <select value={geminiModel} onChange={e => setGeminiModel(e.target.value)}>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (stable)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-3-flash-preview">Gemini 3 Flash (preview)</option>
                <option value="gemini-3-pro-preview">Gemini 3 Pro (preview)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (preview)</option>
              </select>
            </div>
            <div className="model-selector">
              <label>Target</label>
              <select value={nanoModel} onChange={e => setNanoModel(e.target.value)}>
                {NANO_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="model-selector">
              <label>Quality</label>
              <select value={nanoQuality} onChange={e => setNanoQuality(e.target.value)}>
                {NANO_QUALITY.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="form-container">
          <section className="form-section">
            <h2><Building2 size={18} /> Project Info</h2>
            <div className="fields-grid">
              <TextField label="Project Name" icon={Home} value={projectName} onChange={setProjectName} placeholder="e.g. Villa Thảo Điền — Master Bedroom" />
              <TextField label="Floor" icon={Layers} value={floor} onChange={setFloor} placeholder="e.g. 2nd Floor, Penthouse" />
              <SelectField label="Room Type" icon={Home} options={ROOM_TYPES} value={roomType} onChange={setRoomType} />
              {roomType === 'Other...' && (
                <TextField
                  label="Custom Room Type"
                  icon={ArrowRight}
                  value={customRoomType}
                  onChange={setCustomRoomType}
                  placeholder="e.g. Golf Simulator, Cigar Lounge"
                />
              )}
              <SelectField label="Style" icon={Paintbrush} options={STYLES} value={style} onChange={setStyle} />
              {style === 'Other...' && (
                <TextField
                  label="Custom Style"
                  icon={ArrowRight}
                  value={customStyle}
                  onChange={setCustomStyle}
                  placeholder="e.g. Cyberpunk, Medieval, Cyber-Organic"
                />
              )}
            </div>
          </section>

          <section className="form-section">
            <h2><Maximize size={18} /> Space & Dimensions</h2>
            <div className="fields-grid">
              <TextField label="Ceiling Height" icon={ArrowRight} value={ceilingHeight} onChange={setCeilingHeight} placeholder="e.g. 3.2m, double-height 6m" />
              <TextField label="Room Dimensions (L × W)" icon={Maximize} value={roomDimensions} onChange={setRoomDimensions} placeholder="e.g. 5m × 4m, 800 sqft" />
              <TextField label="Main Colors" icon={Paintbrush} value={mainColors} onChange={setMainColors} placeholder="e.g. Warm white, walnut brown, sage green" />
              <TextField label="Window & Natural Light" icon={Sun} value={windowLight} onChange={setWindowLight} placeholder="e.g. Floor-to-ceiling west-facing, afternoon sun" />
            </div>
          </section>

          <section className="form-section">
            <h2><Sofa size={18} /> Materials & Furniture</h2>
            <div className="fields-grid">
              <TextField label="Materials & Finishes" icon={Layers} value={materials} onChange={setMaterials} placeholder="e.g. White oak flooring, marble countertop, brass fixtures" multiline />
              <TextField label="Key Furniture / Fixtures" icon={Sofa} value={keyFurniture} onChange={setKeyFurniture} placeholder="e.g. King bed with upholstered headboard, freestanding bathtub" multiline />
            </div>
          </section>

          <section className="form-section">
            <h2><Sun size={18} /> Lighting & Mood</h2>
            <div className="fields-grid">
              <SelectField label="Lighting" icon={Sun} options={LIGHTING_PRESETS} value={lighting} onChange={setLighting} />
              <TextField label="Mood & Vibe" icon={Sparkles} value={moodVibe} onChange={setMoodVibe} placeholder="e.g. Serene zen retreat, cozy hygge, bold dramatic" />
            </div>
          </section>

          <section className="form-section">
            <h2><Camera size={18} /> Camera & Output</h2>
            <div className="fields-grid">
              <SelectField label="Camera Angle" icon={Camera} options={CAMERA_ANGLES} value={cameraAngle} onChange={setCameraAngle} />
              <SelectField label="Detail Level" icon={Layers} options={DETAIL_LEVELS} value={detailLevel} onChange={setDetailLevel} />
              <SelectField label="Aspect Ratio" icon={Maximize} options={ASPECT_RATIOS} value={aspectRatio} onChange={setAspectRatio} />
            </div>
          </section>

          <section className="form-section">
            <h2><ImageIcon size={18} /> Reference Images</h2>
            <div className="fields-grid full-width">
              <ImageUpload
                label="Reference / Inspiration Images"
                images={refImages}
                onAdd={img => setRefImages(prev => [...prev, img])}
                onRemove={i => setRefImages(prev => prev.filter((_, idx) => idx !== i))}
              />
              <ImageUpload
                label="Sketch / Floor Plan Images"
                images={sketchImages}
                onAdd={img => setSketchImages(prev => [...prev, img])}
                onRemove={i => setSketchImages(prev => prev.filter((_, idx) => idx !== i))}
              />
            </div>
            <div className="strict-match-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={strictSketchMatch}
                  onChange={e => setStrictSketchMatch(e.target.checked)}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-text">
                  Strict Sketch Match
                  <span className="toggle-hint">Objects & camera angle must match sketch 90%+</span>
                </span>
              </label>
            </div>
          </section>

          <div className="actions">
            <button className="btn-secondary" onClick={handleReset}>Reset All</button>
            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  {loadingStatus || 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate 3 Prompts
                </>
              )}
            </button>
          </div>

          {error && <div className="error-msg">{error}</div>}
        </div>

        {prompts && (
          <div className="results" ref={resultsRef}>
            <h2><Sparkles size={20} /> Generated Prompts</h2>
            <p className="results-subtitle">Optimized for {nanoModel} ({nanoQuality}). Copy prompt or generate image directly below.</p>
            <div className="prompts-grid">
              {prompts.map((p, i) => (
                <PromptCard
                  key={i} index={i} prompt={p.prompt} label={p.label}
                  description={p.description}
                  onGenImage={(text) => handleGenImage(text, i)}
                  isGenning={imageGenStates[i] || false}
                  genImages={generatedImages[i] || []}
                  targetModel={nanoModel}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Interior Prompt Studio · Powered by Google Gemini</p>
      </footer>
    </div>
  )
}

export default App
