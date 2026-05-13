import { useMemo, useState } from 'react'
import { z } from 'zod'
import { Filter, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { KanbanBoard } from '../components/tasks/KanbanBoard'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { formatDate, taskPriorities, taskStatuses, todayIso } from '../lib/constants'
import { useProjects, useTaskMutations, useTasks, useWorkers } from '../hooks/useAppData'
import type { Task, TaskPriority, TaskStatus } from '../types'

const taskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().optional(),
  assignedUserId: z.string().nullable().optional(),
  priority: z.custom<TaskPriority>(),
  status: z.custom<TaskStatus>(),
  deadline: z.string().min(1),
  progress: z.number().min(0).max(100),
  commentsCount: z.number(),
  pinned: z.boolean(),
  urgent: z.boolean(),
})

const blankForm = {
  projectId: '',
  title: '',
  description: '',
  assignedUserId: null as string | null,
  priority: 'Stredná' as TaskPriority,
  status: 'Na spravenie' as TaskStatus,
  deadline: todayIso(),
  progress: 0,
  commentsCount: 0,
  pinned: false,
  urgent: false,
}

export function TasksPage() {
  const tasksQuery = useTasks()
  const projectsQuery = useProjects()
  const workersQuery = useWorkers()
  const { createTask, updateTask } = useTaskMutations()
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState<TaskPriority | 'Všetky'>('Všetky')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [form, setForm] = useState(blankForm)
  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data])
  const projects = projectsQuery.data ?? []
  const workers = workersQuery.data ?? []

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesSearch = [task.title, task.description].join(' ').toLowerCase().includes(search.toLowerCase())
        const matchesPriority = priority === 'Všetky' || task.priority === priority
        return matchesSearch && matchesPriority
      }),
    [priority, search, tasks],
  )

  const openCreateModal = () => {
    setSelectedTask(null)
    setForm({ ...blankForm, projectId: projects[0]?.id ?? '' })
    setModalOpen(true)
  }

  const openTaskModal = (task: Task) => {
    setSelectedTask(task)
    setForm({
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      assignedUserId: task.assignedUserId ?? null,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline,
      progress: task.progress,
      commentsCount: task.commentsCount,
      pinned: task.pinned,
      urgent: task.urgent,
    })
    setModalOpen(true)
  }

  if (tasksQuery.isLoading || projectsQuery.isLoading) {
    return (
      <section>
        <header className="page-header">
          <h1>Úlohy</h1>
        </header>
        <Skeleton rows={8} />
      </section>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Úlohy</h1>
          <p className="muted">Kanban pre denný postup prác, priority a zodpovednosti.</p>
        </div>
        <button className="primary-btn large-btn" type="button" onClick={openCreateModal}>
          <Plus size={18} />
          Pridať úlohu
        </button>
      </header>

      <div className="toolbar">
        <label className="search-wrap">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Hľadať úlohu..." />
        </label>
        <label className="filter-select">
          <Filter size={16} />
          <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority | 'Všetky')}>
            <option value="Všetky">Všetky priority</option>
            {taskPriorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <KanbanBoard
        tasks={filteredTasks}
        workers={workers}
        onTaskClick={openTaskModal}
        onStatusChange={(taskId, nextStatus) => updateTask.mutate({ id: taskId, input: { status: nextStatus } })}
      />

      <Modal open={modalOpen} title={selectedTask ? 'Detail úlohy' : 'Nová úloha'} onClose={() => setModalOpen(false)}>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault()
            const parsed = taskSchema.safeParse(form)
            if (!parsed.success) {
              toast.error('Skontrolujte povinné polia.')
              return
            }
            const input = {
              ...parsed.data,
              description: parsed.data.description ?? '',
              assignedUserId: parsed.data.assignedUserId ?? null,
            }
            if (selectedTask) {
              await updateTask.mutateAsync({ id: selectedTask.id, input })
            } else {
              await createTask.mutateAsync(input)
            }
            setModalOpen(false)
          }}
        >
          <label className="form-field full-span">
            Stavba
            <select value={form.projectId} onChange={(event) => setForm((prev) => ({ ...prev, projectId: event.target.value }))}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Názov úlohy
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          </label>
          <label className="form-field">
            Deadline
            <input type="date" value={form.deadline} onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))} />
          </label>
          <label className="form-field">
            Priradené
            <select
              value={form.assignedUserId ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, assignedUserId: event.target.value || null }))}
            >
              <option value="">Nepriradené</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Status
            <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as TaskStatus }))}>
              {taskStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Priorita
            <select value={form.priority} onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))}>
              {taskPriorities.map((item) => (
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
          <label className="form-field full-span">
            Popis
            <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </label>
          <label className="check-pill">
            <input type="checkbox" checked={form.pinned} onChange={(event) => setForm((prev) => ({ ...prev, pinned: event.target.checked }))} />
            Pripnúť úlohu
          </label>
          <label className="check-pill">
            <input type="checkbox" checked={form.urgent} onChange={(event) => setForm((prev) => ({ ...prev, urgent: event.target.checked }))} />
            Označiť ako urgentné
          </label>
          {selectedTask ? <p className="muted full-span">Vytvorené: {formatDate(selectedTask.createdAt || todayIso())}</p> : null}
          <button type="submit" className="primary-btn large-btn full-span">
            {selectedTask ? 'Uložiť úlohu' : 'Vytvoriť úlohu'}
          </button>
        </form>
      </Modal>
    </section>
  )
}
