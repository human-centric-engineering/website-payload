# Authentication Integration

## Next.js Middleware Integration

While this project doesn't currently implement Next.js middleware for authentication, here's how to integrate Payload authentication with Next.js middleware for protected routes.

### Middleware Pattern for Route Protection

**Implementation** (`middleware.ts` - not currently in project):

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('payload-token')?.value

    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // Verify token (requires payload instance)
      // Note: This requires server context, see alternative below
      return NextResponse.next()
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
```

**Current Implementation**: This project relies on Payload's built-in access control instead of middleware. Admin routes are automatically protected by Payload.

---

## Server Component Authentication

### Pattern 1: Redirect Unauthenticated Users

```typescript
import { redirect } from 'next/navigation'
import { getMeUser } from '@/utilities/getMeUser'

export default async function ProtectedPage() {
  const user = await getMeUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  )
}
```

### Pattern 2: Conditional Rendering

```typescript
import { getMeUser } from '@/utilities/getMeUser'
import LoginPrompt from '@/components/LoginPrompt'
import AdminDashboard from '@/components/AdminDashboard'

export default async function DashboardPage() {
  const user = await getMeUser()

  if (!user) {
    return <LoginPrompt />
  }

  return <AdminDashboard user={user} />
}
```

### Pattern 3: User-Specific Data Fetching

```typescript
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'

export default async function MyPostsPage() {
  const user = await getMeUser()
  const payload = await getPayload({ config: configPromise })

  // Fetch posts with user context (enforces access control)
  const myPosts = await payload.find({
    collection: 'posts',
    user,  // Access control applied
    where: {
      author: {
        equals: user?.id,
      },
    },
  })

  return (
    <div>
      <h1>My Posts</h1>
      <ul>
        {myPosts.docs.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

## Client Component Authentication

### Login Form Component

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // Important: include cookies
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.errors?.[0]?.message || 'Login failed')
        return
      }

      // Login successful, redirect to admin
      router.push('/admin')
      router.refresh()  // Refresh server components
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}
```

---

### Logout Component

```typescript
'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })

      // Redirect to home page
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
    >
      Log Out
    </button>
  )
}
```

---

### Auth Context Provider

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@/payload-types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.errors?.[0]?.message || 'Login failed')
    }

    await fetchUser()
  }

  const logout = async () => {
    await fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    })

    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refetch: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
```

**Usage in Layout**:

```typescript
// app/layout.tsx
import { AuthProvider } from '@/providers/AuthProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

**Usage in Components**:

```typescript
'use client'

import { useAuth } from '@/providers/AuthProvider'

export default function UserMenu() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Link href="/admin/login">Log In</Link>
  }

  return (
    <div>
      <span>Welcome, {user.name || user.email}</span>
      <button onClick={logout}>Log Out</button>
    </div>
  )
}
```

---

## API Route Authentication

### Protected API Route Pattern

```typescript
// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import { getMeUser } from '@/utilities/getMeUser'

export async function GET() {
  const user = await getMeUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // User is authenticated, proceed with logic
  const stats = {
    totalPosts: 42,
    totalPages: 15,
    // ...
  }

  return NextResponse.json(stats)
}
```

---

### Authentication with Payload Local API

```typescript
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const cookieStore = cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify token and get user
    const { user } = await payload.auth.verifyEmail({
      collection: 'users',
      token,
    })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Proceed with authenticated logic
    const body = await request.json()

    const newPost = await payload.create({
      collection: 'posts',
      data: {
        ...body,
        author: user.id,
      },
      user,  // Enforce access control
    })

    return NextResponse.json(newPost)
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}
```

---

## Draft Preview Authentication

### Secure Preview Route

**Implementation** (`app/(frontend)/next/preview/route.ts`):

```typescript
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  const collection = searchParams.get('collection')

  // Verify preview secret
  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  if (!slug || !collection) {
    return new Response('Missing slug or collection', { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  // Verify document exists
  const doc = await payload.find({
    collection: collection as 'pages' | 'posts',
    where: {
      slug: { equals: slug },
    },
    limit: 1,
  })

  if (!doc.docs[0]) {
    return new Response('Document not found', { status: 404 })
  }

  // Enable draft mode
  draftMode().enable()

  // Redirect to the path
  redirect(`/${slug}`)
}
```

**Generated Preview URL**:

```typescript
// src/utilities/generatePreviewPath.ts
export const generatePreviewPath = ({
  collection,
  slug,
  req,
}: {
  collection: string
  slug: string
  req: PayloadRequest
}) => {
  const url = getServerSideURL()
  const params = new URLSearchParams({
    slug,
    collection,
    secret: process.env.PREVIEW_SECRET || '',
  })

  return `${url}/next/preview?${params.toString()}`
}
```

**Usage in Collection Config**:

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    preview: (doc, { req }) =>
      generatePreviewPath({
        slug: doc?.slug as string,
        collection: 'pages',
        req,
      }),
  },
  // ...
}
```

---

## Payload Admin Bar Integration

### Client-Side Admin Bar

**Implementation** (Frontend):

```typescript
'use client'

import { PayloadAdminBar } from '@payloadcms/admin-bar'
import { useRouter } from 'next/navigation'
import type { Page, Post } from '@/payload-types'

export function AdminBar({ doc }: { doc?: Page | Post }) {
  const router = useRouter()

  return (
    <PayloadAdminBar
      adminPanelProps={{
        url: '/admin',
      }}
      data={doc}
      preview={true}
      onPreviewExit={() => {
        router.push('/next/exit-preview')
        router.refresh()
      }}
    />
  )
}
```

**Usage in Page Template**:

```typescript
import { AdminBar } from '@/components/AdminBar'
import { getMeUser } from '@/utilities/getMeUser'

export default async function PageTemplate({ page }: { page: Page }) {
  const user = await getMeUser()

  return (
    <>
      {user && <AdminBar doc={page} />}
      <article>
        <h1>{page.title}</h1>
        {/* Page content */}
      </article>
    </>
  )
}
```

**Features**:
- **Quick Edit**: Click to edit current document in admin
- **Preview Mode**: Toggle draft preview on/off
- **User Info**: Shows currently logged-in user
- **Conditional Rendering**: Only visible to authenticated users

---

## Token Refresh Strategy

### Automatic Token Refresh

**Pattern**: Refresh token on API requests if near expiration.

```typescript
'use client'

import { useEffect } from 'use client'

export function TokenRefresher() {
  useEffect(() => {
    const refreshToken = async () => {
      try {
        await fetch('/api/users/refresh-token', {
          method: 'POST',
          credentials: 'include',
        })
      } catch (error) {
        console.error('Token refresh failed:', error)
      }
    }

    // Refresh token every 6 hours (token valid for 7 days)
    const interval = setInterval(refreshToken, 6 * 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return null
}
```

**Usage in Root Layout**:

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <TokenRefresher />
        {children}
      </body>
    </html>
  )
}
```

---

## Decision History & Trade-offs

### Why No Middleware for Auth?

**Decision**: Rely on Payload's access control instead of Next.js middleware.

**Rationale**:
- **Simplicity**: Payload handles authentication automatically
- **Consistency**: Access control defined in collection configs
- **Performance**: No middleware overhead on every request
- **Maintainability**: Single source of truth for permissions

**Trade-offs**:
- No route-level protection outside Payload
- Cannot customize unauthorized redirects easily
- Less flexible for complex auth flows

**Mitigation**:
- Use `getMeUser()` in Server Components for protection
- Implement middleware later if needed for custom routes
- Document authentication patterns clearly

### Why Context Provider for Client State?

**Decision**: Use React Context for client-side user state.

**Rationale**:
- **Centralized State**: Single source of truth for user data
- **Reusability**: Easy to access user in any component
- **Consistency**: Prevents multiple API calls for same data
- **Type Safety**: Fully typed user object

**Trade-offs**:
- Client-side only (not available in Server Components)
- Additional re-renders when user state changes
- Requires wrapping app in provider

**Mitigation**:
- Use `getMeUser()` for server-side authentication
- Memoize context value to reduce re-renders
- Document when to use context vs. server-side auth

---

## Testing Patterns

### Testing Authenticated Routes

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/admin/login')

    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/admin')
  })

  test('should protect admin routes', async ({ page }) => {
    await page.goto('/admin')

    // Should redirect to login
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('should logout successfully', async ({ page, context }) => {
    // Login first
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')

    // Logout
    await page.click('text=Log Out')
    await expect(page).toHaveURL('/')

    // Verify cookie cleared
    const cookies = await context.cookies()
    const payloadToken = cookies.find((c) => c.name === 'payload-token')
    expect(payloadToken).toBeUndefined()
  })
})
```

---

## Next Steps

- Review [Auth Security](./security.md) for security best practices
- See [API Endpoints](../api/endpoints.md) for REST API authentication
- Review [Access Control Patterns](../architecture/patterns.md#access-control-patterns)
