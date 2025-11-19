# HTTP Headers & Middleware

## Request Headers

### Authentication Header

**Cookie-Based Authentication** (Primary):

```http
GET /api/pages
Cookie: payload-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Bearer Token Authentication** (Alternative):

```http
GET /api/pages
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Usage Guidelines**:
- **Cookies**: Preferred for browser-based clients (automatic handling, HttpOnly security)
- **Bearer Token**: For API clients, mobile apps, server-to-server communication

---

### Content-Type Header

**JSON Requests**:

```http
POST /api/pages
Content-Type: application/json

{"title": "New Page", "slug": "new-page"}
```

**File Uploads**:

```http
POST /api/media
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="image.jpg"
...
```

**GraphQL Requests**:

```http
POST /api/graphql
Content-Type: application/json

{"query": "{ Pages { docs { title } } }"}
```

---

### Accept Header

```http
GET /api/pages
Accept: application/json
```

**Supported Values**:
- `application/json` - JSON response (default)
- `*/*` - Accept any content type

---

### Custom Headers

**Locale Selection**:

```http
GET /api/pages
Accept-Language: en-US
```

**Fallback Locale**: If locale not found, falls back to default configured locale.

---

## Response Headers

### Standard Response Headers

**Successful Response**:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 1234
Date: Wed, 15 Jan 2025 10:30:00 GMT
Connection: keep-alive
```

**With Authentication Cookie**:

```http
HTTP/1.1 200 OK
Set-Cookie: payload-token=eyJhbGci...; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
Content-Type: application/json
```

---

### Security Headers

**Recommended Configuration** (`next.config.js`):

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
}
```

**Header Descriptions**:

- **Strict-Transport-Security**: Forces HTTPS connections (HSTS)
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME-sniffing
- **X-XSS-Protection**: Enables browser XSS filter
- **Referrer-Policy**: Controls referrer information sent
- **Permissions-Policy**: Restricts browser features

---

### CORS Headers

**Configuration** (`src/payload.config.ts`):

```typescript
import { getServerSideURL } from './utilities/getURL'

export default buildConfig({
  cors: [getServerSideURL()].filter(Boolean),
  // ...
})
```

**Response Headers** (for allowed origins):

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

**Custom CORS Configuration**:

```typescript
export default buildConfig({
  cors: [
    'http://localhost:3000',
    'https://example.com',
    'https://admin.example.com',
  ],
  // Or allow all origins (not recommended for production)
  // cors: '*',
})
```

---

### Cache-Control Headers

**API Responses** (No caching):

```http
Cache-Control: no-store, max-age=0
```

**Static Assets** (Long-term caching):

```http
Cache-Control: public, max-age=31536000, immutable
```

**Media Files** (CDN caching):

```http
Cache-Control: public, max-age=31536000
ETag: "abc123def456"
```

---

## Middleware Patterns

### Rate Limiting Middleware

**Implementation** (using `express-rate-limit`):

```typescript
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit login attempts
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful logins
})
```

**Response Headers**:

```http
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1737374400
Retry-After: 900

{
  "error": "Too many requests from this IP, please try again later."
}
```

---

### Request Logging Middleware

**Implementation** (Next.js middleware):

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const start = Date.now()

  // Clone response to add headers
  const response = NextResponse.next()

  // Log request
  console.log({
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.ip,
    timestamp: new Date().toISOString(),
  })

  // Add request ID header
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-ID', requestId)

  // Add timing header
  const duration = Date.now() - start
  response.headers.set('X-Response-Time', `${duration}ms`)

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

---

### CORS Preflight Handling

**OPTIONS Request Handler**:

Payload handles OPTIONS requests automatically via:

```typescript
// src/app/(payload)/api/[...slug]/route.ts
export const OPTIONS = REST_OPTIONS(config)
```

**Response**:

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

---

## Request/Response Examples

### Creating a Page with All Headers

**Request**:

```http
POST /api/pages HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Accept: application/json
Cookie: payload-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User-Agent: Mozilla/5.0...
Accept-Encoding: gzip, deflate, br
Content-Length: 156

{
  "title": "New Page",
  "slug": "new-page",
  "layout": [
    {
      "blockType": "content",
      "content": {
        "root": {
          "type": "root",
          "format": "",
          "indent": 0,
          "version": 1,
          "children": []
        }
      }
    }
  ],
  "_status": "draft"
}
```

**Response**:

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Cache-Control: no-store, max-age=0
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-Request-ID: 123e4567-e89b-12d3-a456-426614174000
X-Response-Time: 45ms
Date: Wed, 15 Jan 2025 10:30:00 GMT
Content-Length: 542

{
  "message": "Created successfully",
  "doc": {
    "id": "507f1f77bcf86cd799439012",
    "title": "New Page",
    "slug": "new-page",
    "_status": "draft",
    "layout": [
      {
        "blockType": "content",
        "content": { /* Lexical JSON */ },
        "id": "507f1f77bcf86cd799439013"
      }
    ],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### Uploading Media with Headers

**Request**:

```http
POST /api/media HTTP/1.1
Host: localhost:3000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
Cookie: payload-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Length: 245890

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="hero-image.jpg"
Content-Type: image/jpeg

<binary data>
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="alt"

Hero image for homepage
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**Response**:

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/media/507f1f77bcf86cd799439014
X-Request-ID: 234e5678-e89b-12d3-a456-426614174001
X-Response-Time: 234ms

{
  "message": "Uploaded successfully",
  "doc": {
    "id": "507f1f77bcf86cd799439014",
    "alt": "Hero image for homepage",
    "filename": "hero-image-1737373800.jpg",
    "mimeType": "image/jpeg",
    "filesize": 245678,
    "width": 1920,
    "height": 1080,
    "sizes": { /* generated sizes */ },
    "url": "/media/hero-image-1737373800.jpg"
  }
}
```

---

## Error Response Headers

### Validation Error (400)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
X-Request-ID: 345e6789-e89b-12d3-a456-426614174002

{
  "errors": [
    {
      "field": "slug",
      "message": "A page with this slug already exists"
    }
  ]
}
```

---

### Unauthorized (401)

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="api"
Content-Type: application/json

{
  "errors": [
    {
      "message": "You are not allowed to perform this action."
    }
  ]
}
```

---

### Rate Limited (429)

```http
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1737374400
Retry-After: 900
Content-Type: application/json

{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Content Negotiation

### Accept-Language Header

**Request**:

```http
GET /api/pages
Accept-Language: es-ES,es;q=0.9,en;q=0.8
```

**Response** (if Spanish locale configured):

```json
{
  "docs": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Acerca de nosotros",  // Spanish translation
      "slug": "acerca-de-nosotros"
    }
  ]
}
```

---

### Content-Type Negotiation

**Request**:

```http
GET /api/pages
Accept: application/json, text/html;q=0.9
```

**Response**: Returns JSON (higher priority than HTML).

---

## Compression

### Gzip Compression

**Request**:

```http
GET /api/pages
Accept-Encoding: gzip, deflate, br
```

**Response**:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Encoding: gzip
Vary: Accept-Encoding
```

**Configuration**: Enabled by default in Next.js production builds.

---

## Custom Headers for Tracking

### Request Tracking

**Client Implementation**:

```typescript
fetch('/api/pages', {
  headers: {
    'X-Request-ID': crypto.randomUUID(),
    'X-Client-Version': '1.0.0',
    'X-Client-Platform': 'web',
  },
})
```

**Server Logging**:

```typescript
// Custom endpoint
export async function GET(request: Request) {
  const requestId = request.headers.get('X-Request-ID')
  const clientVersion = request.headers.get('X-Client-Version')

  payload.logger.info({
    requestId,
    clientVersion,
    message: 'API request received',
  })

  // ... handle request
}
```

---

## Decision History & Trade-offs

### Why Cookie-Based Auth Over Header-Only?

**Decision**: Use HttpOnly cookies as primary authentication method.

**Rationale**:
- **Security**: HttpOnly cookies prevent XSS token theft
- **Automatic**: Browser handles cookie sending/storage
- **CSRF Protection**: SameSite attribute prevents CSRF attacks

**Trade-offs**:
- Requires CORS configuration for cross-origin requests
- More complex for non-browser clients (mobile apps)

**Mitigation**:
- Support both cookie and Bearer token authentication
- Document Bearer token usage for API clients

---

### Why No Built-In Rate Limiting?

**Decision**: No application-level rate limiting in Payload.

**Rationale**:
- **Flexibility**: Different deployment environments (Nginx, Cloudflare, Vercel)
- **Performance**: Reverse proxy rate limiting is more efficient
- **Simplicity**: Avoids dependency on Redis/in-memory store

**Trade-offs**:
- Must configure rate limiting externally
- No built-in per-user rate limiting

**Mitigation**:
- Document recommended rate limiting configurations
- Provide middleware examples for custom implementations

---

## Next Steps

- Review [API Examples](./examples.md) for client implementation patterns
- See [Security](../auth/security.md) for security headers best practices
- Review [Guidelines](../guidelines.md) for API testing strategies
