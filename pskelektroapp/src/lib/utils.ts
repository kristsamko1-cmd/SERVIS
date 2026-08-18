import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString('sk-SK', options ?? { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
