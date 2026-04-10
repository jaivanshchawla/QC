
import { Badge } from '@/components/ui/badge'

interface LogEntry {
  id: number
  result: string
  predicted: string
  hit: boolean
  shot: number
}

interface LogProps {
  entries: LogEntry[]
}

export default function Log({ entries }: LogProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No measurements yet. Make a prediction and run the circuit!
      </div>
    )
  }

  return (
    <div className="max-h-64 overflow-y-auto space-y-2">
      {entries.map(entry => (
        <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="w-12 justify-center">
              #{entry.shot}
            </Badge>
            <div className="font-mono text-sm">
              measured <span className="font-semibold">|{entry.result}⟩</span>
              <span className="mx-2 text-muted-foreground">→</span>
              predicted <span className="font-semibold">|{entry.predicted}⟩</span>
            </div>
          </div>
          <Badge variant={entry.hit ? "default" : "destructive"}>
            {entry.hit ? "✓ HIT" : "✗ MISS"}
          </Badge>
        </div>
      ))}
    </div>
  )
}