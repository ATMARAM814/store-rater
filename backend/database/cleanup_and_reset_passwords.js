const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

async function cleanupAndResetPasswords() {
  console.log('🧹 Cleaning up ratings and setting password to Password@123 for all users...');

  // 1. Delete all ratings so stores have 0 ratings
  const { error: ratingsError } = await supabase
    .from('ratings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes all rows

  if (ratingsError) {
    console.error('Error deleting ratings:', ratingsError.message);
  } else {
    console.log('✅ Deleted all ratings. All stores now have 0 ratings / "New".');
  }

  // 2. Hash Password@123
  const newPasswordHash = await bcrypt.hash('Password@123', 12);

  // 3. Update password for all users
  const { data: allUsers, error: usersFetchError } = await supabase
    .from('users')
    .select('id, name, email, role');

  if (usersFetchError) {
    console.error('Error fetching users:', usersFetchError.message);
    process.exit(1);
  }

  console.log(`Updating passwords for ${allUsers.length} user accounts...`);

  for (const u of allUsers) {
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: newPasswordHash })
      .eq('id', u.id);

    if (updateError) {
      console.error(`Error updating password for ${u.email}:`, updateError.message);
    } else {
      console.log(`🔑 Updated password for [${u.role}] ${u.name} (${u.email}) -> Password@123`);
    }
  }

  console.log('\n🎉 Successfully reset all passwords to Password@123 and wiped all ratings!');
  process.exit(0);
}

cleanupAndResetPasswords().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
