import QuantumCasino from '@/components/quantum-casino/QuantumCasino'
import './App.css'

export default function App() {
  return (
    <div className="qc-shell">
      <main className="qc-panel">
        <div className="qc-card">
          <h1>QC RetroUI</h1>
          <p>
            A Vite + React + Tailwind project using shadcn UI components,
            styled with RetroUI theme.
          </p>
        </div>
        <QuantumCasino />
      </main>
    </div>
  )
}
