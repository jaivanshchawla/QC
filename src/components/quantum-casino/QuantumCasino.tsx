import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Log from './Log'
import ConvergenceChart from './ConvergenceChart'
import './QuantumCasino.css'

interface ModeConfig {
  label: string
  circuit: () => string
  outcomes: string[]
  probs: number[]
  predict: string[]
  desc: string
  theory: string
  coins: string[]
}

const MODES: Record<string, ModeConfig> = {
  super: {
    label: 'Superposition — H Gate',
    circuit: () => `|0⟩ ——[<span class="qc-gate qc-gate-h">H</span>]——[<span class="qc-gate qc-gate-m">M</span>]——<br><span style="color:var(--muted)">// H|0⟩ = (|0⟩+|1⟩)/√2 → P(0)=0.5, P(1)=0.5</span>`,
    outcomes: ['0', '1'],
    probs: [0.5, 0.5],
    predict: ['🍀 Heads |0⟩', '🌑 Tails |1⟩'],
    desc: `<strong>Hadamard gate</strong> creates equal superposition. The qubit exists as both |0⟩ and |1⟩ simultaneously until measured.`,
    theory: `The H gate transforms the basis state:<br><br><code style="font-family:var(--mono);color:var(--accent)">H|0⟩ = (|0⟩ + |1⟩) / √2 = |+⟩</code><br><br>This is the <em>|+⟩</em> state — 50% probability of measuring either outcome. No strategy can beat chance here. This is <strong>true randomness</strong>, unlike classical pseudo-random numbers.`,
    coins: ['🍀', '🌑']
  },
  phase: {
    label: 'Phase Kickback — Z Gate',
    circuit: () => `|0⟩ ——[<span class="qc-gate qc-gate-h">H</span>]——[<span class="qc-gate qc-gate-z">Z</span>]——[<span class="qc-gate qc-gate-h">H</span>]——[<span class="qc-gate qc-gate-m">M</span>]——<br><span style="color:var(--muted)">// H·Z·H|0⟩ = X|0⟩ = |1⟩ → P(1)≈1.0</span>`,
    outcomes: ['0', '1'],
    probs: [0.05, 0.95],
    predict: ['|0⟩ (wrong!)', '|1⟩ (correct)'],
    desc: `<strong>Phase gate (Z)</strong> flips phase in superposition. Sandwiched between two H gates, it becomes an X (NOT) gate — the qubit is deterministically |1⟩.`,
    theory: `Z gate applies a phase flip: Z|1⟩ = -|1⟩. Invisible alone, but in superposition it becomes observable:<br><br><code style="font-family:var(--mono);color:var(--accent)">H·Z·H = X (Pauli-X / NOT gate)</code><br><br>This is <strong>phase kickback</strong> — the phase encoded in superposition changes the measurement basis. The qubit should almost always collapse to <strong>|1⟩</strong>.`,
    coins: ['❌', '✅']
  },
  entangle: {
    label: 'Entanglement — Bell State',
    circuit: () => `q0: |0⟩ ——[<span class="qc-gate qc-gate-h">H</span>]——●——[<span class="qc-gate qc-gate-m">M</span>]——<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br>q1: |0⟩ ———————[<span class="qc-gate qc-gate-cx">CX</span>]——[<span class="qc-gate qc-gate-m">M</span>]——<br><span style="color:var(--muted)">// |Φ+⟩ = (|00⟩+|11⟩)/√2 → P(00)=P(11)=0.5</span>`,
    outcomes: ['00', '11', '01', '10'],
    probs: [0.5, 0.5, 0, 0],
    predict: ['|00⟩ both 0', '|11⟩ both 1'],
    desc: `<strong>CNOT gate</strong> entangles two qubits into the Bell state |Φ+⟩. Measuring one instantly determines the other — only |00⟩ or |11⟩ can occur.`,
    theory: `The Bell state is created by H + CNOT:<br><br><code style="font-family:var(--mono);color:var(--accent)">|Φ+⟩ = (|00⟩ + |11⟩) / √2</code><br><br>Outcomes |01⟩ and |10⟩ are <strong>forbidden</strong> — probability exactly 0. The qubits are correlated no matter how far apart. This is Einstein's "spooky action at a distance."`,
    coins: ['🔵🔵', '🔴🔴']
  },
  composite: {
    label: 'Composite — H + X Gate',
    circuit: () => `|0⟩ ——[<span class="qc-gate qc-gate-h">H</span>]——[<span class="qc-gate qc-gate-x">X</span>]——[<span class="qc-gate qc-gate-m">M</span>]——<br><span style="color:var(--muted)">// X|+⟩ = |+⟩ → still 50/50! Gate order matters.</span>`,
    outcomes: ['0', '1'],
    probs: [0.5, 0.5],
    predict: ['|0⟩ Heads', '|1⟩ Tails'],
    desc: `<strong>H then X</strong> still gives superposition! X|+⟩ = |+⟩ — the X gate preserves the |+⟩ state. But X then H gives |-⟩, different phase, same statistics.`,
    theory: `Gate order matters:<br><br><code style="font-family:var(--mono);color:var(--accent)">H·X|0⟩ = H|1⟩ = |-⟩</code><br><code style="font-family:var(--mono);color:var(--accent)">X·H|0⟩ = X|+⟩ = |+⟩</code><br><br>Both give 50/50 measurement stats, but they are <strong>different quantum states</strong>. |+⟩ and |-⟩ differ by a phase of π — invisible to measurement but detectable via interference.`,
    coins: ['🍀', '🌑']
  }
}

export default function QuantumCasino() {
  const [mode, setMode] = useState('super')
  const [prediction, setPrediction] = useState<number | null>(null)
  const [shots, setShots] = useState(0)
  const [score, setScore] = useState(0)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [history, setHistory] = useState<number[]>([])
  const [entQubits, setEntQubits] = useState({ q0: '⚇', q1: '⚇' })
  const [entLinkColor, setEntLinkColor] = useState('var(--destructive)')
  const [logEntries, setLogEntries] = useState<Array<{id: number, result: string, predicted: string, hit: boolean, shot: number}>>([])
  const [resultMsg, setResultMsg] = useState('')
  const [coinState, setCoinState] = useState('superposition')
  const [pending, setPending] = useState(false)

  const cfg = MODES[mode]

  const handleSetMode = (newMode: string) => {
    setMode(newMode)
    setPrediction(null)
    setShots(0)
    setScore(0)
    setCounts({})
    setHistory([])
    setResultMsg('')
    setCoinState('superposition')
    setEntQubits({ q0: '⚇', q1: '⚇' })
    setEntLinkColor('var(--destructive)')
  }

  const handleSetPrediction = (value: number) => {
    setPrediction(value)
  }

  const sampleOutcome = () => {
    const r = Math.random()
    let cum = 0
    for (let i = 0; i < cfg.outcomes.length; i++) {
      cum += cfg.probs[i]
      if (r < cum) return cfg.outcomes[i]
    }
    return cfg.outcomes[cfg.outcomes.length - 1]
  }

  const runCircuit = () => {
    if (prediction === null || pending) return
    setPending(true)
    setCoinState('spinning')

    if (mode === 'entangle') {
      setEntQubits({ q0: '🌑', q1: '🌑' })
      setEntLinkColor('var(--primary)')
    }

    setTimeout(() => {
      const result = sampleOutcome()
      const predOutcome = cfg.outcomes[prediction]
      const hit = result === predOutcome
      if (hit) setScore(prev => prev + 1)
      setShots(prev => prev + 1)

      setCounts(prev => ({ ...prev, [result]: (prev[result] || 0) + 1 }))

      const key0 = cfg.outcomes[0]
      const total = Object.values(counts).reduce((a, b) => a + b, 0) + 1
      const newHistory = [...history, (counts[key0] || 0) / total]
      if (newHistory.length > 20) newHistory.shift()
      setHistory(newHistory)

      if (mode === 'entangle') {
        const bits = result.split('')
        setEntQubits({
          q0: bits[0] === '0' ? '🔵' : '🔴',
          q1: bits[1] === '0' ? '🔵' : '🔴'
        })
        setEntLinkColor(hit ? 'var(--win)' : 'var(--loss)')
      } else {
        setCoinState(hit ? 'win' : 'loss')
      }

      setResultMsg(`|${result}⟩ measured — ${hit ? '✓ correct!' : '✗ wrong'}`)
      setLogEntries(prev => [{
        id: Date.now(),
        result,
        predicted: predOutcome,
        hit,
        shot: shots + 1
      }, ...prev.slice(0, 19)])

      setTimeout(() => {
        if (mode !== 'entangle') {
          setCoinState('superposition')
        }
        setPrediction(null)
        setPending(false)
      }, 1200)
    }, 650)
  }

  const accuracy = shots > 0 ? Math.round((score / shots) * 100) : 0

  return (
    <div className="qc-container">
      <div className="qc-tabs">
        {Object.keys(MODES).map(m => (
          <button
            key={m}
            className={`qc-tab ${mode === m ? 'active' : ''}`}
            onClick={() => handleSetMode(m)}
          >
            {MODES[m].label.split(' — ')[0]}
          </button>
        ))}
      </div>

      <div className="qc-grid">
        <div className="qc-main-card">
          <div className="qc-mode-desc" dangerouslySetInnerHTML={{ __html: cfg.desc }} />
          <div className="qc-circuit" dangerouslySetInnerHTML={{ __html: cfg.circuit() }} />
          <div className="qc-coin-area">
            {mode === 'entangle' ? (
              <div className="qc-ent-pair">
                <div className="qc-ent-qubit" id="q0">{entQubits.q0}</div>
                <div className="qc-ent-link" style={{ color: entLinkColor }}>⊕<br />entangled</div>
                <div className="qc-ent-qubit" id="q1">{entQubits.q1}</div>
              </div>
            ) : (
              <div className="qc-coin-wrap">
                <div className={`qc-coin ${coinState}`} id="main-coin">⚇</div>
              </div>
            )}
          </div>
          <div className="qc-result-msg" style={{ color: coinState === 'win' ? 'var(--win)' : coinState === 'loss' ? 'var(--loss)' : 'inherit' }}>
            {resultMsg}
          </div>
          <div className="qc-pred-row">
            {cfg.predict.slice(0, 2).map((p, i) => (
              <button
                key={i}
                className={`qc-pred-btn ${prediction === i ? 'selected' : ''}`}
                onClick={() => handleSetPrediction(i)}
              >
                {p}
              </button>
            ))}
          </div>
          <Button
            className="qc-flip-btn"
            disabled={prediction === null || pending}
            onClick={runCircuit}
          >
            {pending ? 'Measuring…' : prediction !== null ? 'Collapse the wave function ↓' : 'Pick a side to measure'}
          </Button>
          <div className="qc-stats-grid">
            <div className="qc-stat-card">
              <div className="qc-stat-label">shots</div>
              <div className="qc-stat-val">{shots}</div>
            </div>
            <div className="qc-stat-card">
              <div className="qc-stat-label">score</div>
              <div className="qc-stat-val" style={{ color: 'var(--win)' }}>{score}</div>
            </div>
            <div className="qc-stat-card">
              <div className="qc-stat-label">hit rate</div>
              <div className="qc-stat-val">{shots > 0 ? `${accuracy}%` : '—'}</div>
            </div>
          </div>
          <Log entries={logEntries} />
        </div>

        <div className="qc-side-cards">
          <div className="qc-card">
            <div className="qc-section-title">measurement histogram</div>
            <div id="histogram">
              {shots === 0 ? (
                <div className="qc-no-data">no shots yet</div>
              ) : (
                cfg.outcomes.filter(o => cfg.probs[cfg.outcomes.indexOf(o)] > 0 || counts[o]).map((o, i) => {
                  const n = counts[o] || 0
                  const pct = Math.round((n / shots) * 100)
                  const theoretical = Math.round((cfg.probs[cfg.outcomes.indexOf(o)] || 0) * 100)
                  const colors = ['var(--accent)', 'var(--accent2)', 'var(--accent3)', '#f0c040']
                  return (
                    <div key={o} className="qc-bar-row">
                      <div className="qc-bar-meta">
                        <span>|{o}⟩ <span className="qc-theory">theory {theoretical}%</span></span>
                        <span>{n} shots ({pct}%)</span>
                      </div>
                      <div className="qc-bar-track">
                        <div className="qc-bar-fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="qc-card">
            <div className="qc-section-title">quantum concept</div>
            <div className="qc-theory-box" dangerouslySetInnerHTML={{ __html: cfg.theory }} />
          </div>

          <ConvergenceChart history={history} />
        </div>
      </div>
    </div>
  )
}