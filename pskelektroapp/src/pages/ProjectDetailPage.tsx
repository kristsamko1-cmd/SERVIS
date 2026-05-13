import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ClipboardList, FileDown, MessageSquare, Plus, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { KanbanBoard } from '../components/tasks/KanbanBoard'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Skeleton } from '../components/ui/Skeleton'
import { formatCurrency, formatDate, projectStatuses } from '../lib/constants'
import { useProjectDetail, useProjectFileMutations, useProjectMutations, useTaskMutations, useWorkers } from '../hooks/useAppData'
import type { ProjectStatus } from '../types'

const noteSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(2),
  missingItems: z.string().optional(),
  problem: z.string().optional(),
  orderItems: z.string().optional(),
})

export function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  const { project, tasks, notes, files, updates } = useProjectDetail(projectId)
  const workersQuery = useWorkers()
  const { updateProject } = useProjectMutations(projectId)
  const { updateTask } = useTaskMutations(projectId)
  const { createNote, uploadFile } = useProjectFileMutations(projectId)
  const [noteOpen, setNoteOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [noteForm, setNoteForm] = useState({ title: '', content: '', missingItems: '', problem: '', orderItems: '' })
  const workers = useMemo(() => workersQuery.data ?? [], [workersQuery.data])
  const projectData = project.data
  const projectTasks = tasks.data ?? []
  const projectNotes = notes.data ?? []
  const projectFiles = files.data ?? []
  const taskUpdates = updates.data ?? []

  const assignedWorkers = useMemo(
    () => workers.filter((worker) => projectData?.workerIds.includes(worker.id)),
    [projectData?.workerIds, workers],
  )

  if (project.isLoading || tasks.isLoading) {
    return (
      <section>
        <Skeleton rows={9} />
      </section>
    )
  }

  if (!projectData) return <EmptyState title="Stavba neexistuje" text="Skontrolujte URL alebo vyberte inú stavbu." />

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="breadcrumbs">Stavby / {projectData.name}</p>
          <h1>{projectData.name}</h1>
          <p className="muted">{projectData.address}</p>
        </div>
        <div className="page-inline">
          <Badge value={projectData.status} />
          <Badge value={projectData.priority} />
        </div>
      </header>

      <div className="quick-actions">
        <button className="primary-btn large-btn" type="button" onClick={() => toast.info('Novú úlohu pridáte v kanbane úloh.')}>
          <Plus size={18} />
          Pridať úlohu
        </button>
        <button className="ghost-btn large-btn" type="button" onClick={() => setNoteOpen(true)}>
          <MessageSquare size={18} />
          Denný report
        </button>
        <label className="ghost-btn large-btn">
          <Upload size={18} />
          Upload súboru
          <input
            type="file"
            hidden
            accept="image/*,.pdf"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              await uploadFile.mutateAsync(file)
            }}
          />
        </label>
        <button className="ghost-btn large-btn" type="button" onClick={() => setStatusOpen(true)}>
          <ClipboardList size={18} />
          Zmeniť status
        </button>
      </div>

      <div className="stats-grid">
        <Card title="Dokončenie">
          <div className="metric-big">{projectData.progress}%</div>
          <ProgressBar value={projectData.progress} />
        </Card>
        <Card title="Úlohy">
          <div className="metric-big">
            {projectData.completedTaskCount}/{projectData.taskCount}
          </div>
          <p className="muted">Hotové úlohy</p>
        </Card>
        <Card title="Rozpočet">
          <div className="metric-big">{formatCurrency(projectData.budget)}</div>
          <p className="muted">Investor: {projectData.investor || 'neuvedený'}</p>
        </Card>
        <Card title="Deadline">
          <div className="metric-big">{formatDate(projectData.deadline)}</div>
          <p className="muted">Posledná aktivita: {formatDate(projectData.updatedAt)}</p>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Overview">
          <p>{projectData.description || 'Popis stavby zatiaľ nie je vyplnený.'}</p>
          <div className="worker-list roomy">
            {assignedWorkers.map((worker) => (
              <span key={worker.id} className="worker-pill">
                <span className={worker.online ? 'online-dot' : 'offline-dot'} />
                {worker.name} • {worker.role}
              </span>
            ))}
          </div>
          {projectData.notes ? <p className="muted">{projectData.notes}</p> : null}
        </Card>

        <Card title="Activity feed">
          {taskUpdates.length === 0 ? (
            <EmptyState title="Bez aktivity" text="Zmeny úloh sa zobrazia tu." />
          ) : (
            taskUpdates.slice(0, 8).map((update) => (
              <div key={update.id} className="row-item">
                <p>{update.message}</p>
                <span className="muted">{formatDate(update.createdAt)}</span>
              </div>
            ))
          )}
        </Card>
      </div>

      <Card title="Task management">
        <KanbanBoard
          tasks={projectTasks}
          workers={workers}
          onStatusChange={(taskId, status) => updateTask.mutate({ id: taskId, input: { status } })}
        />
      </Card>

      <div className="grid-2">
        <Card title="Denné reporty zo stavby">
          {projectNotes.length === 0 ? (
            <EmptyState title="Žiadne reporty" text="Pridajte prvý denný report zo stavby." />
          ) : (
            projectNotes.map((note) => (
              <article key={note.id} className="report-card">
                <strong>{note.title}</strong>
                <p>{note.content}</p>
                {note.problem ? <p className="muted">Problém: {note.problem}</p> : null}
                {note.orderItems ? <p className="muted">Objednať: {note.orderItems}</p> : null}
                <span className="muted">{formatDate(note.createdAt)}</span>
              </article>
            ))
          )}
        </Card>

        <Card title="Fotky a dokumenty">
          <div className="photo-grid">
            {projectFiles.map((file) => (
              <figure key={file.id} className="photo-card" onClick={() => file.fileType === 'image' && setPreviewUrl(file.url)}>
                {file.fileType === 'image' ? <img src={file.url} alt={file.title} /> : <FileDown size={42} />}
                <figcaption>
                  <span>{file.title}</span>
                  <a href={file.url} download target="_blank" rel="noreferrer">
                    Stiahnuť
                  </a>
                </figcaption>
              </figure>
            ))}
            {projectFiles.length === 0 ? <EmptyState title="Bez súborov" text="Nahrajte fotky, PDF, plány alebo revízne správy." /> : null}
          </div>
        </Card>
      </div>

      <Modal open={noteOpen} title="Denný report" onClose={() => setNoteOpen(false)}>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault()
            const parsed = noteSchema.safeParse(noteForm)
            if (!parsed.success) {
              toast.error('Vyplňte aspoň názov a čo sa spravilo.')
              return
            }
            await createNote.mutateAsync({
              title: parsed.data.title,
              content: parsed.data.content,
              missingItems: parsed.data.missingItems ?? '',
              problem: parsed.data.problem ?? '',
              orderItems: parsed.data.orderItems ?? '',
            })
            setNoteForm({ title: '', content: '', missingItems: '', problem: '', orderItems: '' })
            setNoteOpen(false)
          }}
        >
          <label className="form-field full-span">
            Názov reportu
            <input value={noteForm.title} onChange={(event) => setNoteForm((prev) => ({ ...prev, title: event.target.value }))} />
          </label>
          <label className="form-field full-span">
            Čo sa spravilo
            <textarea value={noteForm.content} onChange={(event) => setNoteForm((prev) => ({ ...prev, content: event.target.value }))} />
          </label>
          <label className="form-field">
            Čo chýba
            <textarea value={noteForm.missingItems} onChange={(event) => setNoteForm((prev) => ({ ...prev, missingItems: event.target.value }))} />
          </label>
          <label className="form-field">
            Problém
            <textarea value={noteForm.problem} onChange={(event) => setNoteForm((prev) => ({ ...prev, problem: event.target.value }))} />
          </label>
          <label className="form-field full-span">
            Čo treba objednať
            <textarea value={noteForm.orderItems} onChange={(event) => setNoteForm((prev) => ({ ...prev, orderItems: event.target.value }))} />
          </label>
          <button type="submit" className="primary-btn large-btn full-span">
            Uložiť report
          </button>
        </form>
      </Modal>

      <Modal open={statusOpen} title="Zmeniť status stavby" onClose={() => setStatusOpen(false)}>
        <div className="status-grid">
          {projectStatuses.map((status) => (
            <button
              key={status}
              type="button"
              className="status-tile"
              onClick={async () => {
                await updateProject.mutateAsync({ id: projectData.id, input: { status: status as ProjectStatus } })
                setStatusOpen(false)
              }}
            >
              <Badge value={status} />
              <span>{status}</span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={Boolean(previewUrl)} title="Náhľad fotky" onClose={() => setPreviewUrl(null)}>
        {previewUrl ? <img className="full-preview" src={previewUrl} alt="Náhľad fotky" /> : null}
      </Modal>
    </section>
  )
}
