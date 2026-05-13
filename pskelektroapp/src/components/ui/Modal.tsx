import type { PropsWithChildren, ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps extends PropsWithChildren {
  open: boolean
  title: string
  actions?: ReactNode
  onClose: () => void
}

export function Modal({ open, title, actions, onClose, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-panel" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Zavrieť" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {actions ? <footer className="modal-actions">{actions}</footer> : null}
      </section>
    </div>
  )
}
