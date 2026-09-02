
import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkSpam = async () => {
    if (!message.trim()) {
      setResult({
        type: 'error',
        title: 'Message Required',
        text: 'Please enter an email message before analyzing.'
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      if (data.prediction === 'Spam') {
        setResult({
          type: 'spam',
          title: 'Spam Detected',
          text: 'This email has been classified as potentially unwanted or suspicious.',
          confidence: data.confidence,
        })
      } else {
        setResult({
          type: 'safe',
          title: 'Email Looks Safe',
          text: 'This email has been classified as legitimate by the spam detection model.',
          confidence: data.confidence,
        })
      }
    } catch (error) {
      console.error(error)

      setResult({
        type: 'error',
        title: 'Connection Error',
        text: 'Unable to connect to the spam detection server. Make sure the Flask backend is running.'
      })
    }

    setLoading(false)
  }

  const loadExample = (text) => {
    setMessage(text)
    setResult(null)
  }

  return (
    <div className="app">

      {/* Navigation */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>SpamShield</h2>
            <span>AI Email Security</span>
          </div>
        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          Model Online
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section className="hero">
          <div className="hero-badge">
            AI-POWERED EMAIL ANALYSIS
          </div>

          <h1>
            Detect Spam.
            <br />
            <span>Protect Your Inbox.</span>
          </h1>

          <p>
            Analyze suspicious email messages using a machine learning
            model trained to identify spam and legitimate emails.
          </p>
        </section>

        {/* Analyzer */}
        <section className="analyzer-section">

          <div className="analyzer-card">

            <div className="card-header">
              <div>
                <h2>Email Analyzer</h2>
                <p>Paste your email content below for analysis.</p>
              </div>

              <div className="secure-label">
                Secure Analysis
              </div>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste your email message here..."
              className="email-input"
            />

           
<div className="input-footer">
  <span>{message.length} characters</span>

  <div className="button-group">
    <button
      className="clear-button"
      onClick={() => {
        setMessage('')
        setResult(null)
      }}
      disabled={loading || !message}
    >
      Clear
    </button>

    <button
      className="analyze-button"
      onClick={checkSpam}
      disabled={loading}
    >
      {loading ? 'Analyzing...' : 'Analyze Email →'}
    </button>
  </div>
</div>



            {/* Examples */}
            <div className="examples">
              <span>Try an example:</span>

              <button
                onClick={() =>
                  loadExample(
                    'Congratulations! You have won a free prize. Click here now to claim your reward!'
                  )
                }
              >
                Suspicious email
              </button>

              <button
                onClick={() =>
                  loadExample(
                    'Hi, please find attached the meeting agenda for tomorrow. Let me know if you have any questions.'
                  )
                }
              >
                Normal email
              </button>
            </div>

          </div>

          {/* Result */}
          {result && (
            <div className={`result-card ${result.type}`}>

              {result.type === 'spam' && (
                <div className="result-icon">!</div>
              )}

              {result.type === 'safe' && (
                <div className="result-icon">✓</div>
              )}

              {result.type === 'error' && (
                <div className="result-icon">×</div>
              )}

              <div className="result-content">
                <span className="result-label">ANALYSIS RESULT</span>

                <h2>{result.title}</h2>

                <p>{result.text}</p>

                {result.confidence !== undefined && (
                  <div className="confidence">
                    <div className="confidence-header">
                      <span>Model Confidence</span>
                      <strong>{result.confidence}%</strong>
                    </div>

                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{ width: `${result.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </section>

        {/* Features */}
        <section className="features">

          <div className="section-heading">
            <span>WHY SPAMSHIELD</span>
            <h2>Simple. Fast. Intelligent.</h2>
          </div>

          <div className="feature-grid">

            <div className="feature-card">
              <div className="feature-number">01</div>
              <h3>Machine Learning</h3>
              <p>
                Uses a trained Multinomial Naive Bayes model to classify
                incoming email content.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-number">02</div>
              <h3>Instant Analysis</h3>
              <p>
                Submit an email and receive a classification result
                within seconds.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-number">03</div>
              <h3>Confidence Score</h3>
              <p>
                View the model's confidence level alongside every
                prediction.
              </p>
            </div>

          </div>
        </section>

        {/* How it works */}
        <section className="how-section">

          <div className="section-heading">
            <span>HOW IT WORKS</span>
            <h2>From message to prediction.</h2>
          </div>

          <div className="steps">

            <div className="step">
              <div className="step-number">1</div>
              <h3>Enter Email</h3>
              <p>Paste the email content into the analyzer.</p>
            </div>

            <div className="step-line"></div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Process</h3>
              <p>The backend converts the message into model features.</p>
            </div>

            <div className="step-line"></div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Predict</h3>
              <p>The trained ML model determines the email category.</p>
            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer>
        <div>
          <strong>SpamShield</strong>
          <span> AI Email Security</span>
        </div>

        <p>
          Machine Learning Mini Project · AI & Data Science
        </p>
      </footer>

    </div>
  )
}

export default App

