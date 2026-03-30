import { useState, useRef } from 'react'
import './App.css'
import { 
  Sparkles, Upload, X, ChevronDown, ChevronUp, Copy, Check, 
  Loader2, Image as ImageIcon, Paintbrush, Sofa, Sun, Camera,
  Maximize, Layers, Home, Building2, ArrowRight
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

function PromptCard({ prompt, index, label, description }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  const resultsRef = useRef(null)

  const buildSystemPrompt = () => {
    return `You are an expert interior design visualization prompt engineer with 15 years of experience creating photorealistic architectural renders using V-Ray, Corona, Octane, and AI image generators.

Your task: Generate exactly 3 distinct, high-quality image generation prompts for an interior design render based on the project specifications provided.

RULES:
1. Each prompt must be 120-200 words, highly detailed and specific.
2. Each prompt should offer a DIFFERENT creative interpretation:
   - Prompt A: Faithful to specs — closest to the client's exact requirements
   - Prompt B: Elevated version — same specs but with a creative twist (unexpected material combo, dramatic lighting, artistic composition)
   - Prompt C: Editorial/magazine quality — styled as if for Architectural Digest or Elle Decor, with lifestyle elements (books, flowers, coffee cup, morning light)
3. Every prompt MUST include: exact room dimensions context, camera angle, specific materials with finish descriptions, lighting setup, color palette, furniture placement, and technical rendering tags.
4. Use professional interior design and 3D rendering terminology.
5. End each prompt with technical tags: photorealistic, 8K, [render engine], ray tracing, global illumination, physically based materials, [aspect ratio]
6. If reference or sketch images are provided, incorporate their visual elements into the prompts.
7. Account for ceiling height and room proportions to ensure furniture scale is realistic.

OUTPUT FORMAT — respond ONLY with valid JSON, no markdown, no backticks:
{
  "prompts": [
    {
      "label": "Faithful to Specs",
      "description": "Brief 1-line description of this variant's approach",
      "prompt": "The full prompt text here..."
    },
    {
      "label": "Elevated Creative",
      "description": "Brief 1-line description",
      "prompt": "The full prompt text here..."
    },
    {
      "label": "Editorial Magazine",
      "description": "Brief 1-line description",
      "prompt": "The full prompt text here..."
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
    if (refImages.length > 0) msg += `\nREFERENCE IMAGES: ${refImages.length} reference image(s) attached — analyze their style, color palette, materials, and spatial layout to inform the prompts.\n`
    if (sketchImages.length > 0) msg += `SKETCH/FLOOR PLAN: ${sketchImages.length} sketch image(s) attached — use the spatial layout, furniture placement, and proportions shown.\n`
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

    try {
      const contentParts = []
      if (refImages.length > 0 || sketchImages.length > 0) {
        setLoadingStatus('Processing images...')
      }

      for (const img of refImages) {
        const base64 = img.preview.split(',')[1]
        const mimeType = img.file.type || 'image/jpeg'
        contentParts.push({
          inlineData: { mimeType: mimeType, data: base64 }
        })
      }

      for (const img of sketchImages) {
        const base64 = img.preview.split(',')[1]
        const mimeType = img.file.type || 'image/jpeg'
        contentParts.push({
          inlineData: { mimeType: mimeType, data: base64 }
        })
      }

      contentParts.push({ text: buildUserMessage() })

      const isProModel = geminiModel.includes('pro')
      const timeoutMs = isProModel ? 180000 : 90000
      setLoadingStatus(isProModel ? 'Sending to Gemini Pro (may take 30-90s)...' : 'Sending to Gemini Flash (usually 10-30s)...')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: geminiModel,
            body: {
              system_instruction: { parts: [{ text: buildSystemPrompt() }] },
              contents: [{ parts: contentParts }],
              generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                maxOutputTokens: 4096,
              }
            }
          })
        }
      )
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error?.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      setLoadingStatus('Parsing response...')
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) throw new Error('No response from Gemini')

      let parsed;
      try {
        const cleaned = text.replace(/```json\s*/g, '').replace(/```/g, '').trim()
        parsed = JSON.parse(cleaned)
      } catch (e) {
        // Fallback: try to extract just the JSON object/array
        try {
          const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
          if (match) {
            // Fix common truncation issues by adding closing brackets if missing
            let jsonStr = match[0]
            if (jsonStr.endsWith('"}')) { } // Looks okay
            else if (!jsonStr.endsWith('}') && !jsonStr.endsWith(']')) {
               jsonStr += '"}]}' // Blind guess for prompt schema
            }
            // Strip control characters that might break JSON.parse
            jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
            parsed = JSON.parse(jsonStr)
          } else {
            throw e
          }
        } catch (innerError) {
          console.error("Raw response:", text)
          throw new Error('AI returned malformed data. Try re-generating.')
        }
      }

      if (!parsed?.prompts || parsed.prompts.length === 0) {
        throw new Error('Invalid response format')
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

  const handleReset = () => {
    setProjectName(''); setFloor(''); setRoomType(''); setCustomRoomType(''); setStyle(''); setCustomStyle('')
    setMainColors(''); setCeilingHeight(''); setRoomDimensions('')
    setMaterials(''); setKeyFurniture(''); setWindowLight('')
    setLighting(''); setMoodVibe(''); setCameraAngle('')
    setDetailLevel(''); setAspectRatio('')
    setRefImages([]); setSketchImages([])
    setPrompts(null); setError('')
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
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
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
                  <span className="loader"></span>
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
            <p className="results-subtitle">Click copy to use any prompt in your AI image generator</p>
            <div className="prompts-grid">
              {prompts.map((p, i) => (
                <PromptCard 
                  key={i} index={i} prompt={p.prompt} label={p.label} 
                  description={p.description} 
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
