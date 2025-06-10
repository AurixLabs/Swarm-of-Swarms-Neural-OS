
# GoodyMorgan Docker Deployment Guide

This guide explains how to deploy GoodyMorgan Supabase Edge Functions using Docker, avoiding local CLI installation issues.

## Prerequisites

- Docker installed on your machine ([Get Docker](https://docs.docker.com/get-docker/))
- Your Supabase access token from [Supabase Dashboard](https://app.supabase.com/account/tokens)

## Deployment Steps

### 1. Set Supabase Token as Environment Variable

Windows PowerShell:
```powershell
$env:SUPABASE_ACCESS_TOKEN="your-access-token-here"
```

macOS/Linux:
```bash
export SUPABASE_ACCESS_TOKEN="your-access-token-here"
```

### 2. Deploy Functions Using Docker

Navigate to your project root (where the `supabase` folder is located) and run:

```bash
# Deploy qwen-chat function
docker run --rm -v ${PWD}:/workdir -w /workdir -e SUPABASE_ACCESS_TOKEN supabase/cli functions deploy qwen-chat --project-ref sptoqlhgvfihhqknglvn

# Deploy qwen-assistant function
docker run --rm -v ${PWD}:/workdir -w /workdir -e SUPABASE_ACCESS_TOKEN supabase/cli functions deploy qwen-assistant --project-ref sptoqlhgvfihhqknglvn
```

### 3. Set Secrets Using Docker

To set API keys or other secrets:

```bash
docker run --rm -e SUPABASE_ACCESS_TOKEN supabase/cli secrets set QWEN_API_KEY="your-qwen-api-key" --project-ref sptoqlhgvfihhqknglvn
```

### 4. Check Function Status

```bash
docker run --rm -e SUPABASE_ACCESS_TOKEN supabase/cli functions list --project-ref sptoqlhgvfihhqknglvn
```

## Using Docker Run Script (Optional)

Create a `deploy-functions.bat` (Windows) or `deploy-functions.sh` (Mac/Linux) file in your project root:

Windows:
```batch
docker run --rm -v %cd%:/workdir -w /workdir -e SUPABASE_ACCESS_TOKEN supabase/cli functions deploy qwen-chat --project-ref sptoqlhgvfihhqknglvn
docker run --rm -v %cd%:/workdir -w /workdir -e SUPABASE_ACCESS_TOKEN supabase/cli functions deploy qwen-assistant --project-ref sptoqlhgvfihhqknglvn
```

Mac/Linux:
```bash
#!/bin/bash
docker run --rm -v $(pwd):/workdir -w /workdir -e SUPABASE_ACCESS_TOKEN supabase/cli functions deploy qwen-chat --project-ref sptoqlhgvfihhqknglvn
docker run --rm -v $(pwd):/workdir -w /workdir -e SUPABASE_ACCESS_TOKEN supabase/cli functions deploy qwen-assistant --project-ref sptoqlhgvfihhqknglvn
```

Make the script executable (Mac/Linux):
```bash
chmod +x deploy-functions.sh
```

## Troubleshooting

- **Volume mounting issues**: Ensure Docker has permission to access your project folder
- **Token errors**: Verify your access token is correctly set as an environment variable
- **Path issues**: Make sure you run commands from the project root directory
- **Docker errors**: Ensure Docker is running and has enough resources allocated

