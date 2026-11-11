import {Restaurant} from '../domain/model/restaurant.entity';
import {RestaurantResource} from './restaurants-response';

/**
 * Translates the restaurant data.
 * @author DataBit
 */
export class RestaurantAssembler {
  toEntityFromResource(resource: RestaurantResource): Restaurant {
    return new Restaurant(resource.id, resource.name, resource.address ?? '', resource.phone ?? '', resource.latitude, resource.longitude);
  }

  /** Body of PUT /restaurants/current. */
  toUpdateResourceFromEntity(entity: Restaurant): {name: string; address: string; phone: string} {
    return {name: entity.name.trim(), address: entity.address.trim(), phone: entity.phone.trim()};
  }
}
