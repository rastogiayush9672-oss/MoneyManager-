const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const financeEngine = require('../services/financeEngine');

// 1. Comprehensive Overview (Dashboard statistics)
router.get('/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const thisMonthStart = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const lastMonthStart = new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth() - 1, 1);
    const lastMonthEnd = new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth(), 0, 23, 59, 59, 999);

    const [
      thisIncome,
      thisExpense,
      lastIncome,
      lastExpense,
      categoryData,
      netWorthData,
      healthScore,
      insights
    ] = await Promise.all([
      financeEngine.getTotalIncome(req.user.id, thisMonthStart, thisMonthEnd),
      financeEngine.getTotalExpenses(req.user.id, thisMonthStart, thisMonthEnd),
      financeEngine.getTotalIncome(req.user.id, lastMonthStart, lastMonthEnd),
      financeEngine.getTotalExpenses(req.user.id, lastMonthStart, lastMonthEnd),
      financeEngine.getExpenseByCategory(req.user.id, thisMonthStart, thisMonthEnd),
      financeEngine.getNetWorth(req.user.id),
      financeEngine.getFinancialHealthScore(req.user.id),
      financeEngine.generateSmartInsights(req.user.id)
    ]);

    const totalIncome = thisIncome.totalIncome;
    const totalExpenses = thisExpense.totalExpenses;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Number(((netSavings / totalIncome) * 100).toFixed(1)) : 0;

    // Monthly growth vs last month
    const lastNetSavings = lastIncome.totalIncome - lastExpense.totalExpenses;
    const growthPercent = lastNetSavings !== 0 
      ? Number((((netSavings - lastNetSavings) / Math.abs(lastNetSavings)) * 100).toFixed(1)) 
      : 0;

    res.json({
      period: {
        startDate: thisMonthStart.toISOString(),
        endDate: thisMonthEnd.toISOString(),
        monthName: thisMonthStart.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      },
      totalBalance: netSavings,
      totalIncome,
      totalExpenses,
      monthlySavings: netSavings,
      savingsRate,
      netWorth: netWorthData.netWorth,
      cashFlow: netSavings,
      monthlyGrowthPercent: growthPercent,
      categoryExpenses: categoryData.categories,
      healthScore,
      insights,
      currencySymbol: '₹'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to compute financial overview' });
  }
});

// 2. Cash Flow Timeline
router.get('/cash-flow', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const cashFlow = await financeEngine.getCashFlow(req.user.id, startDate, endDate);
    res.json(cashFlow);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to retrieve cash flow' });
  }
});

// 3. Category Expenses Breakdown
router.get('/categories', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const categories = await financeEngine.getExpenseByCategory(req.user.id, startDate, endDate);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to retrieve category breakdown' });
  }
});

// 4. Smart Insights
router.get('/insights', auth, async (req, res) => {
  try {
    const insights = await financeEngine.generateSmartInsights(req.user.id);
    res.json(insights);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to generate insights' });
  }
});

// 5. Health Score
router.get('/health-score', auth, async (req, res) => {
  try {
    const score = await financeEngine.getFinancialHealthScore(req.user.id);
    res.json(score);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to compute health score' });
  }
});

// 6. Period Comparison
router.get('/compare', auth, async (req, res) => {
  try {
    const { p1Start, p1End, p2Start, p2End } = req.query;
    const now = new Date();
    const period1 = {
      startDate: p1Start || new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: p1End || new Date(now.getFullYear(), now.getMonth() + 1, 0)
    };
    const period2 = {
      startDate: p2Start || new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: p2End || new Date(now.getFullYear(), now.getMonth(), 0)
    };

    const comparison = await financeEngine.compareFinancialPeriods(req.user.id, period1, period2);
    res.json(comparison);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to compare periods' });
  }
});

module.exports = router;
