import { useRef } from 'react'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY

function UploadSection({ setFeedback, setLoading, setError, setFileName, loading }) {
    const inputRef = useRef()

    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
    })

    const handleFile = async (file) => {
        if(!file) return
        if(file.type !== 'application/pdf') {
            setError('Please upload a PDF file.')
            return
        }
        if(file.size > 5 * 1024 * 1024) {
            setError('File too large. Please upload a CV under 5MB.')
            return
        }

        setError('')
        setFeedback(null)
        setLoading(true)
        setFileName(file.name)

        try {
            const base64 = await toBase64(file)

            const prompt = `You are a professional CV reviewer with 10 years of experience in recruitment across tech and fintech. 
            
Review this CV thoroughly and respond ONLY with a valid JSON object in this exact format, no extra text or markdown:
{
  "score": 7,
  "summary": "One sentence overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "keywords_missing": ["keyword 1", "keyword 2"],
  "ats_score": 6,
  "verdict": "One sentence hiring recommendation"
}`

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    inline_data: {
                                        mime_type: 'application/pdf',
                                        data: base64
                                    }
                                },
                                { text: prompt }
                            ]
                        }]
                    })
                }
            )

            if(response.status === 429) {
                setError('Service busy — please try again in a moment.')
                setLoading(false)
                return
            }

            if(!response.ok) {
                setError('Could not reach the review service.')
                setLoading(false)
                return
            }

            const data = await response.json()
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text

            if(!raw) {
                setError('No response received. Please try again.')
                setLoading(false)
                return
            }

            const clean = raw.replace(/```json|```/g, '').trim()
            const parsed = JSON.parse(clean)
            setFeedback(parsed)

        } catch(err) {
            setError('Something went wrong. Please try again.')
            console.warn('REVER error:', err)
        }

        setLoading(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        handleFile(file)
    }

    const handleDragOver = (e) => e.preventDefault()

    return (
        <div className="upload-section">
            <div
                className="drop-zone"
                onClick={() => inputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="drop-icon">📄</div>
                <h2>Drop your CV here</h2>
                <p>or click to browse — PDF only, max 5MB</p>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFile(e.target.files[0])}
                />
            </div>
        </div>
    )
}

export default UploadSection