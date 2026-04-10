import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
      <Tabs value={mode} onValueChange={handleSetMode} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          {Object.keys(MODES).map(m => (
            <TabsTrigger key={m} value={m} className="text-xs">
              {MODES[m].label.split(' — ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(MODES).map(m => (
          <TabsContent key={m} value={m} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Game Card */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {MODES[m].label}
                      <Badge variant="secondary">{shots} shots</Badge>
                    </CardTitle>
                    <CardDescription dangerouslySetInnerHTML={{ __html: MODES[m].desc }} />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Circuit Display */}
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <div className="text-sm font-mono text-center" dangerouslySetInnerHTML={{ __html: MODES[m].circuit() }} />
                    </div>

                    {/* Coin/Entanglement Display */}
                    <div className="flex justify-center">
                      {m === 'entangle' ? (
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <div className="text-6xl mb-2">{entQubits.q0}</div>
                            <Badge variant="outline">q0</Badge>
                          </div>
                          <div className="text-center">
                            <div className="text-4xl text-primary mb-2" style={{ color: entLinkColor }}>⊕</div>
                            <div className="text-xs text-muted-foreground">entangled</div>
                          </div>
                          <div className="text-center">
                            <div className="text-6xl mb-2">{entQubits.q1}</div>
                            <Badge variant="outline">q1</Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className={`text-8xl transition-all duration-300 ${coinState === 'win' ? 'text-green-500' : coinState === 'loss' ? 'text-red-500' : ''}`}>
                            ⚇
                          </div>
                          <Badge variant="outline" className="mt-2">
                            {coinState === 'superposition' ? 'Superposition' :
                             coinState === 'spinning' ? 'Measuring...' :
                             coinState === 'win' ? 'Correct!' : 'Wrong'}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Result Message */}
                    {resultMsg && (
                      <div className={`text-center p-3 rounded-lg border ${
                        coinState === 'win' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200' :
                        'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
                      }`}>
                        {resultMsg}
                      </div>
                    )}

                    {/* Prediction Buttons */}
                    <div className="flex gap-3 justify-center">
                      {MODES[m].predict.slice(0, 2).map((p, i) => (
                        <Button
                          key={i}
                          variant={prediction === i ? "default" : "outline"}
                          onClick={() => handleSetPrediction(i)}
                          className="flex-1"
                        >
                          {p}
                        </Button>
                      ))}
                    </div>

                    {/* Run Circuit Button */}
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={prediction === null || pending}
                      onClick={runCircuit}
                    >
                      {pending ? 'Measuring quantum state...' : prediction !== null ? 'Collapse the wave function ↓' : 'Pick a side to measure'}
                    </Button>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{shots}</div>
                          <p className="text-xs text-muted-foreground">Total Shots</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-green-600">{score}</div>
                          <p className="text-xs text-muted-foreground">Correct</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{shots > 0 ? `${accuracy}%` : '—'}</div>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Log */}
                <Card>
                  <CardHeader>
                    <CardTitle>Measurement Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Log entries={logEntries} />
                  </CardContent>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Histogram */}
                <Card>
                  <CardHeader>
                    <CardTitle>Measurement Histogram</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {shots === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No measurements yet
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {MODES[m].outcomes.filter(o => MODES[m].probs[MODES[m].outcomes.indexOf(o)] > 0 || counts[o]).map((o) => {
                          const n = counts[o] || 0
                          const pct = Math.round((n / shots) * 100)
                          const theoretical = Math.round((MODES[m].probs[MODES[m].outcomes.indexOf(o)] || 0) * 100)
                          return (
                            <div key={o} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-mono">|{o}⟩</span>
                                <span className="text-muted-foreground">
                                  {n} ({pct}%) / theory {theoretical}%
                                </span>
                              </div>
                              <Progress value={pct} className="h-2" />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quantum Theory */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quantum Concept</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: MODES[m].theory }} />
                  </CardContent>
                </Card>

                {/* Convergence Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Convergence Chart</CardTitle>
                    <CardDescription>
                      Probability convergence over measurements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConvergenceChart history={history} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}