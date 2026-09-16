require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/moneymanager';
const categories = ['Food', 'Transport', 'Rent', 'Shopping', 'Entertainment', 'Salary', 'Freelance'];

async function fillData() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB...');

  // Get all users
  const users = await User.find({});
  if (users.length === 0) {
      console.log("No users found. Please register first.");
      process.exit();
  }

  for (let user of users) {
      // Clear existing transactions for this user so we don't duplicate forever
      await Transaction.deleteMany({ user: user._id });

      console.log(`Adding transactions for: ${user.name}`);
      for(let i=0; i<15; i++) {
          const isIncome = Math.random() > 0.6;
          const amt = Math.floor(Math.random() * (isIncome ? 50000 : 5000)) + 500;
          const cat = isIncome ? 'Salary' : categories[Math.floor(Math.random() * 5)];
          const date = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
          
          await Transaction.create({
              user: user._id,
              title: isIncome ? (Math.random() > 0.5 ? 'Monthly Salary' : 'Freelance Project') : (Math.random() > 0.5 ? 'Starbucks' : 'Uber Ride'),
              amount: amt,
              type: isIncome ? 'income' : 'expense',
              category: cat,
              date: date
          });
      }
  }

  console.log('Dummy data filled for all users successfully!');
  process.exit();
}

fillData();
