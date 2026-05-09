function ScoreRing({ score, max = 10, label }) {
    const pct = (score / max) * 100
    const color = score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#e53e3e'

    return (
        <div className="score-ring-wrap">
            <svg viewBox="0 0 36 36" className="score-ring">
                <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#2a2a2a"
                    strokeWidth="3"
                />
                <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray={`${pct}, 100`}
                    strokeLinecap="round"
                />
                <text x="18" y="20.5" textAnchor="middle" fontSize="8" fill={color} fontWeight="700">
                    {score}/{max}
                </text>
            </svg>
            <span className="score-label">{label}</span>
        </div>
    )
}

function FeedbackSection({ feedback, fileName }) {
    return (
        <div className="feedback">
            <div className="feedback-header">
                <h2>Review Complete</h2>
                <p className="file-name">📄 {fileName}</p>
            </div>

            <div className="scores-row">
                <ScoreRing score={feedback.score} label="Overall Score" />
                <ScoreRing score={feedback.ats_score} label="ATS Score" />
            </div>

            <div className="summary-box">
                <p>{feedback.summary}</p>
            </div>

            <div className="feedback-grid">
                <div className="feedback-card strengths">
                    <h3>✓ Strengths</h3>
                    <ul>
                        {feedback.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>
                </div>

                <div className="feedback-card weaknesses">
                    <h3>✗ Weaknesses</h3>
                    <ul>
                        {feedback.weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                        ))}
                    </ul>
                </div>

                <div className="feedback-card improvements">
                    <h3>→ Improvements</h3>
                    <ul>
                        {feedback.improvements.map((imp, i) => (
                            <li key={i}>{imp}</li>
                        ))}
                    </ul>
                </div>

                <div className="feedback-card keywords">
                    <h3>⚡ Missing Keywords</h3>
                    <div className="keyword-tags">
                        {feedback.keywords_missing.map((kw, i) => (
                            <span key={i} className="keyword-tag">{kw}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="verdict-box">
                <p>★ {feedback.verdict}</p>
            </div>
        </div>
    )
}

export default FeedbackSection