# REVER — AI CV Reviewer

Upload your CV and get instant structured feedback powered by GROQ's llama-3.1-8b-instant. Built for job seekers who want honest, specific and actionable insight on their CV before sending it out.

## Live
https://rever-xi.vercel.app/

## What It Does

You upload a PDF CV. Gemini reads it and returns:

- **Overall score** out of 10
- **ATS score** — how well it would pass applicant tracking systems
- **Strengths** — what is working in your favour
- **Weaknesses** — what is holding you back
- **Specific improvements** — concrete changes to make
- **Missing keywords** — terms recruiters and ATS systems look for
- **Verdict** — one sentence hiring recommendation

## Built With
- React (Vite)
- GROQ's llama-3.1-8b-instant
- PDF base64 encoding via FileReader API
- CSS with glassmorphism
- Deployed on Vercel

## Architecture
- Frontend: React (Vite) — deployed on Vercel
- Backend: Node.js + Express — deployed on Render
- The GROQ API call happens server-side so the API key is never exposed to the browser

## How It Works
 PDF is read using the FileReader API and converted to base64. Base64 is then converted to buffer and text is extracted using pdf-parse. Extracted CV text is sent to Groq's Llama 3.1 model with a structured prompt, AI returns JSON with specific, actionable feedback based on the actual CV content ,feedback is parsed and rendered in the UI with glassmorphism styling

No CV data is stored anywhere. Everything happens in the browser session.

## Running Locally

```bash
git clone https://github.com/Shumer61/REVER.git
cd REVER/client
npm install
npm run dev
```

Create `client/.env`:
```
VITE_URL_KEY=my localhost url
```

Get a free API key at cosole.groq.com

## Limitations

- Free tier GROQ has rate limits — if you hit a limit wait a minute and try again
- PDF only, max 5MB
- CV data is not stored — refresh clears the results

## Author
Ryan Shuma — [GitHub](https://github.com/Shumer61) — [LinkedIn](https://www.linkedin.com/in/ryan-shuma-9714712ab/)
