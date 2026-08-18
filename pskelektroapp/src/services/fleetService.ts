import { delay } from '@/lib/utils'
import {
  activities,
  assetCategories,
  assetHistory,
  assets,
  constructionSites,
  employees,
  getDashboardStats,
  employeeWorkloadChart,
  inventoryItems,
  measuringDevices,
  notifications,
  projects,
  projectsMonthlyChart,
  reservations,
  toolUsageChart,
  vehicles,
  warehouseItems,
  warehouseStockChart,
} from '@/data/mock'
import type {
  ActivityEntry,
  Asset,
  AssetCategory,
  AssetHistoryEntry,
  AssetStatus,
  ConstructionSite,
  DashboardStats,
  Employee,
  InventoryItem,
  MeasuringDevice,
  Notification,
  Project,
  Reservation,
  SearchResult,
  Vehicle,
  WarehouseItem,
} from '@/types/entities'

const MOCK_DELAY = 300

export const fleetService = {
  async getDashboardStats(): Promise<DashboardStats> {
    await delay(MOCK_DELAY)
    return getDashboardStats()
  },

  async getActivities(): Promise<ActivityEntry[]> {
    await delay(MOCK_DELAY)
    return [...activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  },

  async getChartData(type: 'toolUsage' | 'projectsMonthly' | 'employeeWorkload' | 'warehouseStock') {
    await delay(MOCK_DELAY)
    const charts = {
      toolUsage: toolUsageChart,
      projectsMonthly: projectsMonthlyChart,
      employeeWorkload: employeeWorkloadChart,
      warehouseStock: warehouseStockChart,
    }
    return charts[type]
  },

  async getEmployees(): Promise<Employee[]> {
    await delay(MOCK_DELAY)
    return employees
  },

  async getEmployee(id: string): Promise<Employee | undefined> {
    await delay(MOCK_DELAY)
    return employees.find((e) => e.id === id)
  },

  async getConstructionSites(): Promise<ConstructionSite[]> {
    await delay(MOCK_DELAY)
    return constructionSites
  },

  async getConstructionSite(id: string): Promise<ConstructionSite | undefined> {
    await delay(MOCK_DELAY)
    return constructionSites.find((s) => s.id === id)
  },

  async getProjects(): Promise<Project[]> {
    await delay(MOCK_DELAY)
    return projects
  },

  async getProject(id: string): Promise<Project | undefined> {
    await delay(MOCK_DELAY)
    return projects.find((p) => p.id === id)
  },

  async getAssets(): Promise<Asset[]> {
    await delay(MOCK_DELAY)
    return assets
  },

  async getAsset(id: string): Promise<Asset | undefined> {
    await delay(MOCK_DELAY)
    return assets.find((a) => a.id === id)
  },

  async getAssetByQr(qrCode: string): Promise<Asset | undefined> {
    await delay(MOCK_DELAY)
    return assets.find((a) => a.qrCode === qrCode || a.internalNumber === qrCode)
  },

  async getAssetCategories(): Promise<AssetCategory[]> {
    await delay(MOCK_DELAY)
    return assetCategories
  },

  async getAssetHistory(assetId: string): Promise<AssetHistoryEntry[]> {
    await delay(MOCK_DELAY)
    return assetHistory
      .filter((h) => h.assetId === assetId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },

  async checkoutAsset(assetId: string, employeeId: string, siteId?: string): Promise<Asset> {
    await delay(MOCK_DELAY)
    const asset = assets.find((a) => a.id === assetId)
    if (!asset) throw new Error('Náradie nebolo nájdené')
    asset.status = 'Na stavbe'
    asset.currentUserId = employeeId
    asset.currentSiteId = siteId
    asset.borrowedAt = new Date().toISOString()
    assetHistory.push({
      id: `hist-${Date.now()}`,
      assetId,
      employeeId,
      action: 'Prevzal',
      siteId,
      timestamp: new Date().toISOString(),
    })
    return asset
  },

  async returnAsset(assetId: string, employeeId: string): Promise<Asset> {
    await delay(MOCK_DELAY)
    const asset = assets.find((a) => a.id === assetId)
    if (!asset) throw new Error('Náradie nebolo nájdené')
    asset.status = 'Voľné'
    asset.currentUserId = undefined
    asset.currentSiteId = undefined
    asset.borrowedAt = undefined
    assetHistory.push({
      id: `hist-${Date.now()}`,
      assetId,
      employeeId,
      action: 'Odovzdal',
      timestamp: new Date().toISOString(),
    })
    return asset
  },

  async getVehicles(): Promise<Vehicle[]> {
    await delay(MOCK_DELAY)
    return vehicles
  },

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    await delay(MOCK_DELAY)
    return vehicles.find((v) => v.id === id)
  },

  async getInventory(): Promise<InventoryItem[]> {
    await delay(MOCK_DELAY)
    return inventoryItems
  },

  async getInventoryByCategory(category: string): Promise<InventoryItem[]> {
    await delay(MOCK_DELAY)
    return inventoryItems.filter((i) => i.category === category)
  },

  async getMeasuringDevices(): Promise<MeasuringDevice[]> {
    await delay(MOCK_DELAY)
    return measuringDevices
  },

  async getWarehouseItems(): Promise<WarehouseItem[]> {
    await delay(MOCK_DELAY)
    return warehouseItems
  },

  async getReservations(): Promise<Reservation[]> {
    await delay(MOCK_DELAY)
    return reservations
  },

  async getNotifications(): Promise<Notification[]> {
    await delay(MOCK_DELAY)
    return notifications
  },

  async markNotificationRead(id: string): Promise<void> {
    await delay(100)
    const notification = notifications.find((n) => n.id === id)
    if (notification) notification.read = true
  },

  async globalSearch(query: string): Promise<SearchResult[]> {
    await delay(200)
    const q = query.toLowerCase()
    if (!q.trim()) return []

    const results: SearchResult[] = []

    assets
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.manufacturer.toLowerCase().includes(q) ||
          a.internalNumber.toLowerCase().includes(q),
      )
      .forEach((a) =>
        results.push({
          id: a.id,
          type: 'náradie',
          title: a.name,
          subtitle: `${a.manufacturer} ${a.model} · ${a.internalNumber}`,
          href: `/naradie/${a.id}`,
        }),
      )

    projects
      .filter((p) => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q))
      .forEach((p) =>
        results.push({
          id: p.id,
          type: 'projekt',
          title: p.name,
          subtitle: p.client,
          href: `/projekty/${p.id}`,
        }),
      )

    employees
      .filter((e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q))
      .forEach((e) =>
        results.push({
          id: e.id,
          type: 'zamestnanec',
          title: e.name,
          subtitle: e.position,
          href: `/zamestnanci/${e.id}`,
        }),
      )

    constructionSites
      .filter((s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q))
      .forEach((s) =>
        results.push({
          id: s.id,
          type: 'stavba',
          title: s.name,
          subtitle: s.address,
          href: `/stavby/${s.id}`,
        }),
      )

    vehicles
      .filter(
        (v) =>
          v.licensePlate.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q),
      )
      .forEach((v) =>
        results.push({
          id: v.id,
          type: 'auto',
          title: `${v.brand} ${v.model}`,
          subtitle: v.licensePlate,
          href: `/auta/${v.id}`,
        }),
      )

    return results.slice(0, 12)
  },
}

export function getStatusColor(status: AssetStatus | string): string {
  const map: Record<string, string> = {
    Voľné: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Rezervované: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Na stavbe': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'V servise': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    Stratené: 'bg-red-500/15 text-red-400 border-red-500/30',
    Aktívna: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Aktívne: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Realizácia: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Príprava: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Dokončené: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Pozastavené: 'bg-red-500/15 text-red-400 border-red-500/30',
    Priradené: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  }
  return map[status] ?? 'bg-surface-elevated text-muted border-border'
}
