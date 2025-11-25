import type { RequiredDataFromCollectionSlug } from 'payload'

type ProjectArgs = {
  heroImageID: string
}

export const ventureProject1: (
  args: ProjectArgs,
) => RequiredDataFromCollectionSlug<'projects'> = ({ heroImageID }) => {
  return {
    slug: 'ai-market-research-platform',
    _status: 'published',
    title: 'AI-Powered Market Research Platform',
    projectType: 'venture',
    projectStatus: 'in-development',
    heroImage: heroImageID,
    excerpt:
      'An intelligent platform that democratises market research by combining AI analysis with human insight, making sophisticated market intelligence accessible to startups and SMEs.',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                text: 'Reimagining Market Research',
              },
            ],
            tag: 'h2',
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Traditional market research is expensive, time-consuming, and often inaccessible to smaller organisations. Our AI-powered platform changes that by combining automated data gathering, intelligent analysis, and expert validation to deliver actionable insights at a fraction of the traditional cost.',
              },
            ],
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                text: 'Key Features',
              },
            ],
            tag: 'h2',
          },
          {
            type: 'list',
            listType: 'bullet',
            children: [
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Automated data collection from multiple sources',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'AI-driven analysis and trend identification',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Expert validation and contextualisation',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Interactive dashboards and reporting',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Collaborative workspace for teams',
                  },
                ],
              },
            ],
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                text: 'Current Status',
              },
            ],
            tag: 'h2',
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Currently in development with pilot customers providing feedback. Expected beta launch in Q2 2026.',
              },
            ],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    technologies: [
      { tech: 'Next.js' },
      { tech: 'Python' },
      { tech: 'TensorFlow' },
      { tech: 'PostgreSQL' },
      { tech: 'Redis' },
      { tech: 'OpenAI API' },
    ],
    links: {
      website: 'https://example.com/market-research',
      caseStudy: '',
      repository: '',
    },
    meta: {
      title: 'AI-Powered Market Research Platform | HCE Venture Studio',
      description:
        'Democratising market research through AI analysis and human insight. Making sophisticated market intelligence accessible to startups and SMEs.',
    },
  }
}

export const agencyProject1: (
  args: ProjectArgs,
) => RequiredDataFromCollectionSlug<'projects'> = ({ heroImageID }) => {
  return {
    slug: 'enterprise-crm-modernisation',
    _status: 'published',
    title: 'Enterprise CRM Modernisation',
    projectType: 'agency',
    projectStatus: 'completed',
    heroImage: heroImageID,
    excerpt:
      'Complete overhaul of a legacy CRM system for a multinational professional services firm, improving user experience and operational efficiency whilst maintaining critical business processes.',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                text: 'The Challenge',
              },
            ],
            tag: 'h2',
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Our client, a global professional services firm with over 5,000 employees, was operating on a 15-year-old CRM system that had become a bottleneck for their sales and client management teams. The system was slow, unintuitive, and lacked integration with modern tools.',
              },
            ],
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                text: 'Our Approach',
              },
            ],
            tag: 'h2',
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'We conducted extensive user research across multiple offices and departments to understand pain points and requirements. Rather than a simple lift-and-shift, we redesigned workflows and data structures to match how the business actually operates today.',
              },
            ],
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                text: 'Outcomes',
              },
            ],
            tag: 'h2',
          },
          {
            type: 'list',
            listType: 'bullet',
            children: [
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: '60% reduction in time spent on routine CRM tasks',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: '95% user adoption within first 3 months',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Seamless integration with Outlook, Teams, and other Microsoft 365 tools',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Real-time reporting and analytics dashboard',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Zero data loss during migration',
                  },
                ],
              },
            ],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    technologies: [
      { tech: 'React' },
      { tech: 'Node.js' },
      { tech: 'Microsoft SQL Server' },
      { tech: 'Azure' },
      { tech: 'Power BI' },
      { tech: 'Microsoft Graph API' },
    ],
    links: {
      website: '',
      caseStudy: 'https://example.com/case-studies/crm-modernisation',
      repository: '',
    },
    meta: {
      title: 'Enterprise CRM Modernisation Case Study | HCE',
      description:
        'Complete overhaul of a legacy CRM system for a multinational professional services firm, improving efficiency and user adoption.',
    },
  }
}

export const agencyProject2: (
  args: ProjectArgs,
) => RequiredDataFromCollectionSlug<'projects'> = ({ heroImageID }) => {
  return {
    slug: 'sustainable-ecommerce-platform',
    _status: 'published',
    title: 'Sustainable Fashion E-Commerce Platform',
    projectType: 'agency',
    projectStatus: 'active',
    heroImage: heroImageID,
    excerpt:
      'A purpose-built e-commerce platform for an ethical fashion brand, designed to showcase sustainability credentials and tell the story behind each product whilst delivering a seamless shopping experience.',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                text: 'Putting Values First',
              },
            ],
            tag: 'h2',
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Our client is a UK-based sustainable fashion brand committed to transparency and ethical production. They needed an e-commerce platform that could tell the story of each garment—from the organic farm where the cotton was grown to the fair-trade factory where it was sewn—without compromising on performance or user experience.',
              },
            ],
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                text: 'Technical Innovation',
              },
            ],
            tag: 'h2',
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'We built a headless commerce platform using modern JAMstack architecture for lightning-fast page loads and SEO performance. Each product includes a detailed sustainability scorecard, supplier information, and environmental impact data, all managed through an intuitive CMS.',
              },
            ],
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                text: 'Key Features',
              },
            ],
            tag: 'h2',
          },
          {
            type: 'list',
            listType: 'bullet',
            children: [
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Product sustainability scorecards and supply chain transparency',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Carbon-neutral hosting and optimised for minimal environmental impact',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Integration with ethical payment processors',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Size recommendation engine to reduce returns',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Multi-currency and international shipping',
                  },
                ],
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Since launch, the platform has helped the brand grow their online revenue by 240% whilst maintaining their commitment to transparency and sustainability.',
              },
            ],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    technologies: [
      { tech: 'Next.js' },
      { tech: 'Shopify' },
      { tech: 'Payload CMS' },
      { tech: 'Stripe' },
      { tech: 'Vercel' },
      { tech: 'Algolia' },
    ],
    links: {
      website: 'https://example.com/sustainable-fashion',
      caseStudy: 'https://example.com/case-studies/sustainable-fashion',
      repository: '',
    },
    meta: {
      title: 'Sustainable Fashion E-Commerce Platform | HCE',
      description:
        'A purpose-built e-commerce platform showcasing sustainability credentials and ethical production whilst delivering seamless shopping.',
    },
  }
}
