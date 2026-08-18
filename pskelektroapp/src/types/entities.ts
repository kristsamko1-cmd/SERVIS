export type UserRole = 'Administrátor' | 'Projektový manažér' | 'Technik' | 'Vedúci montáže'

export type ProjectStatus = 'Príprava' | 'Realizácia' | 'Dokončené' | 'Pozastavené'

export type AssetStatus = 'Voľné' | 'Rezervované' | 'Na stavbe' | 'V servise' | 'Stratené'

export type VehicleStatus = 'Aktívne' | 'Servis' | 'Mimo prevádzky'

export type InventoryCategory =
  | 'Notebook'
  | 'Telefón'
  | 'Monitor'
  | 'Tablet'
  | 'Tlačiareň'
  | 'Licencia'
  | 'SIM karta'
  | 'Kancelárske vybavenie'

export type ReservationResourceType = 'náradie' | 'auto' | 'notebook' | 'merací prístroj'

export type HistoryAction =
  | 'Prevzal'
  | 'Odovzdal'
  | 'Rezervoval'
  | 'Priradené'
  | 'Servis'
  | 'Naskenované'
  | 'Pridané'
  | 'Upravené'

export type NotificationType =
  | 'servis'
  | 'stk'
  | 'rezervácia'
  | 'vybavenie'
  | 'projekt'

export interface User {
  id: string
  email: string
  role: UserRole
  employeeId?: string
  createdAt: string
}

export interface Employee {
  id: string
  name: string
  photoUrl?: string
  email: string
  phone: string
  position: string
  department: string
  employmentType: string
  startDate: string
  currentSiteId?: string
  currentProjectId?: string
  supervisorId?: string
  assignedEquipmentIds: string[]
  isOnline: boolean
  createdAt: string
}

export interface ConstructionSite {
  id: string
  name: string
  address: string
  gps?: { lat: number; lng: number }
  status: 'Aktívna' | 'Dokončená' | 'Pozastavená'
  projectIds: string[]
  workerIds: string[]
  createdAt: string
}

export interface Project {
  id: string
  name: string
  client: string
  address: string
  gps?: { lat: number; lng: number }
  managerId: string
  siteId?: string
  startDate: string
  endDate: string
  status: ProjectStatus
  workerIds: string[]
  toolIds: string[]
  vehicleIds: string[]
  documents: ProjectDocument[]
  photos: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ProjectDocument {
  id: string
  name: string
  url: string
  uploadedAt: string
}

export interface AssetCategory {
  id: string
  name: string
  description?: string
}

export interface Asset {
  id: string
  name: string
  categoryId: string
  manufacturer: string
  model: string
  serialNumber: string
  internalNumber: string
  qrCode: string
  photoUrl?: string
  status: AssetStatus
  currentUserId?: string
  currentSiteId?: string
  borrowedAt?: string
  createdAt: string
}

export interface AssetAssignment {
  id: string
  assetId: string
  employeeId: string
  projectId?: string
  siteId?: string
  assignedAt: string
  returnedAt?: string
}

export interface AssetHistoryEntry {
  id: string
  assetId: string
  employeeId: string
  action: HistoryAction
  siteId?: string
  projectId?: string
  note?: string
  timestamp: string
}

export interface QrCode {
  id: string
  code: string
  entityType: 'asset' | 'inventory' | 'vehicle'
  entityId: string
  createdAt: string
}

export interface Vehicle {
  id: string
  licensePlate: string
  brand: string
  model: string
  year: number
  photoUrl?: string
  driverId?: string
  status: VehicleStatus
  mileage: number
  lastServiceDate: string
  nextServiceDate: string
  stkExpiry: string
  insuranceExpiry: string
  gps?: { lat: number; lng: number }
  projectId?: string
  createdAt: string
}

export interface InventoryItem {
  id: string
  name: string
  category: InventoryCategory
  serialNumber: string
  qrCode: string
  photoUrl?: string
  assignedUserId?: string
  status: 'Voľné' | 'Priradené' | 'V servise' | 'Vyradené'
  createdAt: string
}

export interface Reservation {
  id: string
  resourceType: ReservationResourceType
  resourceId: string
  employeeId: string
  projectId?: string
  startDate: string
  endDate: string
  note?: string
  status: 'Aktívna' | 'Dokončená' | 'Zrušená'
  createdAt: string
}

export interface ActivityEntry {
  id: string
  employeeId: string
  action: HistoryAction
  entityType: string
  entityName: string
  siteName?: string
  timestamp: string
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  entityId?: string
  entityType?: string
  createdAt: string
}

export interface WarehouseItem {
  id: string
  name: string
  category: string
  sku: string
  quantity: number
  minQuantity: number
  unit: string
  location: string
  lastRestocked: string
}

export interface MeasuringDevice {
  id: string
  name: string
  manufacturer: string
  model: string
  serialNumber: string
  calibrationDate: string
  nextCalibrationDate: string
  assignedUserId?: string
  status: 'Aktívny' | 'Kalibrácia' | 'Vyradený'
  qrCode: string
}

export interface DashboardStats {
  activeSites: number
  employeesOnline: number
  toolsCount: number
  inventoryCount: number
  vehiclesCount: number
  activeReservations: number
}

export interface SearchResult {
  id: string
  type: 'náradie' | 'projekt' | 'zamestnanec' | 'stavba' | 'auto' | 'inventár'
  title: string
  subtitle: string
  href: string
}

export interface ChartDataPoint {
  label: string
  value: number
}
