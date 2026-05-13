import { DndContext, useDraggable, useDroppable, type DragEndEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { AlertTriangle, GripVertical, MessageCircle, Pin } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'
import { taskStatuses } from '../../lib/constants'
import type { Task, TaskStatus, Worker } from '../../types'

interface KanbanBoardProps {
  tasks: Task[]
  workers?: Worker[]
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onTaskClick?: (task: Task) => void
}

function KanbanColumn({
  status,
  tasks,
  workers,
  onTaskClick,
}: {
  status: TaskStatus
  tasks: Task[]
  workers: Worker[]
  onTaskClick?: (task: Task) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <article ref={setNodeRef} className={`kanban-column ${isOver ? 'drop-active' : ''}`}>
      <header className="kanban-header">
        <h3>{status}</h3>
        <span className="muted">{tasks.length}</span>
      </header>
      <div className="kanban-list">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} workers={workers} onTaskClick={onTaskClick} />
        ))}
      </div>
    </article>
  )
}

function TaskCard({
  task,
  workers,
  onTaskClick,
}: {
  task: Task
  workers: Worker[]
  onTaskClick?: (task: Task) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = { transform: CSS.Translate.toString(transform) }

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      onClick={() => onTaskClick?.(task)}
      {...listeners}
      {...attributes}
    >
      <div className="task-head">
        <span className="task-title">
          <GripVertical size={15} />
          <strong>{task.title}</strong>
        </span>
        <span className="task-icons">
          {task.pinned ? <Pin size={14} /> : null}
          {task.urgent ? <AlertTriangle size={14} /> : null}
        </span>
      </div>
      <p className="muted">{task.description || 'Bez popisu'}</p>
      <ProgressBar value={task.progress} />
      <div className="task-meta">
        <Badge value={task.priority} />
        <span>{task.progress}%</span>
      </div>
      <div className="task-meta">
        <span className="comment-pill">
          <MessageCircle size={14} />
          {task.commentsCount} komentárov
        </span>
        <span>{workers.find((worker) => worker.id === task.assignedUserId)?.name ?? 'Nepriradené'}</span>
      </div>
    </button>
  )
}

export function KanbanBoard({ tasks, workers = [], onStatusChange, onTaskClick }: KanbanBoardProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const taskId = String(event.active.id)
    const nextStatus = event.over?.id as TaskStatus | undefined
    const currentTask = tasks.find((task) => task.id === taskId)
    if (currentTask && nextStatus && taskStatuses.includes(nextStatus) && currentTask.status !== nextStatus) {
      onStatusChange?.(taskId, nextStatus)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <section className="kanban-grid">
        {taskStatuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter((task) => task.status === status)}
            workers={workers}
            onTaskClick={onTaskClick}
          />
        ))}
      </section>
    </DndContext>
  )
}
