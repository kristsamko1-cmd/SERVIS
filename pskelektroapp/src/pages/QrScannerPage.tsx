import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, Camera, QrCode, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/app/AuthContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatDateTime } from '@/lib/utils'
import {
  useAssetByQr,
  useAssetHistory,
  useCheckoutAsset,
  useConstructionSites,
  useEmployees,
  useReturnAsset,
} from '@/hooks/useFleetData'

export function QrScannerPage() {
  const { profile } = useAuth()
  const [manualCode, setManualCode] = useState('')
  const [scannedCode, setScannedCode] = useState('')
  const [scanning, setScanning] = useState(false)

  const assetQuery = useAssetByQr(scannedCode)
  const historyQuery = useAssetHistory(assetQuery.data?.id ?? '')
  const { data: employees = [] } = useEmployees()
  const { data: sites = [] } = useConstructionSites()
  const checkout = useCheckoutAsset()
  const returnAsset = useReturnAsset()

  const employeeMap = new Map(employees.map((e) => [e.id, e.name]))
  const siteMap = new Map(sites.map((s) => [s.id, s.name]))
  const asset = assetQuery.data

  const simulateScan = () => {
    setScanning(true)
    setTimeout(() => {
      setScannedCode('QR-NR-001')
      setScanning(false)
      toast.success('QR kód úspešne naskenovaný!')
    }, 1500)
  }

  const lookupManual = () => {
    if (!manualCode.trim()) return
    setScannedCode(manualCode.trim())
  }

  return (
    <section className="animate-in max-w-lg mx-auto">
      <PageHeader
        title="QR Scanner"
        description="Mobilný skener pre prevzatie a odovzdanie náradia."
      />

      <Card className="mb-6 overflow-hidden">
        <div className="aspect-[4/3] bg-surface-elevated flex flex-col items-center justify-center relative">
          {scanning ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="h-48 w-48 border-2 border-primary rounded-xl animate-pulse" />
            </div>
          ) : null}
          <Camera size={48} className="text-muted mb-3" />
          <p className="text-sm text-muted mb-4">Nasmerujte kameru na QR kód náradia</p>
          <Button onClick={simulateScan} disabled={scanning} size="lg" className="w-full max-w-xs">
            {scanning ? 'Skenujem...' : 'Simulovať sken'}
          </Button>
        </div>
      </Card>

      <Card className="p-4 mb-6">
        <p className="text-xs text-muted mb-2">Alebo zadajte kód manuálne</p>
        <div className="flex gap-2">
          <Input
            placeholder="QR-NR-001"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookupManual()}
          />
          <Button variant="secondary" onClick={lookupManual}>
            <Search size={16} />
          </Button>
        </div>
      </Card>

      {scannedCode && assetQuery.isLoading ? (
        <Card className="p-6 text-center text-muted">Načítavam detail náradia...</Card>
      ) : null}

      {scannedCode && !assetQuery.isLoading && !asset ? (
        <Card className="p-6 text-center text-muted">Náradie s kódom „{scannedCode}" nebolo nájdené.</Card>
      ) : null}

      {asset ? (
        <Card className="animate-in">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{asset.name}</CardTitle>
                <p className="text-sm text-muted mt-1">
                  {asset.manufacturer} {asset.model}
                </p>
              </div>
              <StatusBadge status={asset.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted text-xs">Interné č.</p>
                <p className="font-mono">{asset.internalNumber}</p>
              </div>
              <div>
                <p className="text-muted text-xs">QR</p>
                <p className="font-mono flex items-center gap-1">
                  <QrCode size={12} /> {asset.qrCode}
                </p>
              </div>
              <div>
                <p className="text-muted text-xs">Používateľ</p>
                <p>{asset.currentUserId ? employeeMap.get(asset.currentUserId) : '—'}</p>
              </div>
              <div>
                <p className="text-muted text-xs">Stavba</p>
                <p>{asset.currentSiteId ? siteMap.get(asset.currentSiteId) : '—'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              {(asset.status === 'Voľné' || asset.status === 'Rezervované') && profile ? (
                <Button
                  className="flex-1"
                  disabled={checkout.isPending}
                  onClick={async () => {
                    try {
                      await checkout.mutateAsync({ assetId: asset.id, employeeId: profile.id })
                      toast.success('Náradie prevzaté!')
                      void assetQuery.refetch()
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Chyba')
                    }
                  }}
                >
                  <ArrowUpRight size={16} /> Prevzat
                </Button>
              ) : null}
              {asset.status === 'Na stavbe' && asset.currentUserId ? (
                <Button
                  variant="secondary"
                  className="flex-1"
                  disabled={returnAsset.isPending}
                  onClick={async () => {
                    try {
                      await returnAsset.mutateAsync({ assetId: asset.id, employeeId: asset.currentUserId! })
                      toast.success('Náradie odovzdané!')
                      void assetQuery.refetch()
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Chyba')
                    }
                  }}
                >
                  <ArrowDownLeft size={16} /> Odovzdať
                </Button>
              ) : null}
            </div>

            <Link to={`/naradie/${asset.id}`}>
              <Button variant="outline" className="w-full">
                Otvoriť detail
              </Button>
            </Link>

            {(historyQuery.data ?? []).length > 0 ? (
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">História</p>
                {(historyQuery.data ?? []).slice(0, 3).map((h) => (
                  <div key={h.id} className="flex justify-between text-xs py-1.5">
                    <span>
                      {employeeMap.get(h.employeeId)} · {h.action}
                    </span>
                    <span className="text-muted">{formatDateTime(h.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}
