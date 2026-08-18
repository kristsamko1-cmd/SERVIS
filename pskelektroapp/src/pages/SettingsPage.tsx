import { Database, Palette, Shield, User } from 'lucide-react'
import { useAuth } from '@/app/AuthContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { hasSupabaseConfig } from '@/lib/supabase'

const entities = [
  'users',
  'employees',
  'projects',
  'construction_sites',
  'assets',
  'asset_categories',
  'asset_assignments',
  'asset_history',
  'qr_codes',
  'vehicles',
  'inventory',
  'reservations',
  'notifications',
  'reports',
]

export function SettingsPage() {
  const { profile, isMockMode } = useAuth()

  return (
    <section className="animate-in">
      <PageHeader title="Nastavenia" description="Konfigurácia systému a informácie o aplikácii." />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User size={16} className="text-primary" /> Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Meno</span>
              <span>{profile?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">E-mail</span>
              <span>{profile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Rola</span>
              <span>{profile?.role}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database size={16} className="text-primary" /> Databáza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Režim</span>
              <span>{isMockMode ? 'Mock dáta' : 'Supabase'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Supabase konfigurácia</span>
              <span>{hasSupabaseConfig ? 'Aktívna' : 'Neaktívna'}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Aplikácia je pripravená na napojenie Supabase. Služby v <code className="text-primary">fleetService.ts</code> stačí
              nahradiť API volaniami.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette size={16} className="text-primary" /> Dizajn
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="text-muted">Dark mode · PSK Elektro farebná schéma</p>
            <div className="flex gap-2 mt-3">
              {['#0D0D0D', '#1B1B1B', '#FFC107', '#FFFFFF'].map((color) => (
                <div key={color} className="h-8 w-8 rounded-lg border border-border/50" style={{ backgroundColor: color }} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield size={16} className="text-primary" /> Entity (budúca DB)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {entities.map((entity) => (
                <span key={entity} className="text-xs font-mono bg-surface-elevated px-2 py-1 rounded border border-border/50">
                  {entity}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
