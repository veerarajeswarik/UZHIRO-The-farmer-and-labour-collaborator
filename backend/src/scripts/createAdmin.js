/**
 * Creates (or promotes) an admin account. Admin accounts are NEVER created
 * through the public register endpoint - this CLI script is the only way
 * to provision one, keeping the attack surface for privilege escalation at
 * zero on the public API.
 *
 *   Usage: node src/scripts/createAdmin.js <email> <password> [name] [phone] [location]
 *   npm run create:admin -- admin@uzhiro.local Secret123 "UZHIRO Admin" 9000000000 India
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function run() {
  const [email, password, name = 'UZHIRO Admin', phone = '0000000000', location = 'India'] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Usage: node src/scripts/createAdmin.js <email> <password> [name] [phone] [location]');
    process.exit(1);
  }
  if (password.length < 6) {
    console.error('[create:admin] Password must be at least 6 characters.');
    process.exit(1);
  }

  await connectDB();
  if (mongoose.connection.readyState !== 1) {
    console.error('[create:admin] No database connection - set MONGODB_URI in backend/.env first.');
    process.exit(1);
  }

  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    if (user.role === 'admin') {
      console.log(`[create:admin] ${email} is already an admin.`);
    } else {
      user.role = 'admin';
      await user.save();
      console.log(`[create:admin] Promoted existing user ${email} to admin.`);
    }
  } else {
    user = await User.create({ name, email, password, phone, location, role: 'admin' });
    console.log(`[create:admin] Created new admin account: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[create:admin] Failed:', err);
  process.exit(1);
});
