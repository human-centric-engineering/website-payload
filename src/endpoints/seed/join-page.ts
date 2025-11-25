import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Form } from '@/payload-types'

type JoinArgs = {
  joinForm: Form
}

export const joinPage: (args: JoinArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  joinForm,
}) => {
  return {
    slug: 'join',
    _status: 'published',
    hero: {
      type: 'lowImpact',
      links: [],
      richText: {
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
                  text: 'Join the Network',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h1',
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
                  text: 'Be part of building the future of entrepreneurship',
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
    },
    layout: [
      {
        blockName: 'Intro',
        blockType: 'content',
        columns: [
          {
            richText: {
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
                        text: 'Building a Network of Innovators',
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
                        text: 'A key part of our vision is to build the studio as a network of people who share the vision and can collaborate and contribute to building the studio, the platform, and the ventures.',
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
                        text: 'We\'re looking for builders, strategists, marketers, designers, engineers, and other specialists who are excited about redefining entrepreneurship in the AI age.',
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
            size: 'twoThirds',
          },
        ],
      },
      {
        blockName: 'Join Form',
        blockType: 'formBlock',
        enableIntro: false,
        form: joinForm.id,
      },
    ],
    meta: {
      description:
        'Join the HCE Venture Studio network. Collaborate with innovators, strategists, and builders to create the next generation of AI-powered ventures.',
      title: 'Join the Network | HCE Venture Studio',
    },
    title: 'Join Us',
  }
}
