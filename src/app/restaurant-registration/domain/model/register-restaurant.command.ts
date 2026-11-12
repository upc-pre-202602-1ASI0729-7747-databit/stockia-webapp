/**
 * Sign-up of a restaurant: the owner becomes its first Administrator and gets the free plan.
 * @author DataBit
 */
export class RegisterRestaurantCommand {
  constructor(readonly fullName: string, readonly restaurantName: string, readonly email: string, readonly password: string) {}
}
