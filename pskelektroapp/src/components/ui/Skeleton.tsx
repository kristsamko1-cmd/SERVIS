export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-stack" aria-label="Načítavam">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton-line" />
      ))}
    </div>
  )
}
