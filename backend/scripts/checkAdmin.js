const db = require('../config/db');

async function checkAdmin() {
  try {
    // Check database connection
    const [testConnection] = await db.query('SELECT 1');
    console.log('Database connection successful:', testConnection);

    // Get all admin users
    const [admins] = await db.query('SELECT * FROM Admin');
    console.log('\nAll admin users in database:', admins);

    // Get specific admin user
    const [admin] = await db.query('SELECT * FROM Admin WHERE Username = ?', ['admin']);
    console.log('\nSpecific admin user:', admin);

    // Test password verification
    if (admin.length > 0) {
      const bcrypt = require('bcryptjs');
      const testPassword = 'admin123';
      const isMatch = await bcrypt.compare(testPassword, admin[0].Password);
      console.log('\nPassword verification test:');
      console.log('Test password:', testPassword);
      console.log('Stored hash:', admin[0].Password);
      console.log('Password matches:', isMatch);
    }

  } catch (error) {
    console.error('Error checking admin:', error);
  } finally {
    await db.end();
    process.exit();
  }
}

checkAdmin(); 