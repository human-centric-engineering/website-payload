import { RequiredDataFromCollectionSlug } from 'payload'

export const joinForm: RequiredDataFromCollectionSlug<'forms'> = {
  confirmationMessage: {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Thank you for your interest!',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          tag: 'h2',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'We\'ve received your application to join the HCE network. We\'ll review your submission and get back to you soon.',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  },
  confirmationType: 'message',
  emails: [
    {
      emailFrom: '"HCE Venture Studio" <noreply@humancentricengineering.com>',
      emailTo: '{{email}}',
      message: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Thank you for your interest in joining the HCE Venture Studio network. We\'ve received your application and will review it shortly.',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'We\'re excited about the possibility of collaborating with you.',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      subject: 'Thank you for your interest in HCE Venture Studio',
    },
  ],
  fields: [
    {
      name: 'name',
      blockName: 'name',
      blockType: 'text',
      label: 'Name',
      required: true,
      width: 100,
    },
    {
      name: 'email',
      blockName: 'email',
      blockType: 'email',
      label: 'Email',
      required: true,
      width: 100,
    },
    {
      name: 'why-join',
      blockName: 'why-join',
      blockType: 'textarea',
      label: 'Why you\'d like to join',
      required: true,
      width: 100,
    },
    {
      name: 'what-you-bring',
      blockName: 'what-you-bring',
      blockType: 'textarea',
      label: 'What you bring with you (skills, experience, etc.)',
      required: true,
      width: 100,
    },
  ],
  redirect: undefined,
  submitButtonLabel: 'Submit Application',
  title: 'Join the Network',
  updatedAt: '2025-01-25T12:00:00.000Z',
  createdAt: '2025-01-25T12:00:00.000Z',
}
