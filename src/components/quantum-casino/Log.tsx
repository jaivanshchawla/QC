
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
  return (
    <div className="qc-log-box">
      {entries.map(entry => (
        <div key={entry.id} className={`qc-log-entry ${entry.hit ? 'hit' : 'miss'}`}>
          #{String(entry.shot).padStart(3, ' ')}  measured |{entry.result}⟩  predicted |{entry.predicted}⟩  {entry.hit ? 'HIT' : 'MISS'}
        </div>
      ))}
    </div>
  )
}