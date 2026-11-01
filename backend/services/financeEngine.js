const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Salary = require('../models/Salary');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Subscription = require('../models/Subscription');
const AssetLiability = require('../models/AssetLiability');

/**
 * Normalizes start and end dates to UTC boundaries.
 */
function normalizeDateRange(startDate, endDate) {
  const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * 1. Total Income
 */
async function getTotalIncome(userId, startDate, endDate) {
  const { start, end } = normalizeDateRange(startDate, endDate);
  const result = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type: 'income',
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const total = result[0]?.total || 0;
  const count = result[0]?.count || 0;

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    totalIncome: total,
    transactionCount: count,
    formatted: `₹${total.toLocaleString('en-IN')}`
  };
}

/**
 * 2. Total Expenses
 */
async function getTotalExpenses(userId, startDate, endDate) {
  const { start, end } = normalizeDateRange(startDate, endDate);
  const result = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        maxExpense: { $max: '$amount' },
        avgExpense: { $avg: '$amount' }
      }
    }
  ]);

  const total = result[0]?.total || 0;
  const count = result[0]?.count || 0;
  const max = result[0]?.maxExpense || 0;
  const avg = Math.round(result[0]?.avgExpense || 0);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    totalExpenses: total,
    transactionCount: count,
    highestExpense: max,
    averageExpense: avg,
    formatted: `₹${total.toLocaleString('en-IN')}`
  };
}

/**
 * 3. Salary History
 */
async function getSalaryHistory(userId, limit = 12) {
  const records = await Salary.find({ user: userId })
    .sort({ year: -1, month: -1 })
    .limit(limit);

  const totalEarnings = records.reduce((acc, r) => acc + (r.netSalary || 0), 0);
  const averageMonthly = records.length > 0 ? Math.round(totalEarnings / records.length) : 0;
  const latestSalary = records[0] || null;

  return {
    count: records.length,
    latestSalary,
    averageNetSalary: averageMonthly,
    totalReceived: totalEarnings,
    records
  };
}

/**
 * 4. Expenses by Category
 */
async function getExpenseByCategory(userId, startDate, endDate) {
  const { start, end } = normalizeDateRange(startDate, endDate);
  const result = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        maxAmount: { $max: '$amount' }
      }
    },
    { $sort: { total: -1 } }
  ]);

  const totalExpense = result.reduce((acc, c) => acc + c.total, 0);

  const categories = result.map(c => ({
    category: c._id,
    amount: c.total,
    count: c.count,
    highest: c.maxAmount,
    percentage: totalExpense > 0 ? Number(((c.total / totalExpense) * 100).toFixed(1)) : 0,
    formatted: `₹${c.total.toLocaleString('en-IN')}`
  }));

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    totalExpenses: totalExpense,
    categories,
    topCategory: categories[0] || null
  };
}

/**
 * 5. Monthly Savings
 */
async function getMonthlySavings(userId, month, year) {
  const now = new Date();
  const targetMonth = month ? Number(month) : now.getMonth() + 1; // 1-12
  const targetYear = year ? Number(year) : now.getFullYear();

  const start = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
  const end = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

  const [incomeData, expenseData] = await Promise.all([
    getTotalIncome(userId, start, end),
    getTotalExpenses(userId, start, end)
  ]);

  const income = incomeData.totalIncome;
  const expense = expenseData.totalExpenses;
  const savings = income - expense;
  const savingsRate = income > 0 ? Number(((savings / income) * 100).toFixed(1)) : 0;

  return {
    month: targetMonth,
    year: targetYear,
    monthName: start.toLocaleString('en-US', { month: 'long' }),
    totalIncome: income,
    totalExpenses: expense,
    netSavings: savings,
    savingsRate: savingsRate,
    isDeficit: savings < 0,
    formattedSavings: `₹${Math.abs(savings).toLocaleString('en-IN')}`
  };
}

/**
 * 6. Budget Status & Utilization
 */
async function getBudgetStatus(userId, month, year) {
  const now = new Date();
  const targetMonth = month ? Number(month) : now.getMonth() + 1;
  const targetYear = year ? Number(year) : now.getFullYear();

  const start = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
  const end = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

  const budgets = await Budget.find({ user: userId, month: targetMonth, year: targetYear });
  const categoryExpenses = await getExpenseByCategory(userId, start, end);

  const expenseMap = {};
  categoryExpenses.categories.forEach(c => {
    expenseMap[c.category.toLowerCase()] = c.amount;
  });

  let totalBudget = 0;
  let totalSpentAcrossBudgets = 0;
  const items = budgets.map(b => {
    const spent = expenseMap[b.category.toLowerCase()] || 0;
    const remaining = b.limit - spent;
    const utilization = b.limit > 0 ? Number(((spent / b.limit) * 100).toFixed(1)) : 0;
    const isExceeded = spent > b.limit;
    const isNearLimit = utilization >= (b.alertThreshold || 80);

    totalBudget += b.limit;
    totalSpentAcrossBudgets += spent;

    return {
      _id: b._id,
      category: b.category,
      limit: b.limit,
      spent,
      remaining: Math.max(0, remaining),
      overspent: Math.max(0, spent - b.limit),
      utilization,
      isExceeded,
      isNearLimit
    };
  });

  const overallUtilization = totalBudget > 0 ? Number(((totalSpentAcrossBudgets / totalBudget) * 100).toFixed(1)) : 0;
  const exceededCategories = items.filter(i => i.isExceeded);

  return {
    month: targetMonth,
    year: targetYear,
    monthName: start.toLocaleString('en-US', { month: 'long' }),
    totalBudget,
    totalSpent: totalSpentAcrossBudgets,
    overallUtilization,
    exceededCount: exceededCategories.length,
    exceededCategories,
    budgets: items
  };
}

/**
 * 7. Transaction History with Filters
 */
async function getTransactionHistory(userId, filters = {}) {
  const {
    limit = 20,
    skip = 0,
    type,
    category,
    paymentMethod,
    search,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy = 'date',
    sortOrder = 'desc'
  } = filters;

  const query = { user: new mongoose.Types.ObjectId(userId) };

  if (type && type !== 'all') {
    query.type = type;
  }
  if (category && category !== 'all') {
    query.category = new RegExp(category, 'i');
  }
  if (paymentMethod && paymentMethod !== 'all') {
    query.paymentMethod = paymentMethod;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { merchant: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      query.date.$lte = e;
    }
  }
  if (minAmount !== undefined && minAmount !== '') {
    query.amount = { ...(query.amount || {}), $gte: Number(minAmount) };
  }
  if (maxAmount !== undefined && maxAmount !== '') {
    query.amount = { ...(query.amount || {}), $lte: Number(maxAmount) };
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [transactions, totalCount] = await Promise.all([
    Transaction.find(query).sort(sort).skip(Number(skip)).limit(Number(limit)),
    Transaction.countDocuments(query)
  ]);

  return {
    transactions,
    totalCount,
    limit: Number(limit),
    skip: Number(skip),
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.ceil(totalCount / limit) || 1
  };
}

/**
 * 8. Compare Financial Periods
 */
async function compareFinancialPeriods(userId, period1, period2) {
  const p1 = normalizeDateRange(period1.startDate, period1.endDate);
  const p2 = normalizeDateRange(period2.startDate, period2.endDate);

  const [p1Income, p1Expense, p2Income, p2Expense] = await Promise.all([
    getTotalIncome(userId, p1.start, p1.end),
    getTotalExpenses(userId, p1.start, p1.end),
    getTotalIncome(userId, p2.start, p2.end),
    getTotalExpenses(userId, p2.start, p2.end)
  ]);

  const p1Savings = p1Income.totalIncome - p1Expense.totalExpenses;
  const p2Savings = p2Income.totalIncome - p2Expense.totalExpenses;

  const expenseDiff = p1Expense.totalExpenses - p2Expense.totalExpenses;
  const expensePercentChange = p2Expense.totalExpenses > 0
    ? Number(((expenseDiff / p2Expense.totalExpenses) * 100).toFixed(1))
    : 0;

  const incomeDiff = p1Income.totalIncome - p2Income.totalIncome;
  const incomePercentChange = p2Income.totalIncome > 0
    ? Number(((incomeDiff / p2Income.totalIncome) * 100).toFixed(1))
    : 0;

  return {
    period1: {
      range: `${p1.start.toLocaleDateString()} - ${p1.end.toLocaleDateString()}`,
      income: p1Income.totalIncome,
      expenses: p1Expense.totalExpenses,
      savings: p1Savings
    },
    period2: {
      range: `${p2.start.toLocaleDateString()} - ${p2.end.toLocaleDateString()}`,
      income: p2Income.totalIncome,
      expenses: p2Expense.totalExpenses,
      savings: p2Savings
    },
    changes: {
      incomeChange: incomeDiff,
      incomePercentChange,
      expenseChange: expenseDiff,
      expensePercentChange,
      savingsChange: p1Savings - p2Savings,
      spendingIncreased: expenseDiff > 0
    }
  };
}

/**
 * 9. Financial Goals
 */
async function getFinancialGoals(userId) {
  const goals = await Goal.find({ user: userId }).sort({ isCompleted: 1, targetDate: 1 });
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? Number(((totalSaved / totalTarget) * 100).toFixed(1)) : 0;

  const detailedGoals = goals.map(g => {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    const progress = Number(((g.currentAmount / g.targetAmount) * 100).toFixed(1));
    const now = new Date();
    const monthsRemaining = Math.max(1, Math.ceil((new Date(g.targetDate) - now) / (1000 * 60 * 60 * 24 * 30)));
    const neededMonthly = remaining > 0 ? Math.round(remaining / monthsRemaining) : 0;

    return {
      _id: g._id,
      name: g.name,
      category: g.category,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      remainingAmount: remaining,
      progress: Math.min(100, progress),
      targetDate: g.targetDate,
      isCompleted: g.isCompleted || progress >= 100,
      monthsRemaining,
      neededMonthlyContribution: neededMonthly,
      contributionsCount: g.history ? g.history.length : 0
    };
  });

  return {
    goalsCount: goals.length,
    totalTarget,
    totalSaved,
    overallProgress,
    goals: detailedGoals
  };
}

/**
 * 10. Recurring Payments & Subscriptions
 */
async function getRecurringPayments(userId) {
  const subscriptions = await Subscription.find({ user: userId }).sort({ nextDueDate: 1 });
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let monthlyTotal = 0;
  let annualTotal = 0;

  const enriched = subscriptions.map(s => {
    let monthlyEquiv = s.amount;
    if (s.billingCycle === 'yearly') monthlyEquiv = s.amount / 12;
    if (s.billingCycle === 'quarterly') monthlyEquiv = s.amount / 3;
    if (s.billingCycle === 'weekly') monthlyEquiv = s.amount * 4.33;

    if (s.status === 'active') {
      monthlyTotal += monthlyEquiv;
      annualTotal += monthlyEquiv * 12;
    }

    const dueDate = new Date(s.nextDueDate);
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;
    const isOverdue = daysUntilDue < 0;

    return {
      _id: s._id,
      name: s.name,
      amount: s.amount,
      billingCycle: s.billingCycle,
      category: s.category,
      nextDueDate: s.nextDueDate,
      paymentMethod: s.paymentMethod,
      status: s.status,
      monthlyEquivalent: Math.round(monthlyEquiv),
      daysUntilDue,
      isDueSoon,
      isOverdue
    };
  });

  const dueSoonList = enriched.filter(s => s.status === 'active' && (s.isDueSoon || s.isOverdue));

  return {
    count: subscriptions.length,
    activeCount: subscriptions.filter(s => s.status === 'active').length,
    monthlyCommitment: Math.round(monthlyTotal),
    annualCommitment: Math.round(annualTotal),
    dueSoonCount: dueSoonList.length,
    dueSoon: dueSoonList,
    subscriptions: enriched
  };
}

/**
 * 11. Cash Flow
 */
async function getCashFlow(userId, startDate, endDate) {
  const { start, end } = normalizeDateRange(startDate, endDate);

  // Group by day or month depending on range span
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const isDaily = diffDays <= 45;

  const groupFormat = isDaily ? '%Y-%m-%d' : '%Y-%m';

  const [inflow, outflow] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          type: 'income',
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  const dateMap = {};
  inflow.forEach(item => {
    dateMap[item._id] = { date: item._id, income: item.total, expense: 0, net: item.total };
  });
  outflow.forEach(item => {
    if (!dateMap[item._id]) {
      dateMap[item._id] = { date: item._id, income: 0, expense: item.total, net: -item.total };
    } else {
      dateMap[item._id].expense = item.total;
      dateMap[item._id].net = dateMap[item._id].income - item.total;
    }
  });

  const timeline = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  const totalIncome = inflow.reduce((acc, i) => acc + i.total, 0);
  const totalExpense = outflow.reduce((acc, o) => acc + o.total, 0);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    isDaily,
    totalIncome,
    totalExpense,
    netCashFlow: totalIncome - totalExpense,
    timeline
  };
}

/**
 * 12. Savings Rate
 */
async function calculateSavingsRate(userId, startDate, endDate) {
  const { start, end } = normalizeDateRange(startDate, endDate);
  const [inc, exp] = await Promise.all([
    getTotalIncome(userId, start, end),
    getTotalExpenses(userId, start, end)
  ]);

  const income = inc.totalIncome;
  const expense = exp.totalExpenses;
  const netSavings = income - expense;
  const savingsRate = income > 0 ? Number(((netSavings / income) * 100).toFixed(1)) : 0;

  let rating = 'Needs Attention';
  if (savingsRate >= 40) rating = 'Excellent';
  else if (savingsRate >= 25) rating = 'Very Good';
  else if (savingsRate >= 15) rating = 'Good';
  else if (savingsRate > 0) rating = 'Fair';

  return {
    income,
    expense,
    netSavings,
    savingsRate,
    rating,
    rule503020: {
      needs: Math.round(income * 0.5),
      wants: Math.round(income * 0.3),
      savingsTarget: Math.round(income * 0.2),
      actualSavingsPercentage: savingsRate
    }
  };
}

/**
 * 13. Can Afford Purchase Assessment
 */
async function canAffordPurchase(userId, amount, category = 'General') {
  const cost = Number(amount);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [monthlySavingsData, budgetStatusData, netWorthData] = await Promise.all([
    getMonthlySavings(userId, now.getMonth() + 1, now.getFullYear()),
    getBudgetStatus(userId, now.getMonth() + 1, now.getFullYear()),
    getNetWorth(userId)
  ]);

  const currentMonthBalance = monthlySavingsData.netSavings;
  const liquidCash = netWorthData.liquidCash || currentMonthBalance;

  const targetBudget = budgetStatusData.budgets.find(
    b => b.category.toLowerCase() === category.toLowerCase()
  );

  let budgetImpact = null;
  if (targetBudget) {
    const newSpent = targetBudget.spent + cost;
    budgetImpact = {
      category: targetBudget.category,
      currentSpent: targetBudget.spent,
      limit: targetBudget.limit,
      wouldExceed: newSpent > targetBudget.limit,
      excessAmount: Math.max(0, newSpent - targetBudget.limit),
      newUtilization: Number(((newSpent / targetBudget.limit) * 100).toFixed(1))
    };
  }

  const remainingAfterPurchase = currentMonthBalance - cost;
  const isAffordable = remainingAfterPurchase >= 0 || liquidCash >= cost;

  let recommendation = '';
  if (remainingAfterPurchase >= 0 && (!budgetImpact || !budgetImpact.wouldExceed)) {
    recommendation = `Yes, you can comfortably afford this ₹${cost.toLocaleString('en-IN')} purchase from this month's cash flow surplus.`;
  } else if (liquidCash >= cost) {
    recommendation = `You have sufficient liquid reserves (₹${liquidCash.toLocaleString('en-IN')}) to cover ₹${cost.toLocaleString('en-IN')}, but this will consume this month's net cash flow surplus.`;
  } else {
    recommendation = `We do not recommend making this ₹${cost.toLocaleString('en-IN')} purchase right now as it exceeds your currently available monthly cash flow.`;
  }

  return {
    itemCost: cost,
    category,
    currentMonthNetSavings: currentMonthBalance,
    liquidCash,
    remainingAfterPurchase,
    isAffordable,
    budgetImpact,
    recommendation
  };
}

/**
 * 14. Net Worth & Assets / Liabilities
 */
async function getNetWorth(userId) {
  const records = await AssetLiability.find({ user: userId });

  let totalAssets = 0;
  let totalLiabilities = 0;
  let liquidCash = 0;

  const assetsByCategory = {};
  const liabilitiesByCategory = {};

  records.forEach(r => {
    if (r.type === 'asset') {
      totalAssets += r.value;
      assetsByCategory[r.category] = (assetsByCategory[r.category] || 0) + r.value;
      if (r.category === 'Cash & Bank Balance' || r.category === 'Fixed Deposits & RD') {
        liquidCash += r.value;
      }
    } else {
      totalLiabilities += r.value;
      liabilitiesByCategory[r.category] = (liabilitiesByCategory[r.category] || 0) + r.value;
    }
  });

  // If user has not added assets manually yet, compute liquid cash from all-time transactions
  if (totalAssets === 0) {
    const allTransactions = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);
    const inc = allTransactions.find(t => t._id === 'income')?.total || 0;
    const exp = allTransactions.find(t => t._id === 'expense')?.total || 0;
    liquidCash = Math.max(0, inc - exp);
    totalAssets = liquidCash;
  }

  const netWorth = totalAssets - totalLiabilities;
  const debtToAssetRatio = totalAssets > 0 ? Number(((totalLiabilities / totalAssets) * 100).toFixed(1)) : 0;

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    liquidCash,
    debtToAssetRatio,
    assetsByCategory,
    liabilitiesByCategory,
    formattedNetWorth: `₹${netWorth.toLocaleString('en-IN')}`,
    records
  };
}

/**
 * 15. Financial Health Score (0 - 100)
 */
async function getFinancialHealthScore(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [savingsRateData, budgetStatusData, recurringData, netWorthData] = await Promise.all([
    calculateSavingsRate(userId, startOfMonth, endOfMonth),
    getBudgetStatus(userId, now.getMonth() + 1, now.getFullYear()),
    getRecurringPayments(userId),
    getNetWorth(userId)
  ]);

  let score = 50; // Base score

  // 1. Savings Rate factor (+/- 25 pts)
  const rate = savingsRateData.savingsRate;
  if (rate >= 30) score += 25;
  else if (rate >= 20) score += 18;
  else if (rate >= 10) score += 10;
  else if (rate > 0) score += 5;
  else score -= 15;

  // 2. Budget Discipline factor (+/- 15 pts)
  if (budgetStatusData.exceededCount === 0 && budgetStatusData.totalBudget > 0) {
    score += 15;
  } else if (budgetStatusData.exceededCount > 0) {
    score -= Math.min(15, budgetStatusData.exceededCount * 5);
  }

  // 3. Debt to Asset ratio (+/- 10 pts)
  if (netWorthData.debtToAssetRatio < 20) score += 10;
  else if (netWorthData.debtToAssetRatio > 60) score -= 10;

  score = Math.max(10, Math.min(98, score));

  let label = 'Fair';
  let badgeColor = '#f59e0b';
  if (score >= 80) { label = 'Excellent'; badgeColor = '#10b981'; }
  else if (score >= 65) { label = 'Strong'; badgeColor = '#3b82f6'; }
  else if (score >= 45) { label = 'Moderate'; badgeColor = '#f59e0b'; }
  else { label = 'Needs Immediate Attention'; badgeColor = '#ef4444'; }

  return {
    score,
    label,
    badgeColor,
    savingsRate: rate,
    budgetExceededCount: budgetStatusData.exceededCount,
    debtRatio: netWorthData.debtToAssetRatio,
    liquidCash: netWorthData.liquidCash
  };
}

/**
 * 16. Smart Automated Insights Engine
 */
async function generateSmartInsights(userId) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [thisMonthExpense, lastMonthExpense, categoryBreakdown, budgetStatus, recurring, goals] = await Promise.all([
    getTotalExpenses(userId, thisMonthStart, thisMonthEnd),
    getTotalExpenses(userId, lastMonthStart, lastMonthEnd),
    getExpenseByCategory(userId, thisMonthStart, thisMonthEnd),
    getBudgetStatus(userId, now.getMonth() + 1, now.getFullYear()),
    getRecurringPayments(userId),
    getFinancialGoals(userId)
  ]);

  const insights = [];

  // Insight 1: Month-on-Month Expense Trend
  if (lastMonthExpense.totalExpenses > 0) {
    const diff = thisMonthExpense.totalExpenses - lastMonthExpense.totalExpenses;
    const pct = Math.abs(Number(((diff / lastMonthExpense.totalExpenses) * 100).toFixed(1)));
    if (diff > 0) {
      insights.push({
        type: 'warning',
        icon: 'trending-up',
        title: 'Spending Acceleration',
        message: `Your expenses are ${pct}% higher than last month at ₹${thisMonthExpense.totalExpenses.toLocaleString('en-IN')}. Consider auditing your discretionary spends.`
      });
    } else {
      insights.push({
        type: 'success',
        icon: 'trending-down',
        title: 'Disciplined Spending',
        message: `Great job! Your spending is ${pct}% lower than last month, helping you build a stronger cash reserve.`
      });
    }
  }

  // Insight 2: Top Expense Category Dominance
  if (categoryBreakdown.topCategory) {
    const top = categoryBreakdown.topCategory;
    if (top.percentage > 35) {
      insights.push({
        type: 'info',
        icon: 'pie-chart',
        title: `Heavy ${top.category} Concentration`,
        message: `${top.category} accounts for ${top.percentage}% of your spending this month (₹${top.amount.toLocaleString('en-IN')}).`
      });
    }
  }

  // Insight 3: Budget Overspending Warnings
  if (budgetStatus.exceededCategories && budgetStatus.exceededCategories.length > 0) {
    budgetStatus.exceededCategories.forEach(b => {
      insights.push({
        type: 'danger',
        icon: 'alert-triangle',
        title: `Budget Exceeded: ${b.category}`,
        message: `You spent ₹${b.spent.toLocaleString('en-IN')} against a budget of ₹${b.limit.toLocaleString('en-IN')} (${b.utilization}% utilized).`
      });
    });
  }

  // Insight 4: Upcoming Subscriptions & Bills
  if (recurring.dueSoonCount > 0) {
    insights.push({
      type: 'warning',
      icon: 'clock',
      title: 'Upcoming Financial Commitments',
      message: `You have ${recurring.dueSoonCount} bill(s) totaling ₹${recurring.dueSoon.reduce((acc, s) => acc + s.amount, 0).toLocaleString('en-IN')} due within the next 7 days.`
    });
  }

  // Insight 5: Savings Goal Progress
  const activeGoals = goals.goals.filter(g => !g.isCompleted);
  if (activeGoals.length > 0) {
    const closest = activeGoals[0];
    insights.push({
      type: 'info',
      icon: 'target',
      title: `Goal Tracking: ${closest.name}`,
      message: `You've achieved ${closest.progress}% of your ₹${closest.targetAmount.toLocaleString('en-IN')} target. Keep it up!`
    });
  }

  return insights;
}

module.exports = {
  getTotalIncome,
  getTotalExpenses,
  getSalaryHistory,
  getExpenseByCategory,
  getMonthlySavings,
  getBudgetStatus,
  getTransactionHistory,
  compareFinancialPeriods,
  getFinancialGoals,
  getRecurringPayments,
  getCashFlow,
  calculateSavingsRate,
  canAffordPurchase,
  getNetWorth,
  getFinancialHealthScore,
  generateSmartInsights
};
