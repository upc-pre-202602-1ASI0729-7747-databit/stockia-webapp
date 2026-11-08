import {WeeklySavings} from '../domain/model/weekly-savings.entity';
import {WeeklySavingsResource} from './dashboard-response';

/**
 * Translates the weekly savings answered by the API.
 * @author DataBit
 */
export class WeeklySavingsAssembler {
  toEntityFromResource(resource: WeeklySavingsResource): WeeklySavings {
    const line =
      (item: {itemName: string; unit: string; quantity: string | number; value: number}) =>
      ({itemName: item.itemName, unit: item.unit, quantity: String(item.quantity), value: Number(item.value)});

    return new WeeklySavings(resource.from, resource.to, Number(resource.estimatedSavings), Number(resource.rescuedValue),
      Number(resource.wasteValue), Number(resource.previousWasteValue), Number(resource.wasteReduction), resource.confirmedSales,
      resource.portionsSold, Number(resource.revenue), Number(resource.previousRevenue), resource.topRescued.map(line),
      resource.wasted.map(line));
  }
}
