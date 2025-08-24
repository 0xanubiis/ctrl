# Database Setup Scripts

This directory contains SQL scripts to set up your Supabase database for the AI Audio SaaS application.

## 📁 Files

- **`setup-database.sql`** - Complete setup script with all features
- **`setup-database-simple.sql`** - Simplified step-by-step version

## 🚀 Quick Setup (Recommended)

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor** (left sidebar)
3. **Copy and paste the entire content** of `setup-database.sql`
4. **Click "Run"** to execute all commands at once

## 🔧 Step-by-Step Setup (Alternative)

If you prefer to run commands individually:

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor** (left sidebar)
3. **Copy and paste each step** from `setup-database-simple.sql`
4. **Run each command separately** by clicking "Run"

## 📊 What Gets Created

### Tables
- **`profiles`** - User profile information
- **`subscriptions`** - User subscription details
- **`usage_tracking`** - Feature usage monitoring
- **`audio_files`** - Audio file metadata and storage

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- **User isolation** - users can only access their own data
- **Automatic profile creation** when users sign up
- **Usage tracking functions** for monitoring limits

### Performance Features
- **Database indexes** for fast queries
- **Automatic timestamp updates** on record changes
- **Efficient usage counting** by month

## ✅ Verification

After running the script, you should see:

```
Database setup completed successfully!
Tables created: profiles, subscriptions, usage_tracking, audio_files
RLS policies enabled for all tables
Triggers created for automatic profile creation and timestamp updates
Functions created for usage tracking and management
Indexes created for optimal performance
```

## 🔍 Check Your Tables

You can verify the setup by running this query in the SQL Editor:

```sql
SELECT 
  table_name,
  row_count
FROM (
  SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
  UNION ALL
  SELECT 'subscriptions', COUNT(*) FROM subscriptions
  UNION ALL
  SELECT 'usage_tracking', COUNT(*) FROM usage_tracking
  UNION ALL
  SELECT 'audio_files', COUNT(*) FROM audio_files
) t;
```

## 🚨 Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Make sure you're running as a database owner
   - Check that RLS policies are created correctly

2. **"Table already exists" warnings**
   - These are normal and can be ignored
   - The `IF NOT EXISTS` clause prevents errors

3. **"Function already exists" warnings**
   - These are normal and can be ignored
   - Functions are updated if they already exist

### If Something Goes Wrong

1. **Check the SQL Editor output** for specific error messages
2. **Verify your Supabase project permissions**
3. **Try running the simple version** step by step
4. **Contact support** with the specific error message

## 🔄 Reset Database (if needed)

If you need to start over, run this in the SQL Editor:

```sql
-- Drop all tables (WARNING: This will delete all data!)
DROP TABLE IF EXISTS audio_files CASCADE;
DROP TABLE IF EXISTS usage_tracking CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_current_month_usage(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS increment_usage(UUID, TEXT) CASCADE;

-- Then run the setup script again
```

## 📚 Next Steps

After setting up the database:

1. **Configure environment variables** (see `CONFIGURATION.md`)
2. **Test the dashboard features** (see `DASHBOARD_FEATURES.md`)
3. **Run the test script**: `npm run test:dashboard`
4. **Start using your application!**

## 🆘 Need Help?

- Check the main `CONFIGURATION.md` file
- Review the `DASHBOARD_FEATURES.md` documentation
- Run the test script to verify everything works
- Check Supabase logs for detailed error information
