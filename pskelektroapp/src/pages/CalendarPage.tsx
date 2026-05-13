import { useMemo, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { eventTypes, formatDate, todayIso } from '../lib/constants'
import { useCalendarEvents, useCalendarMutations, useProjects } from '../hooks/useAppData'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import type { EventType } from '../types'

const views = ['Mesiac', 'Týždeň', 'Deň'] as const

export function CalendarPage() {
  const eventsQuery = useCalendarEvents()
  const projectsQuery = useProjects()
  const { createEvent } = useCalendarMutations()
  const [view, setView] = useState<(typeof views)[number]>('Mesiac')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Montáž' as EventType, date: todayIso(), location: '', projectId: '' })
  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data])
  const projects = projectsQuery.data ?? []

  const groupedEvents = useMemo(
    () =>
      events.reduce<Record<string, typeof events>>((acc, event) => {
        acc[event.date] = [...(acc[event.date] ?? []), event]
        return acc
      }, {}),
    [events],
  )

  if (eventsQuery.isLoading) {
    return (
      <section>
        <Skeleton rows={8} />
      </section>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Kalendár</h1>
          <p className="muted">Montáže, obhliadky, stretnutia, termíny a revízie prepojené so stavbami.</p>
        </div>
        <button type="button" className="primary-btn large-btn" onClick={() => setModalOpen(true)}>
          <CalendarPlus size={18} />
          Pridať udalosť
        </button>
      </header>

      <div className="segmented page-segmented">
        {views.map((item) => (
          <button key={item} type="button" className={view === item ? 'active' : ''} onClick={() => setView(item)}>
            {item}
          </button>
        ))}
      </div>

      <Card title={`${view} view`}>
        {events.length === 0 ? (
          <EmptyState title="Žiadne udalosti" text="Pridajte prvú udalosť do kalendára." />
        ) : (
          <div className="calendar-grid">
            {Object.entries(groupedEvents).map(([date, dayEvents]) => (
              <article key={date} className="calendar-day">
                <strong>{formatDate(date)}</strong>
                {dayEvents.map((event) => (
                  <div key={event.id} className="calendar-event" draggable>
                    <span>{event.type}</span>
                    <p>{event.title}</p>
                    <small>{event.location}</small>
                  </div>
                ))}
              </article>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modalOpen} title="Nová udalosť" onClose={() => setModalOpen(false)}>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault()
            await createEvent.mutateAsync({ ...form, projectId: form.projectId || null })
            setForm({ title: '', type: 'Montáž', date: todayIso(), location: '', projectId: '' })
            setModalOpen(false)
          }}
        >
          <label className="form-field">
            Názov
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
          </label>
          <label className="form-field">
            Typ
            <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as EventType }))}>
              {eventTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Dátum
            <input type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} required />
          </label>
          <label className="form-field">
            Miesto
            <input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} required />
          </label>
          <label className="form-field full-span">
            Stavba
            <select value={form.projectId} onChange={(event) => setForm((prev) => ({ ...prev, projectId: event.target.value }))}>
              <option value="">Bez stavby</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-btn large-btn full-span" type="submit">
            Uložiť udalosť
          </button>
        </form>
      </Modal>
    </section>
  )
}
