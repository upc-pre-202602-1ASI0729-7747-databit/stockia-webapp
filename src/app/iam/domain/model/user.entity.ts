import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {UserRole} from './user-role';

/**
 * A member of the restaurant team, with the restaurant data shown next to the user.
 * @author DataBit
 */
export class User implements BaseEntity {
  #id: number;
  #fullName: string;
  #email: string;
  #role: UserRole;
  #restaurantId: number;
  #restaurantName: string;
  #restaurantAddress: string;
  #restaurantPhone: string;
  #locked: boolean;
  #lockedUntil: Date | null;

  constructor(user: {id?: number; fullName?: string; email?: string; role?: UserRole; restaurantId?: number; restaurantName?: string;
    restaurantAddress?: string; restaurantPhone?: string; locked?: boolean; lockedUntil?: Date | null}) {
    this.#id = user.id ?? 0;
    this.#fullName = user.fullName ?? '';
    this.#email = user.email ?? '';
    this.#role = user.role ?? 'EMPLOYEE';
    this.#restaurantId = user.restaurantId ?? 0;
    this.#restaurantName = user.restaurantName ?? '';
    this.#restaurantAddress = user.restaurantAddress ?? '';
    this.#restaurantPhone = user.restaurantPhone ?? '';
    this.#locked = user.locked ?? false;
    this.#lockedUntil = user.lockedUntil ?? null;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get fullName(): string { return this.#fullName; }
  set fullName(value: string) { this.#fullName = value; }
  get email(): string { return this.#email; }
  set email(value: string) { this.#email = value; }
  get role(): UserRole { return this.#role; }
  set role(value: UserRole) { this.#role = value; }
  get restaurantId(): number { return this.#restaurantId; }
  get restaurantName(): string { return this.#restaurantName; }
  set restaurantName(value: string) { this.#restaurantName = value; }
  get restaurantAddress(): string { return this.#restaurantAddress; }
  get restaurantPhone(): string { return this.#restaurantPhone; }
  get locked(): boolean { return this.#locked; }
  get lockedUntil(): Date | null { return this.#lockedUntil; }

  get isAdmin(): boolean {
    return this.#role === 'ADMIN';
  }

  /** Initials for the avatar of the toolbar ("Carla Gallardo" → "CG"). */
  get initials(): string {
    return this.#fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]!.toUpperCase()).join('');
  }
}
