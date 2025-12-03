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

    req.payload.logger.info('Email sent successfully', {
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
    })

    return { success: true }
  } catch (error) {
    // Log error with context but don't expose details to user
    req.payload.logger.error('Failed to send email', {
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return {
      success: false,
      error: 'Failed to send email. Please try again later.',
    }
  }
}
