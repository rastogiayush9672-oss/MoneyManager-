require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Salary = require('./models/Salary');
const Budget = require('./models/Budget');
const Goal = require('./models/Goal');
const Subscription = require('./models/Subscription');
const AssetLiability = require('./models/AssetLiability');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/moneymanager';

async function seedRichFinancialData() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for enrichment...');

  const users = await User.find({});
  if (users.length === 0) {
    console.log('No users found to enrich.');
    process.exit(0);
  }

  for (const user of users) {
    console.log(`Enriching data for: ${user.name} (${user.email})...`);

    // Update user profile fields if missing
    user.currency = 'INR';
    user.currencySymbol = '₹';
    user.jobTitle = user.jobTitle || 'Lead Software Engineer';
    user.theme = user.theme || 'dark';
    await user.save();

    // 1. Salaries (Last 4 months: Aug, Sep, Oct, Nov 2026)
    const existingSalaries = await Salary.countDocuments({ user: user._id });
    if (existingSalaries === 0) {
      const salaryRecords = [
        { month: 8, year: 2026, paymentDate: new Date('2026-08-31'), net: 118800 },
        { month: 9, year: 2026, paymentDate: new Date('2026-09-30'), net: 118800 },
        { month: 10, year: 2026, paymentDate: new Date('2026-10-31'), net: 128800, bonuses: 10000 },
        { month: 11, year: 2026, paymentDate: new Date('2026-11-01'), net: 118800 }
      ];

      for (const s of salaryRecords) {
        const basic = 75000;
        const hra = 30000;
        const da = 15000;
        const special = 20000;
        const bonus = s.bonuses || 0;
        const gross = basic + hra + da + special + bonus;
        const pf = 9000;
        const tax = 12000;
        const pt = 200;
        const totalDeductions = pf + tax + pt;
        const net = gross - totalDeductions;

        await Salary.create({
          user: user._id,
          employer: 'TechCorp Solutions India Pvt Ltd',
          designation: 'Senior Full Stack Engineer',
          paymentDate: s.paymentDate,
          month: s.month,
          year: s.year,
          basicSalary: basic,
          hra,
          da,
          specialAllowance: special,
          bonuses: bonus,
          incentives: 0,
          grossSalary: gross,
          pfDeduction: pf,
          taxDeduction: tax,
          professionalTax: pt,
          otherDeductions: 0,
          totalDeductions,
          netSalary: net,
          paymentMethod: 'Direct Bank Transfer (HDFC Bank)',
          notes: 'Standard monthly payroll processed'
        });
      }
      console.log(`- Added 4 salary records`);
    }

    // 2. Fresh November & October Transactions
    const novStart = new Date('2026-11-01T00:00:00.000Z');
    const existingNovTx = await Transaction.countDocuments({ user: user._id, date: { $gte: novStart } });

    if (existingNovTx === 0) {
      const freshTransactions = [
        // November 2026 Income
        {
          title: 'Monthly Salary - November 2026',
          amount: 118800,
          type: 'income',
          category: 'Salary',
          paymentMethod: 'Bank Transfer',
          merchant: 'TechCorp Solutions',
          date: new Date('2026-11-01T09:00:00Z'),
          notes: 'November 2026 In-hand salary'
        },
        {
          title: 'Freelance UI/UX Consultation',
          amount: 25000,
          type: 'income',
          category: 'Freelance',
          paymentMethod: 'UPI',
          merchant: 'Fintech Startup Client',
          date: new Date('2026-11-01T14:30:00Z'),
          notes: 'Design review retainer'
        },
        // November Expenses
        {
          title: 'House Rent - November',
          amount: 25000,
          type: 'expense',
          category: 'Rent',
          subCategory: 'Housing',
          paymentMethod: 'Net Banking',
          merchant: 'Landlord',
          date: new Date('2026-11-01T10:15:00Z'),
          isEssential: true
        },
        {
          title: 'Zomato Gourmet Dinner',
          amount: 1850,
          type: 'expense',
          category: 'Food',
          subCategory: 'Dining Out',
          paymentMethod: 'UPI',
          merchant: 'Zomato',
          date: new Date('2026-11-01T19:45:00Z'),
          isEssential: false
        },
        {
          title: 'Nature Basket Organic Groceries',
          amount: 3420,
          type: 'expense',
          category: 'Food',
          subCategory: 'Groceries',
          paymentMethod: 'Credit Card',
          merchant: "Nature's Basket",
          date: new Date('2026-11-01T11:20:00Z'),
          isEssential: true
        },
        {
          title: 'Uber City Commute',
          amount: 450,
          type: 'expense',
          category: 'Transport',
          subCategory: 'Cabs',
          paymentMethod: 'UPI',
          merchant: 'Uber India',
          date: new Date('2026-11-01T08:30:00Z'),
          isEssential: true
        },
        {
          title: 'Amazon Tech Books & Accessories',
          amount: 2890,
          type: 'expense',
          category: 'Shopping',
          subCategory: 'Electronics',
          paymentMethod: 'Credit Card',
          merchant: 'Amazon India',
          date: new Date('2026-11-01T16:00:00Z'),
          isEssential: false
        },
        // October 2026 Transactions (for period comparison)
        {
          title: 'October Salary In-hand',
          amount: 128800,
          type: 'income',
          category: 'Salary',
          paymentMethod: 'Bank Transfer',
          date: new Date('2026-10-31T09:00:00Z')
        },
        {
          title: 'House Rent - October',
          amount: 25000,
          type: 'expense',
          category: 'Rent',
          paymentMethod: 'Net Banking',
          date: new Date('2026-10-02T10:00:00Z')
        },
        {
          title: 'Groceries D-Mart Bulk',
          amount: 6800,
          type: 'expense',
          category: 'Food',
          paymentMethod: 'Credit Card',
          date: new Date('2026-10-12T15:00:00Z')
        },
        {
          title: 'Dining Out with Team',
          amount: 4200,
          type: 'expense',
          category: 'Food',
          paymentMethod: 'Credit Card',
          date: new Date('2026-10-18T20:30:00Z')
        },
        {
          title: 'Electricity & Utility Bill',
          amount: 2850,
          type: 'expense',
          category: 'Utilities',
          paymentMethod: 'UPI',
          date: new Date('2026-10-15T11:00:00Z')
        },
        {
          title: 'Flight Ticket - Diwali Vacation',
          amount: 8500,
          type: 'expense',
          category: 'Travel',
          paymentMethod: 'Credit Card',
          date: new Date('2026-10-22T13:40:00Z')
        }
      ];

      for (const t of freshTransactions) {
        await Transaction.create({ ...t, user: user._id });
      }
      console.log(`- Added ${freshTransactions.length} fresh transactions`);
    }

    // 3. Budgets (November 2026)
    const existingBudgets = await Budget.countDocuments({ user: user._id, month: 11, year: 2026 });
    if (existingBudgets === 0) {
      const budgetItems = [
        { category: 'Food', limit: 12000, alertThreshold: 80 },
        { category: 'Shopping', limit: 10000, alertThreshold: 80 },
        { category: 'Transport', limit: 5000, alertThreshold: 80 },
        { category: 'Entertainment', limit: 6000, alertThreshold: 80 },
        { category: 'Utilities', limit: 6000, alertThreshold: 85 },
        { category: 'Rent', limit: 25000, alertThreshold: 95 }
      ];

      for (const b of budgetItems) {
        await Budget.create({
          user: user._id,
          category: b.category,
          limit: b.limit,
          month: 11,
          year: 2026,
          alertThreshold: b.alertThreshold
        });
      }
      console.log(`- Added ${budgetItems.length} budget categories`);
    }

    // 4. Financial Goals
    const existingGoals = await Goal.countDocuments({ user: user._id });
    if (existingGoals === 0) {
      const goalsList = [
        {
          name: 'Emergency Fund (6 Months)',
          targetAmount: 300000,
          currentAmount: 210000,
          targetDate: new Date('2027-03-31'),
          monthlyContribution: 18000,
          category: 'Emergency Fund',
          history: [
            { amount: 150000, date: new Date('2026-08-01'), note: 'Initial allocation' },
            { amount: 30000, date: new Date('2026-09-15'), note: 'Monthly savings' },
            { amount: 30000, date: new Date('2026-10-20'), note: 'Monthly savings' }
          ]
        },
        {
          name: 'New Apple MacBook Pro M4',
          targetAmount: 160000,
          currentAmount: 125000,
          targetDate: new Date('2026-12-25'),
          monthlyContribution: 20000,
          category: 'New Laptop',
          history: [
            { amount: 80000, date: new Date('2026-09-01'), note: 'Savings allocation' },
            { amount: 45000, date: new Date('2026-10-15'), note: 'Freelance savings' }
          ]
        },
        {
          name: 'Japan Autumn Vacation',
          targetAmount: 220000,
          currentAmount: 95000,
          targetDate: new Date('2027-09-30'),
          monthlyContribution: 12500,
          category: 'Vacation',
          history: [
            { amount: 60000, date: new Date('2026-08-15'), note: 'Flight deposit fund' },
            { amount: 35000, date: new Date('2026-10-10'), note: 'Monthly deposit' }
          ]
        }
      ];

      for (const g of goalsList) {
        await Goal.create({ ...g, user: user._id });
      }
      console.log(`- Added ${goalsList.length} savings goals`);
    }

    // 5. Subscriptions & Recurring Bills
    const existingSubs = await Subscription.countDocuments({ user: user._id });
    if (existingSubs === 0) {
      const subsList = [
        {
          name: 'Netflix 4K Ultra HD',
          amount: 649,
          billingCycle: 'monthly',
          category: 'Streaming',
          nextDueDate: new Date('2026-11-05'),
          paymentMethod: 'Credit Card Auto-Debit'
        },
        {
          name: 'Spotify Premium Duo',
          amount: 179,
          billingCycle: 'monthly',
          category: 'Streaming',
          nextDueDate: new Date('2026-11-08'),
          paymentMethod: 'UPI AutoPay'
        },
        {
          name: 'JioFiber 300 Mbps Unlimited',
          amount: 1179,
          billingCycle: 'monthly',
          category: 'Mobile & Internet',
          nextDueDate: new Date('2026-11-12'),
          paymentMethod: 'Debit Card'
        },
        {
          name: 'Electricity Board BESCOM',
          amount: 2450,
          billingCycle: 'monthly',
          category: 'Utilities',
          nextDueDate: new Date('2026-11-15'),
          paymentMethod: 'UPI'
        },
        {
          name: 'Amazon Prime Annual',
          amount: 1499,
          billingCycle: 'yearly',
          category: 'Streaming',
          nextDueDate: new Date('2027-04-18'),
          paymentMethod: 'Credit Card'
        }
      ];

      for (const s of subsList) {
        await Subscription.create({ ...s, user: user._id });
      }
      console.log(`- Added ${subsList.length} subscriptions`);
    }

    // 6. Net Worth: Assets & Liabilities
    const existingAssets = await AssetLiability.countDocuments({ user: user._id });
    if (existingAssets === 0) {
      const assetList = [
        { type: 'asset', category: 'Cash & Bank Balance', name: 'HDFC Corporate Salary Account', value: 142000, institution: 'HDFC Bank' },
        { type: 'asset', category: 'Cash & Bank Balance', name: 'SBI Savings Account', value: 85000, institution: 'State Bank of India' },
        { type: 'asset', category: 'Mutual Funds & SIP', name: 'Nifty 50 Index Fund & Parag Parikh Flexi Cap', value: 480000, institution: 'Zerodha Coin', interestRate: 14.5 },
        { type: 'asset', category: 'Stocks & Equity', name: 'Direct Equity Portfolio (TCS, Infosys, HDFC)', value: 320000, institution: 'Zerodha Kite' },
        { type: 'asset', category: 'Fixed Deposits & RD', name: 'HDFC High Yield 1-Year FD', value: 150000, institution: 'HDFC Bank', interestRate: 7.25 },
        { type: 'asset', category: 'Provident Fund & PPF', name: 'Employee Provident Fund (EPF)', value: 210000, institution: 'EPFO', interestRate: 8.25 },
        { type: 'asset', category: 'Gold & Precious Metals', name: 'RBI Sovereign Gold Bonds (SGB)', value: 125000, institution: 'RBI' },
        // Liabilities
        { type: 'liability', category: 'Credit Card Outstanding', name: 'HDFC Regalia Gold Card', value: 28500, institution: 'HDFC Bank' },
        { type: 'liability', category: 'Education Loan', name: 'SBI Scholar Loan (Higher Studies)', value: 180000, institution: 'SBI', interestRate: 8.5 }
      ];

      for (const a of assetList) {
        await AssetLiability.create({ ...a, user: user._id });
      }
      console.log(`- Added ${assetList.length} asset & liability records`);
    }

    // 7. Initial Notifications
    const existingNotifs = await Notification.countDocuments({ user: user._id });
    if (existingNotifs === 0) {
      const notifs = [
        {
          user: user._id,
          title: 'Salary Credited for November 2026',
          message: '₹1,18,800 has been deposited to your HDFC Salary Account.',
          type: 'salary',
          link: '/salary'
        },
        {
          user: user._id,
          title: 'Upcoming Bill: Netflix 4K',
          message: '₹649 will be auto-debited in 4 days.',
          type: 'bill',
          link: '/subscriptions'
        },
        {
          user: user._id,
          title: 'Savings Goal Milestone!',
          message: 'Your Apple MacBook Pro goal reached 78% completion. Almost there!',
          type: 'goal',
          link: '/goals'
        }
      ];

      for (const n of notifs) {
        await Notification.create(n);
      }
      console.log(`- Added ${notifs.length} starter notifications`);
    }
  }

  console.log('Enrichment finished successfully!');
  process.exit(0);
}

seedRichFinancialData().catch(err => {
  console.error('Enrichment error:', err);
  process.exit(1);
});
