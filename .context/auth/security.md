# Authentication Security

## Threat Model

### Identified Threats

1. **Credential Theft**: Attacker obtains user credentials (phishing, database breach)
2. **Session Hijacking**: Attacker steals JWT token from network or XSS attack
3. **Brute Force**: Automated password guessing against login endpoint
4. **CSRF (Cross-Site Request Forgery)**: Attacker tricks user into making authenticated requests
5. **XSS (Cross-Site Scripting)**: Injection attacks to steal tokens or impersonate users
6. **Token Replay**: Attacker reuses intercepted JWT token
7. **Insufficient Logout**: Token remains valid after logout

---

## Security Measures

### 1. Password Security

#### Strong Password Hashing

**Implementation**: Bcrypt with salt rounds = 10

```typescript
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

// Hashing (handled automatically by Payload)
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS)

// Verification
const isValid = await bcrypt.compare(plainPassword, storedHash)
```

**Security Properties**:
- **Computational Cost**: ~100ms per hash (prevents brute force)
- **Salting**: Unique salt per password (prevents rainbow tables)
- **Adaptive**: Can increase rounds as hardware improves

#### Password Policy Enforcement

**Payload Built-In Validation**:
- Minimum 8 characters
- Complexity requirements configurable

**Custom Validation** (optional):

```typescript
import type { Field } from 'payload'

const passwordField: Field = {
  name: 'password',
  type: 'text',
  required: true,
  validate: (value) => {
    if (value.length < 12) {
      return 'Password must be at least 12 characters'
    }

    if (!/[A-Z]/.test(value)) {
      return 'Password must contain an uppercase letter'
    }

    if (!/[a-z]/.test(value)) {
      return 'Password must contain a lowercase letter'
    }

    if (!/[0-9]/.test(value)) {
      return 'Password must contain a number'
    }

    if (!/[^A-Za-z0-9]/.test(value)) {
      return 'Password must contain a special character'
    }

    return true
  },
}
```

---

### 2. JWT Token Security

#### Secure Token Configuration

**Environment Variables**:

```bash
# .env
PAYLOAD_SECRET=<256-bit random string>  # Used for JWT signing
```

**Generate Secure Secret**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Token Properties**:
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 7 days (configurable)
- **Issuer**: Server URL
- **Audience**: Server URL

#### HttpOnly Cookie Storage

**Cookie Configuration**:

```typescript
// payload.config.ts
export default buildConfig({
  collections: [
    {
      slug: 'users',
      auth: {
        cookies: {
          secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
          sameSite: 'lax',  // CSRF protection
          httpOnly: true,   // Prevents JavaScript access (XSS protection)
          domain: undefined,  // Current domain only
        },
      },
    },
  ],
})
```

**Security Benefits**:
- **HttpOnly**: JavaScript cannot access token (prevents XSS theft)
- **Secure**: Token only sent over HTTPS (prevents MITM)
- **SameSite**: Prevents CSRF attacks from external sites

---

### 3. Brute Force Protection

#### Login Attempt Limiting

**Payload Built-In Protection**:

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    maxLoginAttempts: 5,      // Lock after 5 failed attempts
    lockTime: 600000,          // Lock for 10 minutes (in ms)
  },
}
```

**How It Works**:
1. Failed login increments `loginAttempts` field
2. After 5 failures, `lockUntil` set to current time + 10 minutes
3. Login requests rejected until `lockUntil` expires
4. Successful login resets `loginAttempts` to 0

#### Rate Limiting (External)

**Recommended**: Use reverse proxy (Nginx, Cloudflare) for global rate limiting.

**Example Nginx Config**:

```nginx
# Limit login endpoint to 5 requests per minute per IP
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

location /api/users/login {
    limit_req zone=login burst=3 nodelay;
    proxy_pass http://localhost:3000;
}
```

---

### 4. CSRF Protection

#### SameSite Cookie Attribute

**Configuration**:

```typescript
cookies: {
  sameSite: 'lax',  // Prevents CSRF while allowing external navigation
}
```

**SameSite Values**:
- **Strict**: Never sent with cross-site requests (breaks external links)
- **Lax**: Sent with top-level navigation (recommended for most apps)
- **None**: Always sent (requires `Secure` flag)

**Protection Level**: Blocks CSRF attacks from external sites while allowing users to click links to your site.

#### CSRF Token (Additional Layer)

**For Sensitive Operations** (optional):

```typescript
// Generate CSRF token
import { randomBytes } from 'crypto'

const csrfToken = randomBytes(32).toString('hex')

// Store in session or database
// Return to client in response header
response.headers.set('X-CSRF-Token', csrfToken)

// Validate on subsequent requests
if (request.headers.get('X-CSRF-Token') !== storedToken) {
  return new Response('Invalid CSRF token', { status: 403 })
}
```

---

### 5. XSS Protection

#### Content Security Policy

**Recommended Headers**:

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Adjust based on needs
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}
```

#### Input Sanitization

**Payload Rich Text**: Lexical editor sanitizes HTML automatically.

**Custom Input Validation**:

```typescript
import validator from 'validator'

const emailField: Field = {
  name: 'email',
  type: 'text',
  validate: (value) => {
    if (!validator.isEmail(value)) {
      return 'Invalid email address'
    }

    // Sanitize email
    const sanitized = validator.normalizeEmail(value)

    return true
  },
}
```

---

### 6. Token Expiration & Refresh

#### Short-Lived Tokens

**Configuration**:

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7 * 24 * 60 * 60,  // 7 days in seconds
  },
}
```

**Trade-offs**:
- **Shorter**: More secure but requires frequent re-authentication
- **Longer**: Better UX but higher risk if token stolen

**Recommendation**: 7 days with automatic refresh for active users.

#### Token Refresh Strategy

**Automatic Refresh on Activity**:

```typescript
'use client'

import { useEffect } from 'react'

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

    // Refresh every 6 hours (well before 7-day expiration)
    const interval = setInterval(refreshToken, 6 * 60 * 60 * 1000)

    // Refresh on visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshToken()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return null
}
```

---

### 7. Secure Password Reset

#### Password Reset Flow

```mermaid
sequenceDiagram
    participant User
    participant API as /api/users/forgot-password
    participant Email as Email Service
    participant Reset as /api/users/reset-password
    participant DB as PostgreSQL

    User->>API: POST forgot-password<br/>{email}
    API->>DB: Find user by email
    DB-->>API: User record

    alt User Exists
        API->>DB: Generate reset token<br/>(random 32-byte hex)
        API->>DB: Store hashed token + expiry<br/>(expires in 1 hour)
        API->>Email: Send reset link with token
        Email-->>User: Email with link
        API-->>User: Success (generic message)
    else User Not Found
        API-->>User: Success (generic message)<br/>(prevent email enumeration)
    end

    User->>Reset: Click link with token
    Reset->>DB: Verify token not expired
    DB-->>Reset: Token valid

    User->>Reset: POST reset-password<br/>{token, newPassword}
    Reset->>DB: Hash new password
    Reset->>DB: Invalidate reset token
    DB-->>Reset: Success
    Reset-->>User: Password reset successful
```

#### Security Considerations

**Token Generation**:

```typescript
import { randomBytes } from 'crypto'

// Generate cryptographically secure random token
const resetToken = randomBytes(32).toString('hex')

// Hash before storing (prevents token theft from DB breach)
const hashedToken = await bcrypt.hash(resetToken, 10)
```

**Email Enumeration Prevention**:

```typescript
// Always return success, even if user doesn't exist
export async function forgotPassword(email: string) {
  const user = await findUserByEmail(email)

  if (!user) {
    // Still return success to prevent email enumeration
    return { message: 'If an account exists, reset link sent' }
  }

  // Send reset email
  await sendResetEmail(user, resetToken)

  return { message: 'If an account exists, reset link sent' }
}
```

**Token Expiration**: 1 hour maximum validity.

**One-Time Use**: Token invalidated after successful password reset.

---

### 8. Audit Logging

#### Login Attempt Logging

**Custom Hook** (`src/hooks/logLoginAttempts.ts`):

```typescript
import type { CollectionBeforeLoginHook } from 'payload'

export const logLoginAttempts: CollectionBeforeLoginHook = async ({ req }) => {
  const { payload, data } = req

  // Log login attempt (success tracked by Payload automatically)
  payload.logger.info({
    message: 'Login attempt',
    email: data.email,
    ip: req.headers.get('x-forwarded-for') || req.ip,
    userAgent: req.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
  })
}
```

**Registration**:

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    hooks: {
      beforeLogin: [logLoginAttempts],
    },
  },
}
```

#### Failed Login Logging

**Automatic**: Payload logs failed attempts to `loginAttempts` field.

**Custom Logging** (optional):

```typescript
import type { CollectionAfterLoginHook } from 'payload'

export const logFailedLogin: CollectionAfterLoginHook = async ({
  req,
  user,
  token,
}) => {
  if (!token) {
    // Login failed
    req.payload.logger.warn({
      message: 'Failed login attempt',
      email: req.data.email,
      ip: req.headers.get('x-forwarded-for') || req.ip,
      timestamp: new Date().toISOString(),
    })
  }
}
```

---

## Security Checklist

### Environment Configuration

- [ ] `PAYLOAD_SECRET` set to cryptographically random 256-bit string
- [ ] `PREVIEW_SECRET` set to random string (for draft preview)
- [ ] `CRON_SECRET` set to random string (for scheduled jobs)
- [ ] `NODE_ENV=production` in production
- [ ] `DATABASE_URI` uses SSL connection string (PostgreSQL)

### Cookie Security

- [ ] `httpOnly: true` for `payload-token` cookie
- [ ] `secure: true` in production (HTTPS only)
- [ ] `sameSite: 'lax'` or `'strict'` for CSRF protection

### Password Policy

- [ ] Minimum 8-12 characters enforced
- [ ] Complexity requirements (uppercase, lowercase, numbers, special chars)
- [ ] bcrypt hashing with ≥10 salt rounds

### Rate Limiting

- [ ] Login endpoint limited (5-10 req/min per IP)
- [ ] Password reset limited (3-5 req/hour per email)
- [ ] Account lockout after 5 failed attempts

### Headers

- [ ] `Content-Security-Policy` configured
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` or `SAMEORIGIN`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Strict-Transport-Security` (HSTS) enabled

### Monitoring

- [ ] Login attempts logged
- [ ] Failed authentications alerted
- [ ] Unusual access patterns monitored
- [ ] Token expiration/refresh tracked

---

## Production Hardening

### 1. HTTPS Enforcement

**Reverse Proxy Configuration** (Nginx):

```nginx
server {
    listen 80;
    server_name example.com;

    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256...';
    ssl_prefer_server_ciphers on;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }
}
```

### 2. Database Security

**PostgreSQL Configuration**:

```bash
# Use SSL connection
DATABASE_URI=postgresql://user:pass@host:5432/db?sslmode=require

# Or with certificate verification
DATABASE_URI=postgresql://user:pass@host:5432/db?sslmode=verify-full&sslrootcert=/path/to/ca.crt
```

**Access Control**:
- Use dedicated database user with minimal privileges
- Restrict database access by IP address
- Enable database audit logging

### 3. Secrets Management

**Environment Variables**:

```bash
# ❌ NEVER commit .env files
.env
.env.local
.env.production

# ✅ Use secret management service
# - AWS Secrets Manager
# - Google Cloud Secret Manager
# - HashiCorp Vault
# - Vercel Environment Variables (for Vercel deployments)
```

**Rotation Policy**:
- Rotate `PAYLOAD_SECRET` annually or after security incident
- Rotate database credentials every 90 days
- Invalidate all sessions after secret rotation (users must re-login)

---

## Incident Response

### Token Compromise Response

1. **Immediate Actions**:
   - Rotate `PAYLOAD_SECRET` environment variable
   - Restart application (invalidates all existing tokens)
   - Force all users to re-login

2. **Investigation**:
   - Review access logs for suspicious activity
   - Identify affected users
   - Determine attack vector

3. **Remediation**:
   - Patch vulnerability (XSS, database breach, etc.)
   - Reset passwords for affected users
   - Notify users of security incident

### Database Breach Response

1. **Immediate Actions**:
   - Disable database access from compromised systems
   - Rotate database credentials
   - Export audit logs

2. **Impact Assessment**:
   - Identify compromised data (user emails, hashed passwords)
   - Check for exfiltrated data in logs

3. **Remediation**:
   - Force password reset for all users
   - Notify users of breach (legal requirement in many jurisdictions)
   - Implement additional monitoring

---

## Decision History & Trade-offs

### Why 7-Day Token Expiration?

**Decision**: Set JWT expiration to 7 days.

**Rationale**:
- **Balance**: Long enough for good UX, short enough to limit exposure
- **Auto-Refresh**: Active users never notice expiration
- **Inactive Users**: Forced to re-authenticate after 1 week

**Trade-offs**:
- Stolen token valid for up to 7 days
- Cannot revoke token before expiration

**Mitigation**:
- Auto-refresh for active users (reduces effective window)
- Rotate secret immediately if breach suspected
- Consider shorter expiration (1-3 days) for high-security environments

### Why No OAuth/Social Login?

**Decision**: Use email/password authentication only.

**Rationale**:
- **Simplicity**: No external dependencies or OAuth flows
- **Control**: Full control over user data and auth logic
- **Privacy**: User data stays within our system

**Trade-offs**:
- No "Sign in with Google/GitHub" convenience
- Users must remember another password
- Cannot leverage social graph

**Future Consideration**:
- Can add OAuth plugins later if needed
- Payload supports custom authentication strategies
- Consider for public-facing applications

---

## Next Steps

- Review [API Headers](../api/headers.md) for CORS and security headers
- See [Guidelines](../guidelines.md) for security testing procedures
- Review [Deployment](../guidelines.md#deployment) for production security
