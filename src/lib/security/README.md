# Security Module

Comprehensive security utilities for the FlashFusion platform, providing input sanitization, CORS configuration, and other security best practices.

## Features

### 1. Input Sanitization (`sanitize.js`)

Provides consistent sanitization methods for user inputs to prevent XSS, injection attacks, and other security vulnerabilities.

#### Available Functions

- **`sanitizeHTML(dirty)`** - Remove dangerous HTML tags and attributes
- **`sanitizeText(input)`** - Remove all HTML and special characters
- **`sanitizeFilename(filename)`** - Ensure safe filenames for filesystem operations
- **`sanitizeURL(url)`** - Validate and sanitize URLs
- **`sanitizeCode(code)`** - Escape HTML entities in code for display
- **`sanitizeEmail(email)`** - Validate and sanitize email addresses

#### Usage Examples

```javascript
import { sanitize } from '@/lib/security';

// Sanitize HTML content
const cleanHTML = sanitize.html('<script>alert("xss")</script><b>Hello</b>');
// Returns: '<b>Hello</b>'

// Sanitize plain text
const cleanText = sanitize.text('<b>Hello</b> World');
// Returns: 'Hello World'

// Sanitize filename
const cleanFilename = sanitize.filename('../../etc/passwd.txt');
// Returns: 'etcpasswd.txt'

// Sanitize URL
const cleanURL = sanitize.url('javascript:alert("xss")');
// Returns: ''

// Sanitize code for display
const cleanCode = sanitize.code('<script>alert("xss")</script>');
// Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'

// Validate email
const cleanEmail = sanitize.email('User@Example.Com');
// Returns: 'user@example.com'
```

### 2. CORS Configuration (`cors.js`)

Environment-based CORS configuration for secure cross-origin requests.

#### Available Functions

- **`getAllowedOrigins(environment)`** - Get allowed origins for an environment
- **`isOriginAllowed(origin, environment)`** - Check if an origin is allowed
- **`getCORSHeaders(origin, environment)`** - Get CORS headers for responses
- **`getViteCORSConfig()`** - Get CORS config for Vite dev server

#### Usage Examples

```javascript
import { corsConfig } from '@/lib/security';

// Get allowed origins for production
const origins = corsConfig.getAllowedOrigins('production');
// Returns: ['https://flashfusion.com', 'https://www.flashfusion.com']

// Check if origin is allowed
const isAllowed = corsConfig.isOriginAllowed('https://flashfusion.com', 'production');
// Returns: true

// In a backend function - get CORS headers
const corsHeaders = corsConfig.getCORSHeaders(request.headers.get('origin'));
return new Response(JSON.stringify(data), { headers: corsHeaders });
```

#### Vite Configuration

Add to your `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import { getViteCORSConfig } from './src/lib/security/cors';

export default defineConfig({
  server: {
    cors: getViteCORSConfig()
  }
});
```

## Environment Configuration

The CORS module automatically detects the environment and applies appropriate restrictions:

### Development
- `http://localhost:5173`
- `http://localhost:3000`
- `http://localhost:4173`
- `http://127.0.0.1:*`

### Staging
- `https://staging.flashfusion.com`
- `https://staging-flashfusion.vercel.app`
- `https://fusion-ai-staging.base44.app`

### Production
- `https://flashfusion.com`
- `https://www.flashfusion.com`
- `https://fusion-ai.base44.app`

## Best Practices

### Always Sanitize User Input

```javascript
import { sanitize } from '@/lib/security';

// When displaying user-generated HTML
<div dangerouslySetInnerHTML={{ __html: sanitize.html(userContent) }} />

// When displaying user text
<p>{sanitize.text(userInput)}</p>

// When accepting file uploads
const safeFilename = sanitize.filename(file.name);

// When displaying code
<pre><code>{sanitize.code(userCode)}</code></pre>
```

### Use Environment-Based CORS

Never use `Access-Control-Allow-Origin: *` in production. Always use the CORS module:

```javascript
// ❌ DON'T DO THIS
const headers = {
  'Access-Control-Allow-Origin': '*'
};

// ✅ DO THIS
import { getCORSHeaders } from '@/lib/security/cors';
const headers = getCORSHeaders(origin, process.env.NODE_ENV);
```

### Validate Emails

```javascript
import { sanitize } from '@/lib/security';

const email = sanitize.email(userInput);
if (!email) {
  throw new Error('Invalid email address');
}
```

## Security Checklist

- [ ] All user inputs are sanitized before display
- [ ] HTML content is sanitized with `sanitize.html()`
- [ ] Filenames are sanitized before filesystem operations
- [ ] URLs are validated before use
- [ ] CORS is configured per environment
- [ ] Email addresses are validated
- [ ] Code snippets are escaped before display

## Contributing

When adding new sanitization functions:

1. Add comprehensive JSDoc comments
2. Include usage examples
3. Add unit tests
4. Update this README

## Related Documentation

- [SECURITY.md](../../SECURITY.md) - Overall security guidelines
- [DEBUG.md](../../DEBUG.md) - Security vulnerabilities and fixes
- [RECOMMENDATIONS_2025.md](../../RECOMMENDATIONS_2025.md) - Security best practices
