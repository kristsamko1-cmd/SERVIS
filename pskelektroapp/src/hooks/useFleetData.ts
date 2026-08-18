import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fleetService } from '@/services/fleetService'

export const fleetKeys = {
  all: ['fleet'] as const,
  dashboard: () => [...fleetKeys.all, 'dashboard'] as const,
  activities: () => [...fleetKeys.all, 'activities'] as const,
  chart: (type: string) => [...fleetKeys.all, 'chart', type] as const,
  employees: () => [...fleetKeys.all, 'employees'] as const,
  employee: (id: string) => [...fleetKeys.all, 'employee', id] as const,
  sites: () => [...fleetKeys.all, 'sites'] as const,
  site: (id: string) => [...fleetKeys.all, 'site', id] as const,
  projects: () => [...fleetKeys.all, 'projects'] as const,
  project: (id: string) => [...fleetKeys.all, 'project', id] as const,
  assets: () => [...fleetKeys.all, 'assets'] as const,
  asset: (id: string) => [...fleetKeys.all, 'asset', id] as const,
  assetHistory: (id: string) => [...fleetKeys.all, 'assetHistory', id] as const,
  assetCategories: () => [...fleetKeys.all, 'assetCategories'] as const,
  vehicles: () => [...fleetKeys.all, 'vehicles'] as const,
  vehicle: (id: string) => [...fleetKeys.all, 'vehicle', id] as const,
  inventory: () => [...fleetKeys.all, 'inventory'] as const,
  measuringDevices: () => [...fleetKeys.all, 'measuringDevices'] as const,
  warehouse: () => [...fleetKeys.all, 'warehouse'] as const,
  reservations: () => [...fleetKeys.all, 'reservations'] as const,
  notifications: () => [...fleetKeys.all, 'notifications'] as const,
  search: (q: string) => [...fleetKeys.all, 'search', q] as const,
}

export function useDashboardStats() {
  return useQuery({ queryKey: fleetKeys.dashboard(), queryFn: fleetService.getDashboardStats })
}

export function useActivities() {
  return useQuery({ queryKey: fleetKeys.activities(), queryFn: fleetService.getActivities })
}

export function useChartData(type: 'toolUsage' | 'projectsMonthly' | 'employeeWorkload' | 'warehouseStock') {
  return useQuery({ queryKey: fleetKeys.chart(type), queryFn: () => fleetService.getChartData(type) })
}

export function useEmployees() {
  return useQuery({ queryKey: fleetKeys.employees(), queryFn: fleetService.getEmployees })
}

export function useEmployee(id: string) {
  return useQuery({ queryKey: fleetKeys.employee(id), queryFn: () => fleetService.getEmployee(id), enabled: Boolean(id) })
}

export function useConstructionSites() {
  return useQuery({ queryKey: fleetKeys.sites(), queryFn: fleetService.getConstructionSites })
}

export function useConstructionSite(id: string) {
  return useQuery({ queryKey: fleetKeys.site(id), queryFn: () => fleetService.getConstructionSite(id), enabled: Boolean(id) })
}

export function useProjects() {
  return useQuery({ queryKey: fleetKeys.projects(), queryFn: fleetService.getProjects })
}

export function useProject(id: string) {
  return useQuery({ queryKey: fleetKeys.project(id), queryFn: () => fleetService.getProject(id), enabled: Boolean(id) })
}

export function useAssets() {
  return useQuery({ queryKey: fleetKeys.assets(), queryFn: fleetService.getAssets })
}

export function useAsset(id: string) {
  return useQuery({ queryKey: fleetKeys.asset(id), queryFn: () => fleetService.getAsset(id), enabled: Boolean(id) })
}

export function useAssetByQr(qrCode: string) {
  return useQuery({
    queryKey: [...fleetKeys.all, 'assetQr', qrCode],
    queryFn: () => fleetService.getAssetByQr(qrCode),
    enabled: Boolean(qrCode),
  })
}

export function useAssetCategories() {
  return useQuery({ queryKey: fleetKeys.assetCategories(), queryFn: fleetService.getAssetCategories })
}

export function useAssetHistory(assetId: string) {
  return useQuery({
    queryKey: fleetKeys.assetHistory(assetId),
    queryFn: () => fleetService.getAssetHistory(assetId),
    enabled: Boolean(assetId),
  })
}

export function useCheckoutAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ assetId, employeeId, siteId }: { assetId: string; employeeId: string; siteId?: string }) =>
      fleetService.checkoutAsset(assetId, employeeId, siteId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: fleetKeys.assets() })
      void qc.invalidateQueries({ queryKey: fleetKeys.activities() })
    },
  })
}

export function useReturnAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ assetId, employeeId }: { assetId: string; employeeId: string }) =>
      fleetService.returnAsset(assetId, employeeId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: fleetKeys.assets() })
      void qc.invalidateQueries({ queryKey: fleetKeys.activities() })
    },
  })
}

export function useVehicles() {
  return useQuery({ queryKey: fleetKeys.vehicles(), queryFn: fleetService.getVehicles })
}

export function useVehicle(id: string) {
  return useQuery({ queryKey: fleetKeys.vehicle(id), queryFn: () => fleetService.getVehicle(id), enabled: Boolean(id) })
}

export function useInventory() {
  return useQuery({ queryKey: fleetKeys.inventory(), queryFn: fleetService.getInventory })
}

export function useMeasuringDevices() {
  return useQuery({ queryKey: fleetKeys.measuringDevices(), queryFn: fleetService.getMeasuringDevices })
}

export function useWarehouseItems() {
  return useQuery({ queryKey: fleetKeys.warehouse(), queryFn: fleetService.getWarehouseItems })
}

export function useReservations() {
  return useQuery({ queryKey: fleetKeys.reservations(), queryFn: fleetService.getReservations })
}

export function useNotifications() {
  return useQuery({ queryKey: fleetKeys.notifications(), queryFn: fleetService.getNotifications })
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: fleetKeys.search(query),
    queryFn: () => fleetService.globalSearch(query),
    enabled: query.length >= 2,
  })
}
