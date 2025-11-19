# API Client Examples

## Server-Side (Payload Local API)

### Basic Document Fetching

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getPublishedPages() {
  const payload = await getPayload({ config: configPromise })

  const pages = await payload.find({
    collection: 'pages',
    where: {
      _status: {
        equals: 'published',
      },
    },
    limit: 100,
    sort: '-createdAt',
    depth: 1,
  })

  return pages.docs
}
```

---

### Finding Single Document

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getPageBySlug(slug: string) {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
  })

  return result.docs[0] || null
}
```

---

### Creating Documents

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function createPost(data: {
  title: string
  slug: string
  authorId: string
}) {
  const payload = await getPayload({ config: configPromise })

  const post = await payload.create({
    collection: 'posts',
    data: {
      title: data.title,
      slug: data.slug,
      author: data.authorId,
      _status: 'draft',
      layout: [],
    },
  })

  return post
}
```

---

### Updating Documents

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function publishPost(postId: string) {
  const payload = await getPayload({ config: configPromise })

  const post = await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      _status: 'published',
      publishedAt: new Date().toISOString(),
    },
  })

  return post
}
```

---

### Deleting Documents

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function deletePost(postId: string) {
  const payload = await getPayload({ config: configPromise })

  await payload.delete({
    collection: 'posts',
    id: postId,
  })

  return { success: true }
}
```

---

### Querying with Complex Filters

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getRecentTechPosts() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    where: {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
        {
          categories: {
            in: ['technology', 'software'],  // Array of category IDs
          },
        },
        {
          publishedAt: {
            greater_than: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      ],
    },
    sort: '-publishedAt',
    limit: 10,
    depth: 2,
  })

  return posts.docs
}
```

---

### File Upload

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import fs from 'fs'

export async function uploadImage(filePath: string, alt: string) {
  const payload = await getPayload({ config: configPromise })

  const fileBuffer = fs.readFileSync(filePath)

  const media = await payload.create({
    collection: 'media',
    data: {
      alt,
    },
    file: {
      data: fileBuffer,
      mimetype: 'image/jpeg',
      name: 'uploaded-image.jpg',
      size: fileBuffer.length,
    },
  })

  return media
}
```

---

## Client-Side (REST API)

### React Hook for Fetching Data

```typescript
'use client'

import { useEffect, useState } from 'react'
import type { Page } from '@/payload-types'

export function usePage(slug: string) {
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPage() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/pages?where[slug][equals]=${slug}&limit=1&depth=2`,
          {
            credentials: 'include',
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        setPage(data.docs[0] || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch page')
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [slug])

  return { page, loading, error }
}
```

**Usage**:

```typescript
'use client'

import { usePage } from '@/hooks/usePage'

export default function PageComponent({ slug }: { slug: string }) {
  const { page, loading, error } = usePage(slug)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!page) return <div>Page not found</div>

  return (
    <div>
      <h1>{page.title}</h1>
      {/* Render page content */}
    </div>
  )
}
```

---

### Creating Content with Form

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatePageForm() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          slug,
          layout: [],
          _status: 'draft',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.errors?.[0]?.message || 'Failed to create page')
        return
      }

      // Success - redirect to edit page
      router.push(`/admin/collections/pages/${data.doc.id}`)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Page Title"
        required
      />

      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="page-slug"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Page'}
      </button>
    </form>
  )
}
```

---

### File Upload Component

```typescript
'use client'

import { useState } from 'react'

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [alt, setAlt] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', alt)

      const response = await fetch('/api/media', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadedUrl(data.doc.url)
        setFile(null)
        setAlt('')
      } else {
        alert(data.errors?.[0]?.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        required
      />

      <input
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        placeholder="Image description"
      />

      <button type="submit" disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>

      {uploadedUrl && (
        <div>
          <p>Uploaded successfully!</p>
          <img src={uploadedUrl} alt={alt} />
        </div>
      )}
    </form>
  )
}
```

---

## TypeScript Client Class

### Reusable API Client

```typescript
// lib/payloadClient.ts
import type { Page, Post, Media, User } from '@/payload-types'

type Collection = 'pages' | 'posts' | 'media' | 'users'

interface FindOptions {
  where?: Record<string, any>
  limit?: number
  page?: number
  sort?: string
  depth?: number
}

class PayloadClient {
  private baseUrl: string
  private defaultHeaders: HeadersInit

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0]?.message || 'Request failed')
    }

    return response.json()
  }

  async find<T>(
    collection: Collection,
    options: FindOptions = {}
  ): Promise<{ docs: T[]; totalDocs: number; limit: number; page: number }> {
    const params = new URLSearchParams()

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([operator, val]) => {
            params.append(`where[${key}][${operator}]`, String(val))
          })
        } else {
          params.append(`where[${key}]`, String(value))
        }
      })
    }

    if (options.limit) params.append('limit', String(options.limit))
    if (options.page) params.append('page', String(options.page))
    if (options.sort) params.append('sort', options.sort)
    if (options.depth !== undefined) params.append('depth', String(options.depth))

    const query = params.toString()
    const endpoint = `/${collection}${query ? `?${query}` : ''}`

    return this.request<any>(endpoint)
  }

  async findById<T>(
    collection: Collection,
    id: string,
    depth = 1
  ): Promise<T> {
    return this.request<T>(`/${collection}/${id}?depth=${depth}`)
  }

  async create<T>(collection: Collection, data: any): Promise<{ doc: T }> {
    return this.request<{ doc: T }>(`/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update<T>(
    collection: Collection,
    id: string,
    data: any
  ): Promise<{ doc: T }> {
    return this.request<{ doc: T }>(`/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete(collection: Collection, id: string): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/${collection}/${id}`, {
      method: 'DELETE',
    })
  }

  async uploadFile(file: File, data: Record<string, any> = {}): Promise<{ doc: Media }> {
    const formData = new FormData()
    formData.append('file', file)

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    return fetch(`${this.baseUrl}/media`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then((res) => res.json())
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async logout(): Promise<void> {
    await this.request('/users/logout', { method: 'POST' })
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/users/me')
  }
}

export const payloadClient = new PayloadClient()
```

**Usage**:

```typescript
import { payloadClient } from '@/lib/payloadClient'

// Find pages
const pages = await payloadClient.find<Page>('pages', {
  where: {
    _status: { equals: 'published' },
  },
  limit: 10,
  depth: 2,
})

// Create post
const newPost = await payloadClient.create('posts', {
  title: 'New Post',
  slug: 'new-post',
  _status: 'draft',
})

// Upload file
const media = await payloadClient.uploadFile(fileObject, {
  alt: 'Image description',
})

// Login
const { user, token } = await payloadClient.login('user@example.com', 'password')
```

---

## GraphQL Client

### Using Apollo Client

```typescript
// lib/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
  uri: '/api/graphql',
  credentials: 'include',
})

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})
```

**Query Example**:

```typescript
'use client'

import { useQuery, gql } from '@apollo/client'

const GET_PAGES = gql`
  query GetPages($limit: Int, $where: Page_where) {
    Pages(limit: $limit, where: $where) {
      docs {
        id
        title
        slug
        _status
        publishedAt
      }
      totalDocs
    }
  }
`

export function PagesList() {
  const { data, loading, error } = useQuery(GET_PAGES, {
    variables: {
      limit: 10,
      where: {
        _status: { equals: 'published' },
      },
    },
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data.Pages.docs.map((page) => (
        <li key={page.id}>{page.title}</li>
      ))}
    </ul>
  )
}
```

**Mutation Example**:

```typescript
import { useMutation, gql } from '@apollo/client'

const CREATE_PAGE = gql`
  mutation CreatePage($data: mutationPageInput!) {
    createPage(data: $data) {
      id
      title
      slug
    }
  }
`

export function CreatePageButton() {
  const [createPage, { loading }] = useMutation(CREATE_PAGE)

  const handleCreate = async () => {
    try {
      const result = await createPage({
        variables: {
          data: {
            title: 'New Page',
            slug: 'new-page',
            layout: [],
            _status: 'draft',
          },
        },
      })

      console.log('Created:', result.data.createPage)
    } catch (error) {
      console.error('Error creating page:', error)
    }
  }

  return (
    <button onClick={handleCreate} disabled={loading}>
      Create Page
    </button>
  )
}
```

---

## External API Client (Node.js)

### Standalone Script

```typescript
// scripts/import-posts.ts
import fetch from 'node-fetch'

const API_URL = 'http://localhost:3000/api'
const AUTH_EMAIL = 'admin@example.com'
const AUTH_PASSWORD = 'password'

async function login() {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: AUTH_EMAIL,
      password: AUTH_PASSWORD,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || 'Login failed')
  }

  // Extract token from Set-Cookie header
  const setCookie = response.headers.get('set-cookie')
  const tokenMatch = setCookie?.match(/payload-token=([^;]+)/)
  const token = tokenMatch?.[1]

  return token
}

async function importPosts(token: string) {
  const posts = [
    { title: 'First Post', slug: 'first-post' },
    { title: 'Second Post', slug: 'second-post' },
  ]

  for (const post of posts) {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `payload-token=${token}`,
      },
      body: JSON.stringify({
        ...post,
        layout: [],
        _status: 'published',
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`✓ Created: ${post.title}`)
    } else {
      console.error(`✗ Failed: ${post.title}`, data.errors)
    }
  }
}

async function main() {
  try {
    console.log('Logging in...')
    const token = await login()

    console.log('Importing posts...')
    await importPosts(token)

    console.log('Done!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
```

**Run**:
```bash
npx tsx scripts/import-posts.ts
```

---

## Error Handling Patterns

### Comprehensive Error Handler

```typescript
class APIError extends Error {
  constructor(
    public status: number,
    public errors: Array<{ field?: string; message: string }>
  ) {
    super(errors[0]?.message || 'API Error')
    this.name = 'APIError'
  }
}

async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new APIError(response.status, data.errors || [{ message: data.message }])
    }

    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    if (error instanceof TypeError) {
      throw new Error('Network error - check your connection')
    }

    throw new Error('An unexpected error occurred')
  }
}

// Usage
try {
  const page = await fetchWithErrorHandling<Page>('/api/pages/123')
} catch (error) {
  if (error instanceof APIError) {
    if (error.status === 401) {
      // Redirect to login
      router.push('/admin/login')
    } else if (error.status === 404) {
      // Show not found
      console.error('Page not found')
    } else {
      // Show validation errors
      error.errors.forEach((err) => {
        console.error(`${err.field}: ${err.message}`)
      })
    }
  } else {
    console.error(error.message)
  }
}
```

---

## Performance Optimization

### Request Deduplication

```typescript
const requestCache = new Map<string, Promise<any>>()

export async function fetchWithCache<T>(url: string): Promise<T> {
  if (requestCache.has(url)) {
    return requestCache.get(url)!
  }

  const promise = fetch(url, { credentials: 'include' })
    .then((res) => res.json())
    .finally(() => {
      // Clear cache after 1 second
      setTimeout(() => requestCache.delete(url), 1000)
    })

  requestCache.set(url, promise)

  return promise
}
```

---

### Batch Requests

```typescript
async function fetchMultiplePages(slugs: string[]) {
  const requests = slugs.map((slug) =>
    fetch(`/api/pages?where[slug][equals]=${slug}&limit=1`, {
      credentials: 'include',
    }).then((res) => res.json())
  )

  const results = await Promise.all(requests)

  return results.map((result) => result.docs[0])
}
```

---

## Next Steps

- Review [Endpoints Reference](./endpoints.md) for complete API documentation
- See [Headers](./headers.md) for authentication and CORS configuration
- Review [Database Models](../database/models.md) for type-safe data structures
