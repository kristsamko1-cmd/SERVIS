interface ProgressBarProps {
  value: number
}

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="progress-track" aria-label="Priebeh">
      <div className="progress-fill" style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  )
}
