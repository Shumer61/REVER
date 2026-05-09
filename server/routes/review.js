const express = require('express')
const router = express.Router()

router.post('/', async (req, res) => {
    console.log('Review route hit')
    console.log('Base64 length:', req.body.base64?.length)

    try {
        const { base64, mimeType } = req.body

        if(!base64) {
            return res.status(400).json({ message: 'No file data received' })
        }

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
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                inline_data: {
                                    mime_type: mimeType || 'application/pdf',
                                    data: base64
                                }
                            },
                            { text: prompt }
                        ]
                    }]
                })
            }
        )

        console.log('Gemini status:', response.status)

        if(response.status === 429) {
            return res.status(429).json({ message: 'Service busy — please try again in a moment' })
        }

        if(!response.ok) {
            const errText = await response.text()
            console.log('Gemini error body:', errText)
            return res.status(500).json({ message: 'Could not reach review service' })
        }

        const data = await response.json()
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text

        if(!raw) {
            console.log('Full Gemini response:', JSON.stringify(data))
            return res.status(500).json({ message: 'No response from reviewer' })
        }

        const clean = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)
        res.json(parsed)

    } catch(error) {
        console.warn('review route error:', error.message)
        console.warn('full error:', error)
        res.status(500).json({ message: 'Something went wrong' })
    }
})

module.exports = router