import {inject, Service, signal} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {RestaurantRegistrationApi} from '../infrastructure/restaurant-registration-api';
import {Restaurant} from '../domain/model/restaurant.entity';
import {RegisterRestaurantCommand} from '../domain/model/register-restaurant.command';
import {IamStore} from '../../iam/application/iam.store';
import {User} from '../../iam/domain/model/user.entity';

/**
 * State of Restaurant Registration: the sign-up of a restaurant (it starts the owner's session) and
 * the restaurant data.
 * @author DataBit
 */
@Service()
export class RestaurantRegistrationStore {
  private readonly registrationApi = inject(RestaurantRegistrationApi);
  private readonly iamStore = inject(IamStore);
  private readonly restaurantSignal = signal<Restaurant | null>(null);
  readonly restaurant = this.restaurantSignal.asReadonly();

  async register(command: RegisterRestaurantCommand): Promise<User> {
    const owner = await firstValueFrom(this.registrationApi.register(command));
    return this.iamStore.startSession(owner);
  }

  loadRestaurant(): Promise<void> {
    return firstValueFrom(this.registrationApi.getCurrentRestaurant()).then(restaurant => this.restaurantSignal.set(restaurant));
  }

  async updateRestaurant(restaurant: Restaurant): Promise<void> {
    const updated = await firstValueFrom(this.registrationApi.updateCurrentRestaurant(restaurant));
    this.restaurantSignal.set(updated);
    this.iamStore.renameRestaurant(updated.name);
  }
}
