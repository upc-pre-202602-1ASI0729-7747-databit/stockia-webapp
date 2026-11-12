import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {User} from '../domain/model/user.entity';
import {UserResource, UsersResponse} from './users-response';

/**
 * Translates team members between the API resources and the domain.
 * @author DataBit
 */
export class UserAssembler implements BaseAssembler<User, UserResource, UsersResponse> {
  toEntityFromResource(resource: UserResource): User {
    return new User({
      id: resource.id, fullName: resource.fullName, email: resource.email, role: resource.role, restaurantId: resource.restaurantId,
      restaurantName: resource.restaurantName, restaurantAddress: resource.restaurantAddress, restaurantPhone: resource.restaurantPhone,
      locked: resource.locked ?? false, lockedUntil: resource.lockedUntil ? new Date(resource.lockedUntil) : null
    });
  }

  toResourceFromEntity(entity: User): UserResource {
    return {
      id: entity.id, fullName: entity.fullName, email: entity.email, role: entity.role, restaurantId: entity.restaurantId,
      restaurantName: entity.restaurantName, restaurantAddress: entity.restaurantAddress, restaurantPhone: entity.restaurantPhone
    };
  }

  toEntitiesFromResponse(response: UsersResponse): User[] {
    return response.users.map(resource => this.toEntityFromResource(resource));
  }
}
