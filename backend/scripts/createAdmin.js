const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function createAdmin() {
  try {
    // First, let's check the database connection
    const [testConnection] = await db.query('SELECT 1');
    console.log('Database connection successful:', testConnection);

    // Delete any existing admin with this username
    await db.query('DELETE FROM Admin WHERE Username = ?', ['admin']);
    console.log('Cleaned up any existing admin user');

    // Create new admin with simple credentials
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Creating new admin user...');
    const [result] = await db.query(
      'INSERT INTO Admin (Name, Username, Password, Contact, Role) VALUES (?, ?, ?, ?, ?)',
      ['Admin User', 'admin', hashedPassword, '1234567890', 'admin']
    );
    console.log('Admin user created successfully!', result);

    // Verify the admin was created
    const [verifyAdmin] = await db.query('SELECT * FROM Admin WHERE Username = ?', ['admin']);
    console.log('\nVerification - Admin in database:', verifyAdmin);

    // Test password verification
    const isMatch = await bcrypt.compare(password, verifyAdmin[0].Password);
    console.log('\nPassword verification test:');
    console.log('Test password:', password);
    console.log('Stored hash:', verifyAdmin[0].Password);
    console.log('Password matches:', isMatch);

    console.log('\n=================================');
    console.log('Use these credentials to login:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('=================================');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await db.end();
    process.exit();
  }
}

createAdmin(); 