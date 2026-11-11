/**
 * Credentials typed in the sign-in form.
 * @author DataBit
 */
export class SignInCommand {
  constructor(readonly email: string, readonly password: string) {}
}
