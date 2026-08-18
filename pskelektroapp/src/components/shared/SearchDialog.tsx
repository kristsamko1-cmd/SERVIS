import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useGlobalSearch } from '@/hooks/useFleetData'
import { cn } from '@/lib/utils'

const typeLabels: Record<string, string> = {
  náradie: 'Náradie',
  projekt: 'Projekt',
  zamestnanec: 'Zamestnanec',
  stavba: 'Stavba',
  auto: 'Auto',
  inventár: 'Inventár',
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const searchQuery = useGlobalSearch(query)

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass-card rounded-xl shadow-2xl animate-in overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-border/50">
          <Search size={18} className="text-muted shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hľadať náradie, projekty, zamestnancov..."
            className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button type="button" onClick={onClose} className="text-muted hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[320px] overflow-y-auto py-2">
          {query.length < 2 ? (
            <p className="px-4 py-6 text-sm text-muted text-center">Zadajte aspoň 2 znaky pre vyhľadávanie</p>
          ) : searchQuery.isLoading ? (
            <p className="px-4 py-6 text-sm text-muted text-center">Hľadám...</p>
          ) : (searchQuery.data ?? []).length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted text-center">Žiadne výsledky pre „{query}"</p>
          ) : (
            (searchQuery.data ?? []).map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors text-left"
                onClick={() => {
                  navigate(result.href)
                  onClose()
                }}
              >
                <span className="text-[10px] uppercase tracking-wider font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {typeLabels[result.type] ?? result.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{result.title}</p>
                  <p className="text-xs text-muted truncate">{result.subtitle}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export function SearchTrigger({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 h-10 px-4 rounded-lg border border-border/60 bg-surface/50 text-muted text-sm hover:bg-surface-hover hover:border-border transition-all flex-1 max-w-md',
        className,
      )}
    >
      <Search size={16} />
      <span className="hidden sm:inline">Hľadať náradie, projekty, zamestnancov...</span>
      <span className="sm:hidden">Hľadať...</span>
      <kbd className="ml-auto hidden md:inline text-[10px] bg-surface-elevated px-1.5 py-0.5 rounded border border-border text-muted-foreground">
        Ctrl K
      </kbd>
    </button>
  )
}
