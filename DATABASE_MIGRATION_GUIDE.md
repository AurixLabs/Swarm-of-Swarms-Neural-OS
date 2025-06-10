
# GoodyMorgan Database Migration Guide

This guide provides multiple methods to apply database migrations without requiring a local Supabase CLI installation.

## Method 1: Supabase Dashboard SQL Editor

This is the simplest approach that requires no additional tools:

1. Log in to [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to your project: `goodymorgan-live`
3. Go to the SQL Editor tab
4. Copy the entire contents of your migration file (`supabase/migrations/20250415_fix_foreign_keys.sql`)
5. Execute the SQL in the editor

## Method 2: Docker-based Migration

If you prefer a more automated approach and have Docker installed:

### On macOS/Linux:
```bash
# Set your Supabase access token
export SUPABASE_ACCESS_TOKEN="your-access-token-here"

# Run the migration script
cd supabase/functions
chmod +x run-migrations-docker.sh
./run-migrations-docker.sh
```

### On Windows:
```powershell
# Set your Supabase access token
$env:SUPABASE_ACCESS_TOKEN="your-access-token-here"

# Run the migration script
cd supabase\functions
.\run-migrations-docker.bat
```

## Method 3: Database Reset (Development Only)

For development environments only, you can reset and recreate your database:

1. Go to Supabase Dashboard > Project Settings > Database
2. Click "Reset Database" (WARNING: This will erase all data)
3. After reset, your latest migrations will be applied automatically

## Common Issues and Troubleshooting

### Missing Tables
If you encounter an error like `relation "table_name" does not exist`, it means the table doesn't exist yet. The migration script now includes checks to create missing tables before modifying them.

### Reference Tables Missing
The current migration has identified that the `threads` table may not exist in your database. The script has been updated to:
1. Create necessary tables if they don't exist
2. Skip foreign key constraints for non-existent tables
3. Add comments to columns that should have foreign keys once their reference tables exist

### Migration Conflicts
If you see errors about constraints already existing:
- Check if the constraints were already created manually
- Try running only the "DROP CONSTRAINT" portion of the script first

### Permission Errors
If you encounter permission issues:
- Ensure you're logged in as the database owner or have sufficient privileges
- Try using the SQL Editor in the Supabase Dashboard which uses admin credentials

### Creating Missing Reference Tables
If you need to create the missing `threads` table, you can adapt the schema from `src/lib/polardb/schema.ts` which contains the definition for all tables including `threads`.

### Testing Migrations
To verify your migrations were successful:
1. Go to the "Table Editor" in Supabase Dashboard
2. Navigate to one of the affected tables (e.g., file_processor)
3. Check that the tables exist and have the correct structure
