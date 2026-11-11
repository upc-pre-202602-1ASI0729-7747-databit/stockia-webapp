/**
 * Answer of "Forgot your password?". simulatedEmail is only present while the email provider of the
 * API is simulated (demo mode), so the recovery link can be opened without a real mailbox.
 * @author DataBit
 */
export interface PasswordResetRequest {
  message: string;
  sentTo: string;
  simulatedEmail: {to: string; subject: string; resetLink: string; code: string; expiresAt: string} | null;
}
