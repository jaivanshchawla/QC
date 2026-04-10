import QuantumCasino from '@/components/quantum-casino/QuantumCasino'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import './App.css'

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="quantum-casino-theme">
      <div className="qc-shell">
        <main className="qc-panel">
          <Card className="qc-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>QC RetroUI</CardTitle>
                <CardDescription>
                  A Vite + React + Tailwind project using shadcn UI components,
                  styled with RetroUI theme.
                </CardDescription>
              </div>
              <ThemeToggle />
            </CardHeader>
            <CardContent>
              <QuantumCasino />
            </CardContent>
          </Card>
        </main>
      </div>
    </ThemeProvider>
  )
}
