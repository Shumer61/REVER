import { useRef } from 'react'

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

            const response = await fetch(`${import.meta.env.VITE_API_URL}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    base64,
                    mimeType: file.type
                })
            })

            if(response.status === 429) {
                setError('Service busy — please try again in a moment.')
                setLoading(false)
                return
            }

            if(!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                setError(errorData.message || 'Could not reach the review service.')
                setLoading(false)
                return
            }

            const parsed = await response.json()
            setFeedback(parsed)
            
            // Show warning if PDF had poor text extraction
            if (parsed._warning) {
                setError(parsed._warning)
                setTimeout(() => setError(''), 3000)
            }

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