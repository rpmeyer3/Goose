// src/App.jsx
import { useState } from 'react'

function App() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:9003/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      })

      const data = await res.json()
      setResponse(data.reply)
    } catch (error) {
      console.error('Error:', error)
      setResponse('Error connecting to backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Frontend ↔️ Backend Test</h1>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter a message"
        style={{ padding: '8px', width: '300px' }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{ padding: '8px 16px', marginLeft: '10px' }}
      >
        {loading ? 'Sending...' : 'Send to Backend'}
      </button>

      {response && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
          <strong>Backend Response:</strong> {response}
        </div>
      )}
    </div>
  )
}

export default App
