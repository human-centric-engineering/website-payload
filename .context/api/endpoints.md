# API Endpoints Reference

## Base URL

- **Local Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## API Versioning

Payload CMS provides both **REST API** and **GraphQL API**:

- REST API: `/api/*`
- GraphQL: `/api/graphql`
- GraphQL Playground: `/api/graphql-playground`

---

## Authentication Endpoints

### Login

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response** (200):
```json
{
  "message": "Auth Passed",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "collection": "users",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "exp": 1737460800
}
```

**Error Response** (401):
```json
{
  "errors": [
    {
      "message": "The email or password provided is incorrect."
    }
  ]
}
```

---

### Logout

```http
POST /api/users/logout
Cookie: payload-token=<token>
```

**Success Response** (200):
```json
{
  "message": "You have been logged out successfully."
}
```

---

### Get Current User

```http
GET /api/users/me
Cookie: payload-token=<token>
```

**Success Response** (200):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "collection": "users"
  },
  "exp": 1737460800,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response** (401):
```json
{
  "errors": [
    {
      "message": "You are not allowed to perform this action."
    }
  ]
}
```

---

### Refresh Token

```http
POST /api/users/refresh-token
Cookie: payload-token=<token>
```

**Success Response** (200):
```json
{
  "user": { /* user object */ },
  "refreshedToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "exp": 1737460800
}
```

---

### Forgot Password

```http
POST /api/users/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Success Response** (200):
```json
{
  "message": "If an account with that email exists, you will receive a password reset email."
}
```

---

### Reset Password

```http
POST /api/users/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewSecurePassword123"
}
```

**Success Response** (200):
```json
{
  "message": "Password reset successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { /* user object */ }
}
```

---

## Collections API

All collections follow the same REST API pattern. Below are examples using the **Pages** collection.

### Find Documents

```http
GET /api/pages?where[slug][equals]=about&depth=1&limit=10&page=1
Cookie: payload-token=<token>  (if accessing drafts)
```

**Query Parameters**:
- `where[field][operator]=value` - Filter conditions
- `depth` - Population depth for relationships (0-10)
- `limit` - Number of documents per page (default: 10)
- `page` - Page number (default: 1)
- `sort` - Sort field (e.g., `-createdAt` for descending)
- `locale` - Locale for localized content

**Success Response** (200):
```json
{
  "docs": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "About Us",
      "slug": "about",
      "_status": "published",
      "layout": [ /* layout blocks */ ],
      "publishedAt": "2025-01-15T10:30:00.000Z",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "totalDocs": 1,
  "limit": 10,
  "totalPages": 1,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": false,
  "prevPage": null,
  "nextPage": null
}
```

---

### Find Document by ID

```http
GET /api/pages/507f1f77bcf86cd799439011?depth=1
Cookie: payload-token=<token>
```

**Success Response** (200):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "About Us",
  "slug": "about",
  "_status": "published",
  "layout": [
    {
      "blockType": "content",
      "content": { /* Lexical JSON */ }
    }
  ],
  "meta": {
    "title": "About Us | My Website",
    "description": "Learn more about our company",
    "image": { /* populated media object */ }
  },
  "publishedAt": "2025-01-15T10:30:00.000Z",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

### Create Document

```http
POST /api/pages
Content-Type: application/json
Cookie: payload-token=<token>

{
  "title": "New Page",
  "slug": "new-page",
  "layout": [],
  "_status": "draft"
}
```

**Success Response** (201):
```json
{
  "message": "Created successfully",
  "doc": {
    "id": "507f1f77bcf86cd799439012",
    "title": "New Page",
    "slug": "new-page",
    "_status": "draft",
    "layout": [],
    "createdAt": "2025-01-15T11:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

**Error Response** (400):
```json
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

### Update Document

```http
PATCH /api/pages/507f1f77bcf86cd799439011
Content-Type: application/json
Cookie: payload-token=<token>

{
  "title": "Updated Title",
  "_status": "published"
}
```

**Success Response** (200):
```json
{
  "message": "Updated successfully",
  "doc": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Updated Title",
    "_status": "published",
    /* ... other fields */
    "updatedAt": "2025-01-15T12:00:00.000Z"
  }
}
```

---

### Delete Document

```http
DELETE /api/pages/507f1f77bcf86cd799439011
Cookie: payload-token=<token>
```

**Success Response** (200):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "message": "Deleted successfully"
}
```

---

## Collection-Specific Endpoints

### Pages Collection

- `GET /api/pages` - Find all pages
- `GET /api/pages/:id` - Get page by ID
- `POST /api/pages` - Create new page
- `PATCH /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page

**Unique Features**:
- Draft/Published workflow (`_status` field)
- Layout builder blocks
- SEO meta fields
- Versioning support

---

### Posts Collection

- `GET /api/posts` - Find all posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

**Unique Features**:
- Categories relationship
- Author relationship (Users collection)
- Related posts
- Featured image

**Example Query** (Get published posts with categories):
```http
GET /api/posts?where[_status][equals]=published&depth=2&sort=-publishedAt&limit=20
```

---

### Projects Collection

- `GET /api/projects` - Find all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Unique Features**:
- Draft/Published workflow (`_status` field)
- Rich text description with toolbar (Lexical editor)
- Project type (venture/agency)
- Project status (active/completed/in-development)
- Technologies array
- Links group (website, case study, repository)

**Example Query** (Get published venture projects):
```http
GET /api/projects?where[_status][equals]=published&where[projectType][equals]=venture&sort=-publishedAt
```

---

### Network Collection

- `GET /api/network` - Find all network members
- `GET /api/network/:id` - Get network member by ID
- `POST /api/network` - Create new network member
- `PATCH /api/network/:id` - Update network member
- `DELETE /api/network/:id` - Delete network member

**Unique Features**:
- Role selection (designer/developer/strategist/marketer/other)
- Skills array for capabilities
- Social links (LinkedIn, GitHub, website)
- Featured toggle for homepage display

**Example Query** (Get featured developers):
```http
GET /api/network?where[featured][equals]=true&where[role][equals]=developer
```

---

### Media Collection

- `GET /api/media` - Find all media
- `GET /api/media/:id` - Get media by ID
- `POST /api/media` - Upload new media
- `PATCH /api/media/:id` - Update media metadata
- `DELETE /api/media/:id` - Delete media

**Upload Example**:
```http
POST /api/media
Content-Type: multipart/form-data
Cookie: payload-token=<token>

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="image.jpg"
Content-Type: image/jpeg

<binary data>
------WebKitFormBoundary
Content-Disposition: form-data; name="alt"

Image description
------WebKitFormBoundary--
```

**Success Response** (201):
```json
{
  "message": "Uploaded successfully",
  "doc": {
    "id": "507f1f77bcf86cd799439013",
    "alt": "Image description",
    "filename": "image-1737373200.jpg",
    "mimeType": "image/jpeg",
    "filesize": 245678,
    "width": 1920,
    "height": 1080,
    "focalX": 50,
    "focalY": 50,
    "sizes": {
      "thumbnail": {
        "url": "/media/image-1737373200-400x300.jpg",
        "width": 400,
        "height": 300,
        "mimeType": "image/jpeg",
        "filesize": 15234
      },
      "card": {
        "url": "/media/image-1737373200-768x1024.jpg",
        "width": 768,
        "height": 1024,
        "mimeType": "image/jpeg",
        "filesize": 89456
      }
    },
    "url": "/media/image-1737373200.jpg",
    "createdAt": "2025-01-15T12:30:00.000Z",
    "updatedAt": "2025-01-15T12:30:00.000Z"
  }
}
```

---

### Categories Collection

- `GET /api/categories` - Find all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

**Nested Categories** (via plugin):
```http
GET /api/categories?where[parent][equals]=null
```

Returns top-level categories. Nested structure populated via `breadcrumbs` field.

---

### Users Collection

- `GET /api/users` - Find all users (authenticated only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Note**: Users collection has restricted access. Only authenticated users can read/modify.

---

## Globals API

### Get Global

```http
GET /api/globals/header?depth=1
```

**Success Response** (200):
```json
{
  "id": "header",
  "globalType": "header",
  "navItems": [
    {
      "id": "123",
      "link": {
        "type": "reference",
        "label": "About",
        "reference": {
          "relationTo": "pages",
          "value": {
            "id": "507f1f77bcf86cd799439011",
            "slug": "about",
            "title": "About Us"
          }
        }
      }
    }
  ],
  "createdAt": "2025-01-10T08:00:00.000Z",
  "updatedAt": "2025-01-15T14:00:00.000Z"
}
```

---

### Update Global

```http
POST /api/globals/header
Content-Type: application/json
Cookie: payload-token=<token>

{
  "navItems": [
    {
      "link": {
        "type": "custom",
        "label": "Blog",
        "url": "/posts"
      }
    }
  ]
}
```

**Success Response** (200):
```json
{
  "message": "Updated successfully",
  "result": {
    "id": "header",
    "globalType": "header",
    "navItems": [ /* updated items */ ],
    "updatedAt": "2025-01-15T15:00:00.000Z"
  }
}
```

---

## GraphQL API

### GraphQL Endpoint

```http
POST /api/graphql
Content-Type: application/json
Cookie: payload-token=<token>

{
  "query": "query GetPages { Pages(limit: 10) { docs { id title slug } } }"
}
```

**Response**:
```json
{
  "data": {
    "Pages": {
      "docs": [
        {
          "id": "507f1f77bcf86cd799439011",
          "title": "About Us",
          "slug": "about"
        }
      ]
    }
  }
}
```

### GraphQL Playground

Access interactive playground at: `http://localhost:3000/api/graphql-playground`

**Features**:
- Schema documentation
- Query/mutation autocomplete
- Query history
- Variable support

---

## Custom Endpoints

### Seed Database

```http
GET /api/seed
Cookie: payload-token=<token>
```

Triggers database seeding with demo content.

**Success Response** (200):
```json
{
  "message": "Database seeded successfully"
}
```

**Note**: This endpoint is destructive and should only be used in development.

---

### Draft Preview

```http
GET /next/preview?slug=about&collection=pages&secret=<PREVIEW_SECRET>
```

Enables Next.js draft mode and redirects to page preview.

---

### Exit Preview

```http
GET /next/exit-preview
```

Disables draft mode and redirects to home page.

---

## Query Operators

### Comparison Operators

- `equals` - Exact match
- `not_equals` - Not equal to
- `greater_than` - Greater than (numbers/dates)
- `greater_than_equal` - Greater than or equal
- `less_than` - Less than
- `less_than_equal` - Less than or equal
- `like` - Contains substring (case-insensitive)
- `contains` - Array contains value
- `in` - Value in array
- `not_in` - Value not in array
- `exists` - Field exists (true/false)

### Example Queries

**Text search**:
```http
GET /api/posts?where[title][like]=payload
```

**Date range**:
```http
GET /api/posts?where[publishedAt][greater_than]=2025-01-01&where[publishedAt][less_than]=2025-01-31
```

**Multiple conditions (AND)**:
```http
GET /api/posts?where[_status][equals]=published&where[categories][in]=technology
```

**OR conditions**:
```http
GET /api/posts?where[or][0][slug][equals]=featured&where[or][1][categories][in]=trending
```

---

## Pagination

### Standard Pagination

```http
GET /api/posts?page=2&limit=20
```

**Response** includes pagination metadata:
```json
{
  "docs": [ /* documents */ ],
  "totalDocs": 50,
  "limit": 20,
  "totalPages": 3,
  "page": 2,
  "pagingCounter": 21,
  "hasPrevPage": true,
  "hasNextPage": true,
  "prevPage": 1,
  "nextPage": 3
}
```

### Cursor-Based Pagination (Performance)

For large datasets, use `sort` + `where` to implement cursor pagination:

```http
GET /api/posts?where[id][greater_than]=507f1f77bcf86cd799439011&sort=id&limit=20
```

---

## Error Responses

### Validation Error (400)

```json
{
  "errors": [
    {
      "field": "title",
      "message": "This field is required"
    },
    {
      "field": "slug",
      "message": "Must be unique"
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "errors": [
    {
      "message": "You are not allowed to perform this action."
    }
  ]
}
```

### Forbidden (403)

```json
{
  "errors": [
    {
      "message": "Forbidden"
    }
  ]
}
```

### Not Found (404)

```json
{
  "errors": [
    {
      "message": "The requested resource was not found."
    }
  ]
}
```

### Server Error (500)

```json
{
  "errors": [
    {
      "message": "Something went wrong.",
      "stack": "Error: ...\n    at ..."  // Only in development
    }
  ]
}
```

---

## Rate Limiting

**Current Implementation**: No built-in rate limiting.

**Recommended**: Implement via reverse proxy (Nginx, Cloudflare).

**Example Limits**:
- Authentication endpoints: 10 req/min per IP
- Read endpoints: 100 req/min per IP
- Write endpoints: 30 req/min per authenticated user

---

## Next Steps

- Review [API Headers](./headers.md) for authentication and CORS configuration
- See [API Examples](./examples.md) for client implementation patterns
- Review [Database Schema](../database/schema.md) for collection structures
