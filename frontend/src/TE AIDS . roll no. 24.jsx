import { useState } from "react";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");

  const checkEmail = () => {
    alert("Email received! AI prediction will be connected next.");
  };

  return (
    <div className="app">
      <div className="card">
        <h1>📧 Email Spam Detector</h1>

        <p className="subtitle">
          AI-powered email classification
        </p>

        <textarea
          placeholder="Paste your email message here..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          rows="10"
        />

        <button onClick={checkEmail}>
          Check Email
        </button>
      </div>
    </div>
  );
}

export default App;