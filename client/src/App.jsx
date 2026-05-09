import { useState } from 'react'
import UploadSection from './components/UploadSection'
import FeedbackSection from './components/FeedbackSection'
import './index.css'

function App() {
    const [feedback, setFeedback] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [fileName, setFileName] = useState('')

    return (
        <div className="app">
            <header className="app-header">
                <div className="logo">
                    <span className="logo-mark">R</span>
                    <span className="logo-name">REVER</span>
                </div>
                <p className="tagline">AI-powered CV review in seconds</p>
            </header>

            <main className="main">
                <UploadSection
                    setFeedback={setFeedback}
                    setLoading={setLoading}
                    setError={setError}
                    setFileName={setFileName}
                    loading={loading}
                />

                {error && <p className="error-msg">{error}</p>}

                {loading && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Reviewing your CV...</p>
                    </div>
                )}

                {feedback && !loading && (
                    <FeedbackSection feedback={feedback} fileName={fileName} />
                )}
            </main>

            <footer className="app-footer">
                <p>Built by <a href="https://github.com/Shumer61" target="_blank">Ryan Shuma</a></p>
            </footer>
        </div>
    )
}

export default App