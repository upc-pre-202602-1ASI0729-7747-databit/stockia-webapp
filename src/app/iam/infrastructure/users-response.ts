import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {UserRole} from '../domain/model/user-role';

/** A team member as the API sends it (GET /users, /users/me, /users/{id}). */
export interface UserResource extends BaseResource {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  restaurantId: number;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  locked?: boolean;
  lockedUntil?: string | null;
}

/** The signed-in user with its bearer token (sign-in and restaurant sign-up). */
export interface AuthenticatedUserResource extends UserResource {
  token: string;
}

/** Envelope for team lists (the API answers a plain array, handled by BaseApiEndpoint). */
export interface UsersResponse extends BaseResponse {
  users: UserResource[];
}
