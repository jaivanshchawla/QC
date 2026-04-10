import { Button } from '@/components/ui/button'
import './App.css'

export default function App() {
  return (
    <div className="qc-shell">
      <main className="qc-panel">
        <div className="qc-card">
          <h1>QC RetroUI</h1>
          <p>
            A Vite + React + Tailwind project using shadcn UI components,
            styled with RetroUI theme variables.
          </p>
          <Button>Launch QC prototype</Button>
        </div>
      </main>
    </div>
  )
}
