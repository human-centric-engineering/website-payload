import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: {
    verify: false, // Disabled for admin-only site (only 2 users)
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = args?.token || ''
        const resetURL = `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/reset/${token}`
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password for your HCE Venture Studio account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="margin: 30px 0;">
            <a href="${resetURL}"
               style="background-color: #0070f3; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link:<br/>
            ${resetURL}
          </p>
          <p style="color: #666; font-size: 14px;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
        </div>
      `
      },
      generateEmailSubject: () => 'Reset your password - HCE Venture Studio',
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}
