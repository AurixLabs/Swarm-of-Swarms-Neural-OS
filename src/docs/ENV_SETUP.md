
# Environment Setup Guide

This guide explains how to properly set up environment variables for secure development.

## Local Development

1. Copy the `.env.example` file to a new file named `.env`
2. Fill in your actual values for each environment variable
3. **NEVER** commit your `.env` file to version control
4. **NEVER** hardcode secrets in source files

Example:
```
# Supabase Configuration
VITE_SUPABASE_PROJECT_REF=abcdefghijkl
VITE_SUPABASE_URL=https://abcdefghijkl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
VITE_SUPABASE_FUNCTIONS_URL=https://abcdefghijkl.functions.supabase.co
```

## Supabase Edge Function Secrets

For secrets used in Edge Functions:

### Option 1: Using Supabase CLI (Recommended)

```bash
supabase secrets set OPENAI_API_KEY=sk-your-key-here --project-ref your-project-ref
```

### Option 2: Using Supabase Dashboard

1. Log in to the Supabase Dashboard
2. Select your project
3. Go to Project Settings > API
4. Find the Edge Functions section
5. Click on Edge Function Secrets
6. Add secrets as needed

## Verifying Configuration

To check if your environment is properly configured:

1. Run the application in development mode
2. Check the console for any warnings about missing configuration
3. Visit the Supabase Test page to verify connection

Remember that all sensitive information should be properly secured and never committed to version control.
