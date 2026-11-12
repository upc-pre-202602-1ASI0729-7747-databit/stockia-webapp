/**
 * Roles of the restaurant team. The Administrator has full access; the Employee cannot open Roles &
 * permissions, Recommendations or the subscription.
 * @author DataBit
 */
export type UserRole = 'ADMIN' | 'EMPLOYEE';

export const USER_ROLES: UserRole[] = ['ADMIN', 'EMPLOYEE'];
