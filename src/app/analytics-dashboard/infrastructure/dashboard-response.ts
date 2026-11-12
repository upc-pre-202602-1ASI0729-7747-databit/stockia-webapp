import {SavingsLine} from '../domain/model/weekly-savings.entity';

/** GET /dashboard/weekly-savings */
export interface WeeklySavingsResource {
  from: string;
  to: string;
  estimatedSavings: number;
  rescuedValue: number;
  previousRescuedValue: number;
  wasteValue: number;
  previousWasteValue: number;
  wasteReduction: number;
  confirmedSales: number;
  portionsSold: number;
  revenue: number;
  previousRevenue: number;
  projectedUnitsNextWeek: number;
  forecastConfidence: number | null;
  topRescued: SavingsLine[];
  wasted: SavingsLine[];
}
