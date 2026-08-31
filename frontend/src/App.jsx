import { useState } from 'react'

function App() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const checkSpam = async () => {
    if (!message.trim()) {
      setResult('Please enter an email message.')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
      })

      const data = await response.json()

      if (data.prediction === 'Spam') {
        setResult(`🚨 SPAM\nConfidence: ${data.confidence}%`)
      } else {
        setResult(`✅ NOT SPAM\nConfidence: ${data.confidence}%`)
      }
    } catch (error) {
      setResult('❌ Could not connect to the backend.')
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '50px auto',
        padding: '20px',
        fontFamily: 'Arial',
      }}
    >
      <h1>📧 Email Spam Detector</h1>

      <p>Enter an email message below to check whether it is spam.</p>

      <textarea
        rows="10"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Paste your email message here..."
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '16px',
          boxSizing: 'border-box',
        }}
      />

      <br />
      <br />

      <button
        onClick={checkSpam}
        disabled={loading}
        style={{
          padding: '12px 25px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Checking...' : 'Check Email'}
      </button>

      {result && (
        <pre
          style={{
            marginTop: '25px',
            padding: '20px',
            fontSize: '18px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {result}
        </pre>
      )}
    </div>
  )
}

export default App