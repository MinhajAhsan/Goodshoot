// Email interface. Phase 1: logs to the server console (no external calls).
// Phase 4: swap `deliver()` for a real Resend implementation — call sites stay the same.

export type EmailTemplate =
  | "quote_generated"
  | "consultation_scheduled"
  | "booking_confirmed"
  | "deliverables_uploaded"
  | "booking_completed"
  | "innovator_new_consultation"
  | "innovator_new_lead";

export interface SendEmailInput {
  to: string;
  template: EmailTemplate;
  subject: string;
  data?: Record<string, unknown>;
}

async function deliver(input: SendEmailInput): Promise<void> {
  // --- Phase 1 stub ---
  console.info(
    `[email:stub] → ${input.to} | ${input.template} | "${input.subject}"`,
    input.data ?? {}
  );

  // --- Phase 4 (Resend) will look like: ---
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from, to: input.to, subject: input.subject, react: <Template .../> });
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  try {
    await deliver(input);
  } catch (err) {
    // Never let a failed notification break the request flow.
    console.error(`[email] failed to send ${input.template} to ${input.to}`, err);
  }
}
