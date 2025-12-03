import type { PayloadRequest } from 'payload'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
}

/**
 * Safely send email with error handling and logging
 * Follows project pattern: send* for actions
 */
export async function sendEmailSafely(
  req: PayloadRequest,
  options: SendEmailOptions,
): Promise<{ success: boolean; error?: string }> {
  try {
    await req.payload.sendEmail({
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    const toAddress = Array.isArray(options.to) ? options.to.join(', ') : options.to
    req.payload.logger.info(`Email sent successfully to ${toAddress}: ${options.subject}`)

    return { success: true }
  } catch (error) {
    // Log error with context but don't expose details to user
    const toAddress = Array.isArray(options.to) ? options.to.join(', ') : options.to
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    req.payload.logger.error(`Failed to send email to ${toAddress}: ${options.subject} - ${errorMessage}`)

    return {
      success: false,
      error: 'Failed to send email. Please try again later.',
    }
  }
}
