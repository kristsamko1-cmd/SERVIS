interface EmptyStateProps {
  title: string
  text: string
}

export function EmptyState({ title, text }: EmptyStateProps) {
  return (
    <div className="state-box">
      <p className="state-title">{title}</p>
      <p>{text}</p>
    </div>
  )
}
