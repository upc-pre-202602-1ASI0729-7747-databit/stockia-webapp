import {BaseResource} from '../../shared/infrastructure/base-response';

export interface RestaurantResource extends BaseResource {
  id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
}
