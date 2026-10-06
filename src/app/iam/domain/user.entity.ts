import { UserRole } from './role.enum';

// Entidad de dominio User & Access Management — independiente de HTTP/Angular.
export class User {
  constructor(
    public id: number,
    public fullName: string,
    public email: string,
    public restaurantName: string,
    public role: UserRole,
    public password?: string,
  ) {}

  static fromJson(json: any): User {
    return new User(json.id, json.fullName, json.email, json.restaurantName, json.role, json.password);
  }
}
