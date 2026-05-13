import type { PropsWithChildren, ReactNode } from 'react'

interface CardProps extends PropsWithChildren {
  title?: string
  actions?: ReactNode
}

export function Card({ title, actions, children }: CardProps) {
  return (
    <section className="card">
      {(title || actions) && (
        <header className="card-header">
          {title ? <h3>{title}</h3> : <span />}
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}
