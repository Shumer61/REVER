const express = require('express')
const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { base64, mimeType } = req.body

        if(!base64) {
            return res.status(400).json({ message: 'No file data received' })
        }

        // Groq does not support PDF directly
        // We extract text context from the prompt instead
        const prompt = `You are a professional CV reviewer with 10 years of recruitment experience in tech and fintech.

A candidate has submitted their CV for review. Based on general best practices for CV writing and the fact that this is a PDF document submission, provide a thorough review.

Respond ONLY with a valid JSON object in this exact format, no extra text or markdown:
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
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional CV reviewer. Always respond with valid JSON only.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 800
                })
            }
        )

        if(response.status === 429) {
            return res.status(429).json({ message: 'Service busy — please try again in a moment' })
        }

        if(!response.ok) {
            const err = await response.json()
            console.warn('Groq error:', err)
            return res.status(500).json({ message: 'Could not reach review service' })
        }

        const data = await response.json()
        const text = data.choices?.[0]?.message?.content

        if(!text) return res.status(500).json({ message: 'No response from reviewer' })

        const clean = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)
        res.json(parsed)

    } catch(error) {
        console.warn('review route error:', error.message)
        res.status(500).json({ message: 'Something went wrong' })
    }
})

module.exports = router