import {
  BoldFeature,
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  IndentFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  UnderlineFeature,
  lexicalEditor,
  type LinkFields,
} from '@payloadcms/richtext-lexical'
import type { TextFieldSingleValidation } from 'payload'
import { MediaBlock } from '@/blocks/MediaBlock/config'

export const whitepaperLexical = lexicalEditor({
  features: [
    ParagraphFeature(),
    HeadingFeature({
      enabledHeadingSizes: ['h2', 'h3', 'h4'],
    }),
    UnorderedListFeature(),
    OrderedListFeature(),
    IndentFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature({
      enabledCollections: ['pages', 'posts'],
      fields: ({ defaultFields }) => {
        const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
          if ('name' in field && field.name === 'url') return false
          return true
        })

        return [
          ...defaultFieldsWithoutUrl,
          {
            name: 'url',
            type: 'text',
            admin: {
              condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
            },
            label: ({ t }) => t('fields:enterURL'),
            required: true,
            validate: ((value, options) => {
              if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                return true
              }
              return value ? true : 'URL is required'
            }) as TextFieldSingleValidation,
          },
        ]
      },
    }),
    BlocksFeature({
      blocks: [MediaBlock],
    }),
    EXPERIMENTAL_TableFeature(),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
