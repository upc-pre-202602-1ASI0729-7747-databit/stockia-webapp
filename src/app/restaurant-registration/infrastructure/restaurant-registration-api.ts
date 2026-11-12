import {inject, Service} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {ApiError} from '../../shared/infrastructure/api-error';
import {environment} from '../../../environments/environment';
import {Restaurant} from '../domain/model/restaurant.entity';
import {RegisterRestaurantCommand} from '../domain/model/register-restaurant.command';
import {AuthenticatedUserResource} from '../../iam/infrastructure/users-response';
import {RestaurantAssembler} from './restaurant-assembler';
import {RestaurantResource} from './restaurants-response';

/**
 * Facade of the Restaurant Registration API (sign-up and restaurant data).
 * @author DataBit
 */
@Service()
export class RestaurantRegistrationApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly assembler = new RestaurantAssembler();
  private readonly registrationsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderRestaurantRegistrationsEndpointPath}`;
  private readonly restaurantsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderRestaurantsEndpointPath}`;

  /** Registers the restaurant and its owner; the answer is the owner, already signed in. */
  register(command: RegisterRestaurantCommand): Observable<AuthenticatedUserResource> {
    return this.http.post<AuthenticatedUserResource>(this.registrationsUrl, {
      fullName: command.fullName.trim(), restaurantName: command.restaurantName.trim(), email: command.email.trim(), password: command.password
    }).pipe(catchError(error => throwError(() => ApiError.from(error))));
  }

  getCurrentRestaurant(): Observable<Restaurant> {
    return this.http.get<RestaurantResource>(`${this.restaurantsUrl}/current`).pipe(map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(error => throwError(() => ApiError.from(error))));
  }

  updateCurrentRestaurant(restaurant: Restaurant): Observable<Restaurant> {
    return this.http.put<RestaurantResource>(`${this.restaurantsUrl}/current`, this.assembler.toUpdateResourceFromEntity(restaurant)).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)), catchError(error => throwError(() => ApiError.from(error))));
  }
}
