
import { useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import './App.css'

function App() {
  console.log("SpamShield App is rendering")
  // -----------------------------
  // Gmail states
  // -----------------------------
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [accessToken, setAccessToken] = useState(null)
  const [emails, setEmails] = useState([])
  const [loadingEmails, setLoadingEmails] = useState(false)

  // -----------------------------
  // Spam detector states
  // -----------------------------
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // -----------------------------
  // Google Login
  // -----------------------------
  const loginWithGmail = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/gmail.readonly',

    onSuccess: (tokenResponse) => {
      console.log('Gmail access granted')

      setAccessToken(tokenResponse.access_token)
      setIsLoggedIn(true)
    },

    onError: () => {
      console.log('Google/Gmail authorization failed')
    },
  })
    const logoutFromGmail = () => {
  setIsLoggedIn(false)
  setAccessToken(null)
  setEmails([])
  setMessage('')
  setResult(null)

  console.log('Gmail disconnected')
  }
  // -----------------------------
  // Decode Gmail message body
  // -----------------------------
  const decodeBase64 = (data) => {
    try {
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
      const decoded = atob(base64)

      return decodeURIComponent(
        decoded
          .split('')
          .map(
            (char) =>
              '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)
          )
          .join('')
      )
    } catch (error) {
      console.error('Error decoding email:', error)
      return ''
    }
  }

  // -----------------------------
  // Find email body
  // -----------------------------
  const getEmailBody = (payload) => {
    if (!payload) return ''

    // Simple email
    if (payload.body?.data) {
      return decodeBase64(payload.body.data)
    }

    // Multipart email
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return decodeBase64(part.body.data)
        }

        // Check nested parts
        if (part.parts) {
          const nestedBody = getEmailBody(part)

          if (nestedBody) {
            return nestedBody
          }
        }
      }
    }

    return ''
  }

  // -----------------------------
  // Fetch individual Gmail message
  // -----------------------------
  const getMessageDetails = async (messageId) => {
    try {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('Message API error:', data)
        return null
      }

      const headers = data.payload?.headers || []

      const subjectHeader = headers.find(
        (header) => header.name.toLowerCase() === 'subject'
      )

      const fromHeader = headers.find(
        (header) => header.name.toLowerCase() === 'from'
      )

      const dateHeader = headers.find(
        (header) => header.name.toLowerCase() === 'date'
      )

      return {
        id: data.id,
        subject: subjectHeader?.value || '(No subject)',
        from: fromHeader?.value || 'Unknown sender',
        date: dateHeader?.value || '',
        body: getEmailBody(data.payload),
      }
    } catch (error) {
      console.error('Error getting email details:', error)
      return null
    }
  }

  // -----------------------------
  // Fetch Gmail inbox
  // -----------------------------
  const fetchEmails = async () => {
    if (!accessToken) {
      console.log('No Gmail access token')
      return
    }

    setLoadingEmails(true)

    try {
      // Get message IDs
      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('Gmail API error:', data)
        setLoadingEmails(false)
        return
      }

      const messageList = data.messages || []

      console.log('Message IDs loaded:', messageList)

      // Get details for every email
      const detailedEmails = await Promise.all(
        messageList.map((email) => getMessageDetails(email.id))
      )

      const validEmails = detailedEmails.filter((email) => email !== null)

      setEmails(validEmails)

      console.log('Detailed emails loaded:', validEmails)
    } catch (error) {
      console.error('Error fetching emails:', error)
    }

    setLoadingEmails(false)
  }

  // -----------------------------
  // Automatically load emails
  // -----------------------------
  useEffect(() => {
    if (accessToken) {
      fetchEmails()
    }
  }, [accessToken])

  // -----------------------------
  // Analyze email with Flask
  // -----------------------------
  const analyzeEmail = async (emailText) => {
    if (!emailText.trim()) {
      setResult({
        type: 'error',
        title: 'Empty Email',
        text: 'This email does not contain readable text to analyze.',
      })

      return
    }

    setMessage(emailText)
    setLoading(true)
    setResult(null)

    try {
     const response = await fetch('https://spamshield-backend-byjx.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: emailText,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed')
      }

      if (data.prediction === 'Spam') {
        setResult({
          type: 'spam',
          title: 'Spam Detected',
          text:
            'This email has been classified as potentially unwanted or suspicious.',
          confidence: data.confidence,
        })
      } else {
        setResult({
          type: 'safe',
          title: 'Email Looks Safe',
          text:
            'This email has been classified as legitimate by the spam detection model.',
          confidence: data.confidence,
        })
      }

      // Scroll to result
      setTimeout(() => {
        document
          .getElementById('analysis-result')
          ?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error('Prediction error:', error)

      setResult({
        type: 'error',
        title: 'Connection Error',
        text:
          'Unable to connect to the spam detection server. Make sure the Flask backend is running.',
      })
    }

    setLoading(false)
  }

  // -----------------------------
  // Manual email analyzer
  // -----------------------------
  const checkSpam = async () => {
    if (!message.trim()) {
      setResult({
        type: 'error',
        title: 'Message Required',
        text: 'Please enter an email message before analyzing.',
      })

      return
    }

    await analyzeEmail(message)
  }

  // -----------------------------
  // Example emails
  // -----------------------------
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

      {/* Main */}
      <main>

        {/* Hero */}
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

        {/* Gmail Connection */}
        {!isLoggedIn && (
          <section className="gmail-section">
            <div className="gmail-card">

              <div className="gmail-icon">
                G
              </div>

              <div className="gmail-content">
                <h2>Connect Your Gmail</h2>

                <p>
                  Connect your Gmail account to automatically analyze
                  emails from your inbox.
                </p>

                <button
                  className="google-login-button"
                  onClick={() => loginWithGmail()}
                >
                  Continue with Google
                </button>
                
              </div>

            </div>
          </section>
        )}

        {/* Gmail Inbox */}
        {isLoggedIn && (
          <section className="gmail-section">

            <div className="gmail-card">

              <div className="gmail-icon">
                ✓
              </div>

              <div className="gmail-content">
                <h2>Gmail Connected</h2>

                <p>
                  Your Gmail account is connected with read-only access.
                </p>

                <button
                  className="google-login-button"
                  onClick={fetchEmails}
                  disabled={loadingEmails}
                >
                  {loadingEmails
                    ? 'Loading Emails...'
                    : 'Load My Emails →'}
                </button>
                 <button
                  className="google-logout-button"
                  onClick={logoutFromGmail}
                >
                  Logout from Gmail
                  </button>
                {emails.length > 0 && (
                  <div className="email-count">
                    {emails.length} emails loaded from Gmail
                  </div>
                )}
              </div>

            </div>

            {/* Email List */}
            {emails.length > 0 && (
              <div className="email-list">

                <div className="email-list-header">
                  <div>
                    <span>YOUR GMAIL INBOX</span>
                    <h2>Recent Emails</h2>
                  </div>

                  <span className="email-total">
                    {emails.length} emails
                  </span>
                </div>

                {emails.map((email, index) => (
                  <div className="email-item" key={email.id}>

                    <div className="email-number">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="email-details">

                      <h3>
                        {email.subject}
                      </h3>

                      <p className="email-from">
                        From: {email.from}
                      </p>

                      {email.date && (
                        <p className="email-date">
                          {email.date}
                        </p>
                      )}

                      <p className="email-preview">
                        {email.body
                          ? email.body
                              .replace(/\s+/g, ' ')
                              .slice(0, 180)
                          : 'No readable email content found.'}
                        {email.body?.length > 180 ? '...' : ''}
                      </p>

                    </div>

                    <button
                      className="email-analyze-button"
                      onClick={() => analyzeEmail(email.body)}
                      disabled={!email.body || loading}
                    >
                      Analyze →
                    </button>

                  </div>
                ))}

              </div>
            )}

          </section>
        )}

        {/* Manual Analyzer */}
        <section className="analyzer-section">

          <div className="analyzer-card">

            <div className="card-header">

              <div>
                <h2>Email Analyzer</h2>

                <p>
                  Paste your email content below for analysis.
                </p>
              </div>

              <div className="secure-label">
                Secure Analysis
              </div>

            </div>

            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setResult(null)
              }}
              placeholder="Paste your email message here..."
              className="email-input"
            />

            <div className="input-footer">

              <span>
                {message.length} characters
              </span>

              <button
                className="analyze-button"
                onClick={checkSpam}
                disabled={loading}
              >
                {loading
                  ? 'Analyzing...'
                  : 'Analyze Email →'}
              </button>

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
            <div
              id="analysis-result"
              className={`result-card ${result.type}`}
            >

              {result.type === 'spam' && (
                <div className="result-icon">
                  !
                </div>
              )}

              {result.type === 'safe' && (
                <div className="result-icon">
                  ✓
                </div>
              )}

              {result.type === 'error' && (
                <div className="result-icon">
                  ×
                </div>
              )}

              <div className="result-content">

                <span className="result-label">
                  ANALYSIS RESULT
                </span>

                <h2>
                  {result.title}
                </h2>

                <p>
                  {result.text}
                </p>

                {result.confidence !== undefined && (
                  <div className="confidence">

                    <div className="confidence-header">

                      <span>
                        Model Confidence
                      </span>

                      <strong>
                        {result.confidence}%
                      </strong>

                    </div>

                    <div className="confidence-bar">

                      <div
                        className="confidence-fill"
                        style={{
                          width: `${result.confidence}%`,
                        }}
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

            <span>
              WHY SPAMSHIELD
            </span>

            <h2>
              Simple. Fast. Intelligent.
            </h2>

          </div>

          <div className="feature-grid">

            <div className="feature-card">

              <div className="feature-number">
                01
              </div>

              <h3>
                Machine Learning
              </h3>

              <p>
                Uses a trained Multinomial Naive Bayes model to classify
                incoming email content.
              </p>

            </div>

            <div className="feature-card">

              <div className="feature-number">
                02
              </div>

              <h3>
                Instant Analysis
              </h3>

              <p>
                Submit an email and receive a classification result
                within seconds.
              </p>

            </div>

            <div className="feature-card">

              <div className="feature-number">
                03
              </div>

              <h3>
                Confidence Score
              </h3>

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

            <span>
              HOW IT WORKS
            </span>

            <h2>
              From message to prediction.
            </h2>

          </div>

          <div className="steps">

            <div className="step">

              <div className="step-number">
                1
              </div>

              <h3>
                Connect Gmail
              </h3>

              <p>
                Securely connect your Gmail account with read-only access.
              </p>

            </div>

            <div className="step-line"></div>

            <div className="step">

              <div className="step-number">
                2
              </div>

              <h3>
                Select Email
              </h3>

              <p>
                Choose an email from your recent Gmail messages.
              </p>

            </div>

            <div className="step-line"></div>

            <div className="step">

              <div className="step-number">
                3
              </div>

              <h3>
                Predict
              </h3>

              <p>
                The trained ML model determines the email category.
              </p>

            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer>

        <div>
          <strong>
            SpamShield
          </strong>

          <span>
            {' '}AI Email Security
          </span>
        </div>

        <p>
          Machine Learning Mini Project · AI & Data Science
        </p>

      </footer>

    </div>
  )
}

export default App

