# REVER — AI CV Reviewer

Upload your CV and get instant structured feedback powered by Google Gemini. Built for job seekers who want honest, specific and actionable insight on their CV before sending it out.

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
- Google Gemini 2.5 Flash API
- PDF base64 encoding via FileReader API
- CSS with glassmorphism
- Deployed on Vercel

## Architecture
- Frontend: React (Vite) — deployed on Vercel
- Backend: Node.js + Express — deployed on Render
- The Gemini API call happens server-side so the API key is never exposed to the browser

## How It Works

The CV is read client-side using the FileReader API and converted to base64. That base64 data is sent directly to the Gemini API alongside a structured prompt instructing the model to return JSON only. The response is parsed and rendered into the feedback UI.

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
VITE_GEMINI_KEY=your_gemini_api_key
```

Get a free API key at aistudio.google.com.

## Limitations

- Free tier Gemini has rate limits — if you hit a limit wait a minute and try again
- PDF only, max 5MB
- CV data is not stored — refresh clears the results

## Author
Ryan Shuma — [GitHub](https://github.com/Shumer61) — [LinkedIn](https://www.linkedin.com/in/ryan-shuma-9714712ab/)
