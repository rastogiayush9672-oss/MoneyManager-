const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function updatePasswords() {
  await mongoose.connect('mongodb://127.0.0.1:27017/moneymanager');
  console.log('Connected to MongoDB...');
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('123456', salt);
  
  const result = await User.updateMany({}, { password: hash });
  console.log(`Successfully updated ${result.modifiedCount} users to password '123456'!`);
  
  const users = await User.find({}, 'name email');
  console.log('Available accounts:');
  users.forEach(u => console.log(`- ${u.name}: ${u.email} (Password: 123456)`));
  
  process.exit();
}

updatePasswords();
