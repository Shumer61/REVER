const express = require('express')
const router = express.Router()
// Fix: Proper way to import pdf-parse
const pdfParse = require('pdf-parse')

router.post('/', async (req, res) => {
    try {
        const { base64, mimeType } = req.body

        if(!base64) {
            return res.status(400).json({ message: 'No file data received' })
        }

        // Step 1: Convert base64 to PDF buffer and extract text
        let cvText = ''
        try {
            const pdfBuffer = Buffer.from(base64, 'base64')
            // Fix: Call pdfParse as a function with the buffer
            const pdfData = await pdfParse(pdfBuffer)
            cvText = pdfData.text
            
            // Check if we got meaningful text
            if (!cvText || cvText.trim().length < 50) {
                console.warn('PDF text extraction returned very little content. Length:', cvText?.length)
            }
            
            // Trim to avoid token limits (Llama 3.1 8B has ~8K context)
            const maxChars = 6000
            if (cvText.length > maxChars) {
                cvText = cvText.substring(0, maxChars) + '\n...[CV truncated due to length]'
            }
            
            console.log(`Successfully extracted ${cvText.length} characters from PDF`)
            
        } catch (pdfError) {
            console.error('PDF extraction error:', pdfError)
            return res.status(400).json({ 
                message: 'Could not read PDF. Make sure it has selectable text (not a scanned image).' 
            })
        }

        // Step 2: Build prompt with ACTUAL CV content
        const prompt = `You are a professional CV reviewer with 10 years of recruitment experience in tech and fintech.

Analyze this CV and provide specific, actionable feedback based on its actual content:

--- CV START ---
${cvText}
--- CV END ---

Respond ONLY with a valid JSON object in this exact format, no extra text or markdown:
{
  "score": number (0-10, be realistic and specific to this CV),
  "summary": "One sentence overall assessment specific to this candidate",
  "strengths": ["specific strength from CV", "another strength", "third strength"],
  "weaknesses": ["specific weakness from CV", "another weakness", "third weakness"],
  "improvements": ["actionable improvement 1", "improvement 2", "improvement 3"],
  "keywords_missing": ["keyword missing from this CV", "another missing keyword"],
  "ats_score": number (0-10, how ATS-friendly is this specific CV),
  "verdict": "One sentence hiring recommendation based on this specific CV"
}

Important: Base your feedback on the ACTUAL CV content above, not generic advice. Reference specific skills, jobs, or sections from the CV.`

        // Step 3: Call Groq with the CV content
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
                            content: 'You are a professional CV reviewer. Always respond with valid JSON only. Base your feedback on the actual CV content provided.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 1200
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

        // Clean and parse JSON
        const clean = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)
        
        // Add a warning if text extraction was poor
        if (cvText.length < 100) {
            parsed._warning = "PDF had limited extractable text. For best results, use a PDF with selectable text (not a scanned image)."
        }
        
        res.json(parsed)

    } catch(error) {
        console.error('review route error:', error.message)
        // More detailed error for debugging
        if (error instanceof SyntaxError) {
            return res.status(500).json({ message: 'Failed to parse AI response. Please try again.' })
        }
        res.status(500).json({ message: 'Something went wrong. Please try again.' })
    }
})

module.exports = router