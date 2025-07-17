
# Security Guidelines for GoodyMorgan

## Handling Sensitive Information

### Environment Variables

- **NEVER** hardcode secrets, API keys, or other sensitive data in your source code
- Always use environment variables for sensitive data
- Environment variables should be loaded through the `import.meta.env` object in Vite
- Use the `getEnvVariable` helper function from `src/config/appConfig.ts`
- Document all required environment variables for your deployment

### Secrets and Tokens

- JSON Web Tokens (JWTs) should never be stored in source code
- API keys should be stored in the Supabase dashboard as Edge Function secrets
- For local development, use a `.env` file that is excluded from version control
- Use the Supabase CLI to set secrets: `supabase secrets set KEY=VALUE`

### Secure Communication

- Always use HTTPS for API communication
- Validate and sanitize all inputs, especially from external sources
- Use the secure Axios wrapper for external requests

## Database Security

- Use Row Level Security (RLS) policies in Supabase
- Implement proper authentication checks before database operations
- Avoid exposing sensitive database fields in API responses
- Use parameterized queries to prevent SQL injection

## Frontend Security

- Implement proper CORS protections
- Avoid storing sensitive information in localStorage or sessionStorage
- Use the Security Boundary components for development security
- Validate and sanitize user inputs

## Edge Functions

- Store all API keys and secrets using the Supabase CLI or Dashboard
- Follow the principle of least privilege
- Implement proper error handling that doesn't leak sensitive information

## Development Guidelines

1. Regularly run security scans on your codebase
2. Follow the principle of least privilege
3. Keep dependencies updated
4. Use strong authentication mechanisms
5. Perform regular security audits

Remember: Security is everyone's responsibility. When in doubt, err on the side of caution and consult with the security team.
