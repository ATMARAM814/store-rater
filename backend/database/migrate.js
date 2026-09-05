/**
 * Database migration script
 * Creates tables and seeds the admin user via Supabase REST API
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log('🔄 Starting database migration...\n');

  // Test connection
  console.log('1. Testing Supabase connection...');
  const { data: testData, error: testError } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (testError && testError.code === '42P01') {
    console.log('   ⚠️  Tables do not exist yet.');
    console.log('\n   ❌ Please run the SQL migration manually:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/cjfifmagowtbnyjiuyuu/sql/new');
    console.log('   2. Paste the contents of database/migration.sql');
    console.log('   3. Click "Run"');
    console.log('   4. Then run this script again to seed the admin user.\n');
    return;
  }

  if (testError && testError.code !== '42P01') {
    console.log('   Connection test result:', testError.message);
  } else {
    console.log('   ✅ Connected to Supabase successfully!');
  }

  // Seed admin user
  console.log('\n2. Seeding admin user...');
  const adminPassword = await bcrypt.hash('Admin@1234', 12);

  const { data: existingAdmin } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'admin@roxiler.com')
    .single();

  if (existingAdmin) {
    console.log('   ℹ️  Admin user already exists. Skipping.');
  } else {
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert([
        {
          name: 'System Administrator User',
          email: 'admin@roxiler.com',
          password: adminPassword,
          address: '123 Admin Street, Headquarters Building, City Center',
          role: 'ADMIN',
        },
      ])
      .select('id, name, email, role')
      .single();

    if (adminError) {
      console.log('   ❌ Error creating admin:', adminError.message);
    } else {
      console.log('   ✅ Admin user created:', admin.email);
      console.log('      Password: Admin@1234');
    }
  }

  console.log('\n✅ Migration complete!');
  console.log('\n📋 Default Admin Login:');
  console.log('   Email: admin@roxiler.com');
  console.log('   Password: Admin@1234\n');
}

migrate().catch(console.error);
