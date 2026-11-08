export interface DashboardSummary {
  registeredSupplies: number;
  lowOrCriticalSupplies: number;
  expiredSupplies: number;
  expiringSoonSupplies: number;
  inventoryValue: number;
  confirmedSales: number;
  revenue: number;
  revenueToday: number;
  pendingAlerts: number;
  latestForecastId: number | null;
  projectedUnitsNext7Days: number;
  forecastConfidence: number | null;
}
