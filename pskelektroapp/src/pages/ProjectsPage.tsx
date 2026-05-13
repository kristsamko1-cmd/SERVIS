import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Archive, Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../app/AuthContext'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Skeleton } from '../components/ui/Skeleton'
import { formatCurrency, formatDate, projectPriorities, projectStatuses, todayIso } from '../lib/constants'
import { useProjectMutations, useProjects, useWorkers } from '../hooks/useAppData'
import type { Project, ProjectPriority, ProjectStatus } from '../types'

const projectSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(2),
  investor: z.string().optional(),
  description: z.string().optional(),
  status: z.custom<ProjectStatus>(),
  priority: z.custom<ProjectPriority>(),
  progress: z.number().min(0).max(100),
  budget: z.number().min(0),
  deadline: z.string().min(1),
  notes: z.string().optional(),
  workerIds: z.array(z.string()),
})

const blankForm = {
  name: '',
  address: '',
  investor: '',
  description: '',
  status: 'Plánované' as ProjectStatus,
  priority: 'Stredná' as ProjectPriority,
  progress: 0,
  budget: 0,
  deadline: todayIso(),
  notes: '',
  workerIds: [] as string[],
}

export function ProjectsPage() {
  const { isManager } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProjectStatus | 'Všetky'>('Všetky')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [form, setForm] = useState(blankForm)
  const projectsQuery = useProjects()
  const workersQuery = useWorkers()
  const { createProject, updateProject, archiveProject, removeProject } = useProjectMutations()
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data])
  const workers = workersQuery.data ?? []
  const modalOpen = searchParams.get('nova') === '1' || Boolean(editingProject)

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const matchesSearch = [project.name, project.address, project.investor, project.description]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())
        const matchesStatus = status === 'Všetky' || project.status === status
        return matchesSearch && matchesStatus
      }),
    [projects, search, status],
  )

  const closeModal = () => {
    setEditingProject(null)
    setSearchParams({})
  }

  if (projectsQuery.isLoading) {
    return (
      <section>
        <header className="page-header">
          <h1>Stavby</h1>
        </header>
        <Skeleton rows={9} />
      </section>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Stavby</h1>
          <p className="muted">Správa aktívnych zákaziek, pracovníkov, rozpočtov a progresu.</p>
        </div>
        {isManager ? (
        <button
          className="primary-btn large-btn"
          type="button"
          onClick={() => {
            setEditingProject(null)
            setForm(blankForm)
            setSearchParams({ nova: '1' })
          }}
        >
            <Plus size={18} />
            Nová stavba
          </button>
        ) : null}
      </header>

      <div className="toolbar">
        <label className="search-wrap">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Vyhľadať stavbu..." />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus | 'Všetky')}>
          <option value="Všetky">Všetky statusy</option>
          {projectStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState title="Žiadne stavby" text="Upravte filter alebo vytvorte novú stavbu." />
      ) : (
        <div className="project-grid">
          {filteredProjects.map((project) => (
            <article key={project.id} className="project-card">
              <Link to={`/stavby/${project.id}`} className="project-main-link">
                <div className="project-top">
                  <h3>{project.name}</h3>
                  <Badge value={project.status} />
                </div>
                <p className="muted">{project.address}</p>
                <p>{project.investor || 'Investor nie je vyplnený'}</p>
                <ProgressBar value={project.progress} />
                <div className="project-meta">
                  <span>{project.progress}% hotové</span>
                  <span>Termín: {formatDate(project.deadline)}</span>
                </div>
                <div className="project-meta">
                  <Badge value={project.priority} />
                  <span>{formatCurrency(project.budget)}</span>
                </div>
                <div className="worker-list">
                  {project.workerIds.length === 0 ? (
                    <span className="worker-pill">Bez pracovníkov</span>
                  ) : (
                    project.workerIds.map((id) => (
                      <span key={id} className="worker-pill">
                        {workers.find((worker) => worker.id === id)?.name ?? 'Pracovník'}
                      </span>
                    ))
                  )}
                </div>
                <p className="muted">
                  Úlohy: {project.completedTaskCount}/{project.taskCount} • Aktivita: {formatDate(project.updatedAt)}
                </p>
              </Link>
              {isManager ? (
                <div className="card-actions">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => {
                      setForm({
                        name: project.name,
                        address: project.address,
                        investor: project.investor,
                        description: project.description,
                        status: project.status,
                        priority: project.priority,
                        progress: project.progress,
                        budget: project.budget,
                        deadline: project.deadline,
                        notes: project.notes,
                        workerIds: project.workerIds,
                      })
                      setEditingProject(project)
                    }}
                  >
                    <Edit3 size={16} />
                    Upraviť
                  </button>
                  <button type="button" className="ghost-btn" onClick={() => archiveProject.mutate(project.id)}>
                    <Archive size={16} />
                    Archivovať
                  </button>
                  <button type="button" className="danger-btn" onClick={() => removeProject.mutate(project.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <Modal open={modalOpen && isManager} title={editingProject ? 'Upraviť stavbu' : 'Nová stavba'} onClose={closeModal}>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault()
            const parsed = projectSchema.safeParse(form)
            if (!parsed.success) {
              toast.error('Skontrolujte povinné polia.')
              return
            }
            const input = {
              ...parsed.data,
              investor: parsed.data.investor ?? '',
              description: parsed.data.description ?? '',
              notes: parsed.data.notes ?? '',
            }
            if (editingProject) {
              await updateProject.mutateAsync({ id: editingProject.id, input })
            } else {
              await createProject.mutateAsync(input)
            }
            closeModal()
          }}
        >
          <label className="form-field">
            Názov
            <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </label>
          <label className="form-field">
            Adresa
            <input value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
          </label>
          <label className="form-field">
            Investor
            <input value={form.investor} onChange={(event) => setForm((prev) => ({ ...prev, investor: event.target.value }))} />
          </label>
          <label className="form-field">
            Deadline
            <input type="date" value={form.deadline} onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))} />
          </label>
          <label className="form-field">
            Status
            <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as ProjectStatus }))}>
              {projectStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Priorita
            <select value={form.priority} onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as ProjectPriority }))}>
              {projectPriorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Progres {form.progress}%
            <input type="range" min="0" max="100" value={form.progress} onChange={(event) => setForm((prev) => ({ ...prev, progress: Number(event.target.value) }))} />
          </label>
          <label className="form-field">
            Rozpočet
            <input type="number" min="0" value={form.budget} onChange={(event) => setForm((prev) => ({ ...prev, budget: Number(event.target.value) }))} />
          </label>
          <label className="form-field full-span">
            Popis
            <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </label>
          <label className="form-field full-span">
            Poznámky
            <textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
          </label>
          <div className="form-field full-span">
            Pracovníci
            <div className="worker-checks">
              {workers.map((worker) => (
                <label key={worker.id} className="check-pill">
                  <input
                    type="checkbox"
                    checked={form.workerIds.includes(worker.id)}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        workerIds: event.target.checked
                          ? [...prev.workerIds, worker.id]
                          : prev.workerIds.filter((id) => id !== worker.id),
                      }))
                    }
                  />
                  {worker.name}
                </label>
              ))}
            </div>
          </div>
          <button className="primary-btn large-btn full-span" type="submit">
            {editingProject ? 'Uložiť zmeny' : 'Vytvoriť stavbu'}
          </button>
        </form>
      </Modal>
    </section>
  )
}
