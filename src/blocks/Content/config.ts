import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'One Third',
        value: 'oneThird',
      },
      {
        label: 'Half',
        value: 'half',
      },
      {
        label: 'Two Thirds',
        value: 'twoThirds',
      },
      {
        label: 'Full',
        value: 'full',
      },
    ],
  },
  {
    name: 'icon',
    type: 'text',
    admin: {
      description: 'Lucide icon name (e.g., "Rocket", "Users", "Sparkles")',
    },
  },
  {
    name: 'media',
    type: 'upload',
    relationTo: 'media',
    admin: {
      description: 'Optional image for this column',
    },
  },
  {
    name: 'imageFit',
    type: 'select',
    defaultValue: 'cover',
    admin: {
      description: 'How the image should fit in the column',
      condition: (data, siblingData) => Boolean(siblingData?.media),
    },
    options: [
      {
        label: 'Cover (crop to fill)',
        value: 'cover',
      },
      {
        label: 'Contain (preserve aspect ratio)',
        value: 'contain',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'enableLink',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'blockStyle',
      type: 'select',
      defaultValue: 'default',
      admin: {
        description: 'Visual style for this content block',
      },
      options: [
        {
          label: 'Default',
          value: 'default',
        },
        {
          label: 'Featured Panel (darker background)',
          value: 'featured',
        },
        {
          label: 'With Top Divider',
          value: 'withDivider',
        },
      ],
    },
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
