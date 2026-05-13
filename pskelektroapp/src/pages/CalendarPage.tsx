import { useMemo, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'
import { eventTypes, formatDate, todayIso } from '../lib/constants'
import { useAuth } from '../app/AuthContext'
import { useCalendarEvents, useCalendarMutations, useProjects } from '../hooks/useAppData'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import type { CalendarEvent, EventType } from '../types'

const views = ['Mesiac', 'Týždeň', 'Deň'] as const

const emptyForm = () => ({
  title: '',
  type: 'Montáž' as EventType,
  date: todayIso(),
  location: '',
  projectId: '' as string,
})

export function CalendarPage() {
  const { isManager } = useAuth()
  const eventsQuery = useCalendarEvents()
  const projectsQuery = useProjects()
  const { createEvent, updateEvent, deleteEvent } = useCalendarMutations()
  const [view, setView] = useState<(typeof views)[number]>('Mesiac')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data])
  const projects = projectsQuery.data ?? []

  const projectNameById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of projects) map[p.id] = p.name
    return map
  }, [projects])

  const groupedEvents = useMemo(
    () =>
      events.reduce<Record<string, typeof events>>((acc, event) => {
        acc[event.date] = [...(acc[event.date] ?? []), event]
        return acc
      }, {}),
    [events],
  )

  const sortedDayKeys = useMemo(() => Object.keys(groupedEvents).sort((a, b) => a.localeCompare(b)), [groupedEvents])

  const openNewModal = () => {
    if (!isManager) {
      toast.info('Kalendár môže upravovať len projektový manažér.')
      return
    }
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  const openEditModal = (event: CalendarEvent) => {
    if (!isManager) {
      toast.info('Kalendár môže upravovať len projektový manažér.')
      return
    }
    setEditingId(event.id)
    setForm({
      title: event.title,
      type: event.type,
      date: event.date,
      location: event.location,
      projectId: event.projectId ?? '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm())
  }

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
        <button
          type="button"
          className="primary-btn large-btn"
          onClick={openNewModal}
          disabled={!isManager}
          title={!isManager ? 'Pridávať udalosti môže len projektový manažér.' : undefined}
        >
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
            {sortedDayKeys.map((date) => {
              const dayEvents = groupedEvents[date] ?? []
              return (
                <article key={date} className="calendar-day">
                  <strong>{formatDate(date)}</strong>
                  {dayEvents.map((event) => {
                    const stavba =
                      event.projectId && projectNameById[event.projectId]
                        ? projectNameById[event.projectId]
                        : 'Bez priradenej stavby'
                    return (
                      <button
                        key={event.id}
                        type="button"
                        className={`calendar-event${isManager ? ' calendar-event--interactive' : ''}`}
                        onClick={() => openEditModal(event)}
                        title={isManager ? 'Upraviť alebo zmazať udalosť' : undefined}
                      >
                        <span className="calendar-event-type">{event.type}</span>
                        <p className="calendar-event-title">{event.title}</p>
                        <div className="calendar-event-project">{stavba}</div>
                        {event.location ? <small className="calendar-event-location">{event.location}</small> : null}
                      </button>
                    )
                  })}
                </article>
              )
            })}
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        title={editingId ? 'Upraviť udalosť' : 'Nová udalosť'}
        onClose={closeModal}
      >
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault()
            const payload = {
              ...form,
              projectId: form.projectId || null,
            }
            if (editingId) {
              await updateEvent.mutateAsync({ id: editingId, input: payload })
            } else {
              await createEvent.mutateAsync(payload)
            }
            closeModal()
          }}
        >
          <label className="form-field">
            Názov
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
          </label>
          <label className="form-field">
            Typ
            <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as EventType }))}>
              {eventTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Dátum
            <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required />
          </label>
          <label className="form-field">
            Miesto
            <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} required />
          </label>
          <label className="form-field full-span">
            Stavba
            <select value={form.projectId} onChange={(e) => setForm((prev) => ({ ...prev, projectId: e.target.value }))}>
              <option value="">Bez stavby</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions-row full-span">
            {editingId ? (
              <button
                type="button"
                className="ghost-btn danger-outline"
                disabled={deleteEvent.isPending}
                onClick={async () => {
                  if (!editingId) return
                  if (!window.confirm('Naozaj chcete túto udalosť vymazať?')) return
                  await deleteEvent.mutateAsync(editingId)
                  closeModal()
                }}
              >
                Vymazať
              </button>
            ) : (
              <span />
            )}
            <button className="primary-btn large-btn" type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
              {editingId ? 'Uložiť zmeny' : 'Uložiť udalosť'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
