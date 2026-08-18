import { Link, useParams } from 'react-router-dom'
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/app/AuthContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/utils'
import {
  useAsset,
  useAssetCategories,
  useAssetHistory,
  useCheckoutAsset,
  useConstructionSites,
  useEmployees,
  useReturnAsset,
} from '@/hooks/useFleetData'

export function ToolDetailPage() {
  const { toolId = '' } = useParams()
  const { profile } = useAuth()
  const assetQuery = useAsset(toolId)
  const historyQuery = useAssetHistory(toolId)
  const { data: categories = [] } = useAssetCategories()
  const { data: employees = [] } = useEmployees()
  const { data: sites = [] } = useConstructionSites()
  const checkout = useCheckoutAsset()
  const returnAsset = useReturnAsset()

  if (assetQuery.isLoading) return <LoadingState />
  const asset = assetQuery.data
  if (!asset) {
    return (
      <section>
        <p className="text-muted">Náradie nebolo nájdené.</p>
        <Link to="/naradie" className="text-primary text-sm mt-2 inline-block">
          ← Späť
        </Link>
      </section>
    )
  }

  const category = categories.find((c) => c.id === asset.categoryId)
  const currentUser = employees.find((e) => e.id === asset.currentUserId)
  const currentSite = sites.find((s) => s.id === asset.currentSiteId)
  const employeeMap = new Map(employees.map((e) => [e.id, e.name]))
  const siteMap = new Map(sites.map((s) => [s.id, s.name]))

  const canCheckout = asset.status === 'Voľné' || asset.status === 'Rezervované'
  const canReturn = asset.status === 'Na stavbe' && asset.currentUserId

  return (
    <section className="animate-in">
      <Link to="/naradie" className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary mb-4">
        <ArrowLeft size={16} /> Späť na náradie
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <PageHeader
              title={asset.name}
              description={`${asset.manufacturer} ${asset.model}`}
              actions={<StatusBadge status={asset.status} />}
            />
            <div className="grid sm:grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Kategória</p>
                <p>{category?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Sériové číslo</p>
                <p className="font-mono">{asset.serialNumber}</p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Interné číslo</p>
                <p className="font-mono">{asset.internalNumber}</p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">QR kód</p>
                <p className="font-mono flex items-center gap-1">
                  <QrCode size={14} className="text-primary" /> {asset.qrCode}
                </p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Aktuálny používateľ</p>
                <p>{currentUser?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted text-xs uppercase tracking-wider mb-1">Aktuálna stavba</p>
                <p>{currentSite?.name ?? '—'}</p>
              </div>
              {asset.borrowedAt ? (
                <div>
                  <p className="text-muted text-xs uppercase tracking-wider mb-1">Dátum zapožičania</p>
                  <p>{formatDateTime(asset.borrowedAt)}</p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              {canCheckout ? (
                <Button
                  disabled={checkout.isPending}
                  onClick={async () => {
                    if (!profile) return
                    try {
                      await checkout.mutateAsync({
                        assetId: asset.id,
                        employeeId: profile.id,
                        siteId: currentSite?.id,
                      })
                      toast.success('Náradie bolo prevzaté.')
                      void assetQuery.refetch()
                      void historyQuery.refetch()
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Prevzatie zlyhalo.')
                    }
                  }}
                >
                  <ArrowUpRight size={16} /> Prevzat
                </Button>
              ) : null}
              {canReturn ? (
                <Button
                  variant="secondary"
                  disabled={returnAsset.isPending}
                  onClick={async () => {
                    if (!asset.currentUserId) return
                    try {
                      await returnAsset.mutateAsync({ assetId: asset.id, employeeId: asset.currentUserId })
                      toast.success('Náradie bolo odovzdané.')
                      void assetQuery.refetch()
                      void historyQuery.refetch()
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Odovzdanie zlyhalo.')
                    }
                  }}
                >
                  <ArrowDownLeft size={16} /> Odovzdať
                </Button>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">História pohybu</CardTitle>
            </CardHeader>
            <CardContent>
              {(historyQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted">Žiadna história</p>
              ) : (
                <div className="space-y-3">
                  {(historyQuery.data ?? []).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 text-sm">
                      <div>
                        <span className="font-medium">{employeeMap.get(entry.employeeId)}</span>
                        <span className="text-muted"> {entry.action.toLowerCase()}</span>
                        {entry.siteId ? (
                          <span className="text-muted-foreground text-xs block">{siteMap.get(entry.siteId)}</span>
                        ) : null}
                      </div>
                      <span className="text-xs text-muted shrink-0">{formatDateTime(entry.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="p-6 flex flex-col items-center justify-center text-center">
          <div className="h-40 w-40 rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center mb-4 bg-primary/5">
            <QrCode size={64} className="text-primary/60" />
          </div>
          <p className="font-mono text-lg font-bold">{asset.qrCode}</p>
          <p className="text-xs text-muted mt-2">Naskenujte pre rýchly prístup</p>
          <Link to="/qr-scanner" className="mt-4">
            <Button variant="outline" size="sm">
              Otvoriť QR Scanner
            </Button>
          </Link>
        </Card>
      </div>
    </section>
  )
}
