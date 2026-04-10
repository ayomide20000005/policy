// src/App.jsx
import { useState } from 'react'
import './index.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function App() {
  const [form, setForm] = useState({
    domain: '',
    useCase: '',
    safetyLevel: 'medium',
    model: 'llama3'
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGenerate = async () => {
    if (!form.domain || !form.useCase) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${BACKEND_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleCopy = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (result?.code) {
      const blob = new Blob([result.code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'policy_reasoning_pipeline.py'
      a.click()
    }
  }

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-tag">POLICY - AI Safety Infrastructure</div>
          <h1>Generate reasoning<br /><span>architectures</span> for safer AI.</h1>
          <p className="hero-desc">
            Policy generates structured, auditable reasoning pipelines that constrain how AI systems think — making their decision process transparent, predictable, and safe.
          </p>
          <div className="hero-points">
            <div className="hero-point">
              <div className="hero-point-dot" />
              <span>Domain-specific reasoning frameworks built automatically</span>
            </div>
            <div className="hero-point">
              <div className="hero-point-dot" />
              <span>Safety checkpoints embedded at every reasoning step</span>
            </div>
            <div className="hero-point">
              <div className="hero-point-dot" />
              <span>Exportable Python pipeline ready to drop into any AI system</span>
            </div>
          </div>
        </div>
      </section>

      {/* TOOL */}
      <section className="tool-section">
        <div className="container">
          <div className="tool-grid">

            {/* INPUT */}
            <div className="panel">
              <div className="panel-title">Define your AI system</div>

              <div className="form-group">
                <label className="form-label">Domain</label>
                <input
                  className="form-input"
                  name="domain"
                  value={form.domain}
                  onChange={handleChange}
                  placeholder="e.g. Medical diagnosis, Legal reasoning, Finance"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Use Case</label>
                <textarea
                  className="form-textarea"
                  name="useCase"
                  value={form.useCase}
                  onChange={handleChange}
                  placeholder="Describe what your AI system needs to do and what decisions it will make..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Safety Level</label>
                <select
                  className="form-select"
                  name="safetyLevel"
                  value={form.safetyLevel}
                  onChange={handleChange}
                >
                  <option value="low">Low — minimal checkpoints</option>
                  <option value="medium">Medium — standard safety gates</option>
                  <option value="high">High — strict auditing at every step</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Model</label>
                <select
                  className="form-select"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                >
                  <option value="llama3">Llama 3</option>
                  <option value="mistral">Mistral</option>
                  <option value="gemini">Gemini</option>
                  <option value="gpt4">GPT-4</option>
                </select>
              </div>

              <button
                className="generate-btn"
                onClick={handleGenerate}
                disabled={loading || !form.domain || !form.useCase}
              >
                {loading ? 'Generating...' : 'Generate Architecture'}
              </button>
            </div>

            {/* OUTPUT */}
            <div className="panel output-panel">
              <div className="panel-title">Reasoning Architecture</div>

              {!result && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">◈</div>
                  <p>Your generated reasoning architecture will appear here</p>
                </div>
              )}

              {loading && (
                <div className="loading-state">
                  <div className="spinner" />
                  <p style={{ fontSize: '0.85rem' }}>Generating architecture...</p>
                </div>
              )}

              {result && (
                <>
                  {/* DIAGRAM */}
                  <div className="diagram-section">
                    <div className="diagram-title">Reasoning Flow</div>
                    <div className="diagram-flow">
                      {result.steps?.map((step, i) => (
                        <div className="diagram-step" key={i}>
                          <div className="step-connector">
                            <div className="step-circle">{i + 1}</div>
                            {i < result.steps.length - 1 && <div className="step-line" />}
                          </div>
                          <div className="step-content">
                            <div className="step-name">{step.name}</div>
                            <div className="step-desc">{step.description}</div>
                            {step.safety_check && (
                              <span className="step-safety">Safety Gate</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CODE */}
                  <div className="code-section">
                    <div className="code-header">
                      <div className="code-title">Python Pipeline</div>
                      <div className="code-actions">
                        <button className="code-btn" onClick={handleCopy}>
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button className="code-btn" onClick={handleDownload}>
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="code-block">
                      <pre>{result.code}</pre>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          Policy — AI Safety Infrastructure 
        </div>
      </footer>
    </>
  )
}