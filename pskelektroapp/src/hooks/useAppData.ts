import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { calendarService } from '../services/calendarService'
import { projectDetailService, type NoteInput } from '../services/projectDetailService'
import { projectService, type ProjectInput } from '../services/projectService'
import { taskService, type TaskInput } from '../services/taskService'
import { userService } from '../services/userService'
import type { CalendarEvent, Project, Task } from '../types'

export const queryKeys = {
  projects: ['projects'] as const,
  archive: ['archive'] as const,
  workers: ['workers'] as const,
  tasks: ['tasks'] as const,
  calendar: ['calendar'] as const,
  project: (projectId: string) => ['project', projectId] as const,
  projectTasks: (projectId: string) => ['projectTasks', projectId] as const,
  projectNotes: (projectId: string) => ['projectNotes', projectId] as const,
  projectFiles: (projectId: string) => ['projectFiles', projectId] as const,
  projectUpdates: (projectId: string) => ['projectUpdates', projectId] as const,
}

export function useProjects(includeArchived = false) {
  return useQuery({
    queryKey: includeArchived ? queryKeys.archive : queryKeys.projects,
    queryFn: () => projectService.list(includeArchived),
  })
}

export function useWorkers() {
  return useQuery({ queryKey: queryKeys.workers, queryFn: userService.listWorkers })
}

export function useTasks() {
  return useQuery({ queryKey: queryKeys.tasks, queryFn: taskService.list })
}

export function useCalendarEvents() {
  return useQuery({ queryKey: queryKeys.calendar, queryFn: calendarService.list })
}

export function useProjectDetail(projectId: string) {
  const project = useQuery({ queryKey: queryKeys.project(projectId), queryFn: () => projectService.getById(projectId) })
  const tasks = useQuery({ queryKey: queryKeys.projectTasks(projectId), queryFn: () => taskService.listByProject(projectId) })
  const notes = useQuery({ queryKey: queryKeys.projectNotes(projectId), queryFn: () => projectDetailService.listNotes(projectId) })
  const files = useQuery({ queryKey: queryKeys.projectFiles(projectId), queryFn: () => projectDetailService.listPhotos(projectId) })
  const updates = useQuery({
    queryKey: queryKeys.projectUpdates(projectId),
    queryFn: () => taskService.listUpdatesByProject(projectId),
  })

  return { project, tasks, notes, files, updates }
}

export function useProjectMutations(projectId?: string) {
  const queryClient = useQueryClient()

  const invalidateProjects = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
      queryClient.invalidateQueries({ queryKey: queryKeys.archive }),
      projectId ? queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }) : Promise.resolve(),
    ])
  }

  return {
    createProject: useMutation({
      mutationFn: (input: ProjectInput) => projectService.create(input),
      onSuccess: async () => {
        await invalidateProjects()
        toast.success('Stavba bola vytvorená.')
      },
    }),
    updateProject: useMutation({
      mutationFn: ({ id, input }: { id: string; input: Partial<ProjectInput> }) => projectService.update(id, input),
      onMutate: async ({ id, input }) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.projects })
        const previous = queryClient.getQueryData<Project[]>(queryKeys.projects)
        queryClient.setQueryData<Project[]>(queryKeys.projects, (current) =>
          current?.map((project) => (project.id === id ? { ...project, ...input } : project)),
        )
        return { previous }
      },
      onError: (_error, _variables, context) => {
        queryClient.setQueryData(queryKeys.projects, context?.previous)
        toast.error('Zmena stavby sa nepodarila.')
      },
      onSuccess: invalidateProjects,
    }),
    archiveProject: useMutation({
      mutationFn: projectService.archive,
      onSuccess: async () => {
        await invalidateProjects()
        toast.success('Stavba bola archivovaná.')
      },
    }),
    removeProject: useMutation({
      mutationFn: projectService.remove,
      onSuccess: async () => {
        await invalidateProjects()
        toast.success('Stavba bola vymazaná.')
      },
    }),
  }
}

function supabaseErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message) || fallback
  }
  return fallback
}

function isRlsOrPermissionError(error: unknown): boolean {
  const msg = supabaseErrorMessage(error, '').toLowerCase()
  const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: string }).code) : ''
  return (
    code === '42501' ||
    msg.includes('row-level security') ||
    msg.includes('rls') ||
    msg.includes('permission denied') ||
    msg.includes('new row violates')
  )
}

export function useTaskMutations(projectId?: string) {
  const queryClient = useQueryClient()
  const invalidateTasks = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
    if (projectId) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.projectTasks(projectId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projectUpdates(projectId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) }),
      ])
    }
  }

  return {
    createTask: useMutation({
      mutationFn: (input: TaskInput) => taskService.create(input),
      onSuccess: async () => {
        await invalidateTasks()
        toast.success('Úloha bola vytvorená.')
      },
      onError: (error: unknown) => {
        if (isRlsOrPermissionError(error)) {
          toast.error('Nové úlohy môže pridávať len projektový manažér (pravidlá v databáze).')
        } else {
          toast.error(supabaseErrorMessage(error, 'Úlohu sa nepodarilo vytvoriť.'))
        }
      },
    }),
    updateTask: useMutation({
      mutationFn: ({ id, input }: { id: string; input: Partial<TaskInput> }) => taskService.update(id, input),
      onMutate: async ({ id, input }) => {
        const key = projectId ? queryKeys.projectTasks(projectId) : queryKeys.tasks
        await queryClient.cancelQueries({ queryKey: key })
        const previous = queryClient.getQueryData<Task[]>(key)
        queryClient.setQueryData<Task[]>(key, (current) =>
          current?.map((task) => (task.id === id ? { ...task, ...input } : task)),
        )
        return { previous, key }
      },
      onError: (_error, _variables, context) => {
        if (context) queryClient.setQueryData(context.key, context.previous)
        toast.error('Úlohu sa nepodarilo upraviť.')
      },
      onSuccess: invalidateTasks,
    }),
    removeTask: useMutation({
      mutationFn: taskService.remove,
      onSuccess: async () => {
        await invalidateTasks()
        toast.success('Úloha bola vymazaná.')
      },
      onError: (error: unknown) => {
        toast.error(supabaseErrorMessage(error, 'Úlohu sa nepodarilo vymazať.'))
      },
    }),
  }
}

export function useProjectFileMutations(projectId: string) {
  const queryClient = useQueryClient()

  return {
    createNote: useMutation({
      mutationFn: (input: NoteInput) => projectDetailService.createNote(projectId, input),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.projectNotes(projectId) })
        toast.success('Denný report bol uložený.')
      },
    }),
    uploadFile: useMutation({
      mutationFn: (file: File) => projectDetailService.uploadFile(projectId, file),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.projectFiles(projectId) })
        toast.success('Súbor bol nahraný.')
      },
    }),
  }
}

export function useCalendarMutations() {
  const queryClient = useQueryClient()

  const invalidateCalendar = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.calendar })
  }

  return {
    createEvent: useMutation({
      mutationFn: (input: Omit<CalendarEvent, 'id' | 'createdAt'>) => calendarService.create(input),
      onSuccess: async () => {
        await invalidateCalendar()
        toast.success('Udalosť bola pridaná.')
      },
      onError: (error: unknown) => {
        if (isRlsOrPermissionError(error)) {
          toast.error('Kalendár môže upravovať len projektový manažér.')
        } else {
          toast.error(supabaseErrorMessage(error, 'Udalosť sa nepodarilo uložiť.'))
        }
      },
    }),
    updateEvent: useMutation({
      mutationFn: ({ id, input }: { id: string; input: Omit<CalendarEvent, 'id' | 'createdAt'> }) =>
        calendarService.update(id, input),
      onSuccess: async () => {
        await invalidateCalendar()
        toast.success('Udalosť bola upravená.')
      },
      onError: (error: unknown) => {
        toast.error(supabaseErrorMessage(error, 'Udalosť sa nepodarilo upraviť.'))
      },
    }),
    deleteEvent: useMutation({
      mutationFn: (id: string) => calendarService.remove(id),
      onSuccess: async () => {
        await invalidateCalendar()
        toast.success('Udalosť bola vymazaná.')
      },
      onError: (error: unknown) => {
        toast.error(supabaseErrorMessage(error, 'Udalosť sa nepodarilo vymazať.'))
      },
    }),
  }
}
