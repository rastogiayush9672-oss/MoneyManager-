const financeEngine = require('./financeEngine');
const ChatMessage = require('../models/ChatMessage');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Parses user input for dates, months, and financial intents.
 */
function analyzeFinancialQuery(query) {
  const lower = query.toLowerCase();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Month detection
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  let detectedMonth = null;
  months.forEach((m, idx) => {
    if (lower.includes(m)) {
      detectedMonth = idx + 1;
    }
  });

  // Relative period detection
  let startDate = null;
  let endDate = null;
  let periodLabel = 'this month';

  if (lower.includes('last month') || lower.includes('previous month')) {
    const prevMonthDate = new Date(currentYear, currentMonth - 2, 1);
    startDate = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
    endDate = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);
    periodLabel = startDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  } else if (lower.includes('this year') || lower.includes('yearly')) {
    startDate = new Date(currentYear, 0, 1);
    endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    periodLabel = `Year ${currentYear}`;
  } else if (lower.includes('last 3 months') || lower.includes('past 3 months') || lower.includes('last three months')) {
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    endDate = now;
    periodLabel = 'the last 3 months';
  } else if (lower.includes('last 6 months') || lower.includes('past 6 months') || lower.includes('last six months')) {
    startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    endDate = now;
    periodLabel = 'the last 6 months';
  } else if (detectedMonth) {
    startDate = new Date(currentYear, detectedMonth - 1, 1);
    endDate = new Date(currentYear, detectedMonth, 0, 23, 59, 59, 999);
    periodLabel = months[detectedMonth - 1].charAt(0).toUpperCase() + months[detectedMonth - 1].slice(1);
  } else {
    // Default to this month
    startDate = new Date(currentYear, currentMonth - 1, 1);
    endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
    periodLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  // Categories detection
  const commonCategories = ['food', 'dining', 'groceries', 'transport', 'uber', 'rent', 'shopping', 'entertainment', 'utilities', 'bills', 'travel', 'health', 'medical', 'salary', 'investment'];
  let detectedCategory = null;
  for (const cat of commonCategories) {
    if (lower.includes(cat)) {
      detectedCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
      if (cat === 'dining' || cat === 'groceries') detectedCategory = 'Food';
      if (cat === 'uber') detectedCategory = 'Transport';
      break;
    }
  }

  // Amount extraction (e.g. ₹20,000 or 20000 or 20k)
  let extractedAmount = null;
  const amountMatch = query.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k)?/i);
  if (amountMatch) {
    let num = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (amountMatch[2] && amountMatch[2].toLowerCase() === 'k') num *= 1000;
    extractedAmount = num;
  }

  // Intent classification
  let intent = 'general_summary';

  if (lower.includes('salary') || lower.includes('paycheck') || lower.includes('ctc') || lower.includes('earnings from job')) {
    intent = 'salary_query';
  } else if (lower.includes('afford') || lower.includes('can i buy') || lower.includes('can i spend') || lower.includes('should i purchase')) {
    intent = 'affordability_check';
  } else if (lower.includes('compare') || lower.includes('vs last month') || lower.includes('versus last month') || lower.includes('difference between')) {
    intent = 'compare_periods';
  } else if (lower.includes('budget') || lower.includes('overspending') || lower.includes('exceeding')) {
    intent = 'budget_status';
  } else if (lower.includes('saving') || lower.includes('saved') || lower.includes('savings rate')) {
    intent = 'savings_query';
  } else if (lower.includes('cash flow') || lower.includes('net cash') || lower.includes('inflow')) {
    intent = 'cash_flow';
  } else if (lower.includes('goal') || lower.includes('emergency fund') || lower.includes('laptop') || lower.includes('vacation')) {
    intent = 'goals_query';
  } else if (lower.includes('bill') || lower.includes('subscription') || lower.includes('recurring') || lower.includes('due date')) {
    intent = 'recurring_query';
  } else if (lower.includes('top') && (lower.includes('expense') || lower.includes('spending'))) {
    intent = 'top_expenses';
  } else if (lower.includes('spend') || lower.includes('spent') || lower.includes('expense')) {
    intent = detectedCategory ? 'category_expense' : 'total_expense';
  } else if (lower.includes('income') || lower.includes('earned') || lower.includes('revenue')) {
    intent = 'total_income';
  } else if (lower.includes('net worth') || lower.includes('assets') || lower.includes('liabilities')) {
    intent = 'net_worth';
  } else if (lower.includes('reduce') || lower.includes('tip') || lower.includes('advice') || lower.includes('insight') || lower.includes('plan')) {
    intent = 'financial_advice';
  }

  return {
    intent,
    startDate,
    endDate,
    periodLabel,
    detectedCategory,
    extractedAmount
  };
}

/**
 * Executes grounded financial tools on authenticated user data based on intent.
 */
async function executeToolsForIntent(userId, analysis) {
  const { intent, startDate, endDate, detectedCategory, extractedAmount } = analysis;
  const toolsUsed = [];
  const toolResults = {};

  switch (intent) {
    case 'salary_query': {
      toolsUsed.push('getSalaryHistory');
      toolResults.salary = await financeEngine.getSalaryHistory(userId, 6);
      toolsUsed.push('getTotalIncome');
      toolResults.income = await financeEngine.getTotalIncome(userId, startDate, endDate);
      break;
    }
    case 'total_income': {
      toolsUsed.push('getTotalIncome');
      toolResults.income = await financeEngine.getTotalIncome(userId, startDate, endDate);
      break;
    }
    case 'category_expense': {
      toolsUsed.push('getExpenseByCategory');
      const cats = await financeEngine.getExpenseByCategory(userId, startDate, endDate);
      toolResults.categories = cats;
      const matched = cats.categories.find(c => c.category.toLowerCase() === (detectedCategory || '').toLowerCase());
      toolResults.matchedCategory = matched || null;
      toolsUsed.push('getBudgetStatus');
      toolResults.budget = await financeEngine.getBudgetStatus(userId);
      break;
    }
    case 'total_expense':
    case 'top_expenses': {
      toolsUsed.push('getTotalExpenses');
      toolResults.expenses = await financeEngine.getTotalExpenses(userId, startDate, endDate);
      toolsUsed.push('getExpenseByCategory');
      toolResults.categories = await financeEngine.getExpenseByCategory(userId, startDate, endDate);
      break;
    }
    case 'savings_query': {
      toolsUsed.push('calculateSavingsRate');
      toolResults.savingsRate = await financeEngine.calculateSavingsRate(userId, startDate, endDate);
      toolsUsed.push('getFinancialGoals');
      toolResults.goals = await financeEngine.getFinancialGoals(userId);
      break;
    }
    case 'budget_status': {
      toolsUsed.push('getBudgetStatus');
      toolResults.budget = await financeEngine.getBudgetStatus(userId);
      break;
    }
    case 'compare_periods': {
      toolsUsed.push('compareFinancialPeriods');
      const now = new Date();
      const thisMonth = {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      };
      const lastMonth = {
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      };
      toolResults.comparison = await financeEngine.compareFinancialPeriods(userId, thisMonth, lastMonth);
      toolsUsed.push('getExpenseByCategory');
      toolResults.thisMonthCategories = await financeEngine.getExpenseByCategory(userId, thisMonth.startDate, thisMonth.endDate);
      toolResults.lastMonthCategories = await financeEngine.getExpenseByCategory(userId, lastMonth.startDate, lastMonth.endDate);
      break;
    }
    case 'affordability_check': {
      toolsUsed.push('canAffordPurchase');
      toolResults.affordability = await financeEngine.canAffordPurchase(userId, extractedAmount || 10000, detectedCategory || 'General');
      break;
    }
    case 'cash_flow': {
      toolsUsed.push('getCashFlow');
      toolResults.cashFlow = await financeEngine.getCashFlow(userId, startDate, endDate);
      break;
    }
    case 'goals_query': {
      toolsUsed.push('getFinancialGoals');
      toolResults.goals = await financeEngine.getFinancialGoals(userId);
      break;
    }
    case 'recurring_query': {
      toolsUsed.push('getRecurringPayments');
      toolResults.recurring = await financeEngine.getRecurringPayments(userId);
      break;
    }
    case 'net_worth': {
      toolsUsed.push('getNetWorth');
      toolResults.netWorth = await financeEngine.getNetWorth(userId);
      break;
    }
    default: {
      toolsUsed.push('getTotalIncome', 'getTotalExpenses', 'getFinancialHealthScore', 'generateSmartInsights');
      const [income, expenses, health, insights] = await Promise.all([
        financeEngine.getTotalIncome(userId, startDate, endDate),
        financeEngine.getTotalExpenses(userId, startDate, endDate),
        financeEngine.getFinancialHealthScore(userId),
        financeEngine.generateSmartInsights(userId)
      ]);
      toolResults.income = income;
      toolResults.expenses = expenses;
      toolResults.health = health;
      toolResults.insights = insights;
      break;
    }
  }

  return { toolsUsed, toolResults };
}

/**
 * Formats a verified, rich, professional response directly from database facts.
 */
function buildVerifiedResponse(analysis, toolsResult) {
  const { intent, periodLabel, detectedCategory, extractedAmount } = analysis;
  const { toolResults } = toolsResult;

  switch (intent) {
    case 'salary_query': {
      const s = toolResults.salary;
      if (s.records.length === 0) {
        return `I checked your salary records, but no official salary entries have been logged yet. You can add your latest employer payslip in the **Salary Management** section.\n\nHowever, in total registered income for ${periodLabel}, you have received **${toolResults.income.formatted}** across ${toolResults.income.transactionCount} transactions.`;
      }
      const latest = s.latestSalary;
      const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      let msg = `### 💼 Salary Overview\n\n`;
      msg += `Your most recent recorded salary was **₹${latest.netSalary.toLocaleString('en-IN')}** for **${monthNames[latest.month]} ${latest.year}** from **${latest.employer}**.\n\n`;
      msg += `**Breakdown:**\n`;
      msg += `- **Gross Earnings:** ₹${latest.grossSalary.toLocaleString('en-IN')} (Basic: ₹${latest.basicSalary.toLocaleString('en-IN')}, HRA: ₹${latest.hra.toLocaleString('en-IN')}, Allowances: ₹${latest.specialAllowance.toLocaleString('en-IN')})\n`;
      msg += `- **Deductions:** ₹${latest.totalDeductions.toLocaleString('en-IN')} (PF: ₹${latest.pfDeduction.toLocaleString('en-IN')}, TDS/Tax: ₹${latest.taxDeduction.toLocaleString('en-IN')})\n`;
      msg += `- **Net Take-Home:** ₹${latest.netSalary.toLocaleString('en-IN')}\n\n`;
      if (s.records.length > 1) {
        msg += `Across your last ${s.count} recorded months, your average net monthly salary is **₹${s.averageNetSalary.toLocaleString('en-IN')}**.`;
      }
      return msg;
    }

    case 'total_income': {
      const inc = toolResults.income;
      if (inc.transactionCount === 0) {
        return `There are no recorded income transactions for **${periodLabel}**.`;
      }
      return `### 📈 Income Summary (${periodLabel})\n\n` +
        `Your total recorded income for **${periodLabel}** is **${inc.formatted}**, received across **${inc.transactionCount} transaction(s)**.\n\n` +
        `All calculations are strictly verified against your authenticated database records.`;
    }

    case 'category_expense': {
      const cat = toolResults.matchedCategory;
      const allCats = toolResults.categories;
      if (!cat) {
        return `You have **₹0 recorded expenses** in the **${detectedCategory}** category for **${periodLabel}**.\n\n` +
          `Your highest spending categories during this period were:\n` +
          allCats.categories.slice(0, 3).map(c => `- **${c.category}**: ${c.formatted} (${c.percentage}%)`).join('\n');
      }

      // Check if there's a budget for this category
      const targetBudget = toolResults.budget?.budgets?.find(
        b => b.category.toLowerCase() === detectedCategory.toLowerCase()
      );

      let msg = `### 🏷️ ${detectedCategory} Expenses (${periodLabel})\n\n`;
      msg += `Your total **${detectedCategory}** expenses for **${periodLabel}** are **${cat.formatted}**, based on **${cat.count} recorded transaction(s)**.\n\n`;
      msg += `- **Highest single expense:** ₹${cat.highest.toLocaleString('en-IN')}\n`;
      msg += `- **Share of monthly spending:** ${cat.percentage}%\n\n`;

      if (targetBudget) {
        msg += `**Budget Status:** You have allocated ₹${targetBudget.limit.toLocaleString('en-IN')} for ${detectedCategory}. You have spent **${targetBudget.utilization}%** of this budget. `;
        if (targetBudget.isExceeded) {
          msg += `⚠️ You are currently **over budget** by ₹${targetBudget.overspent.toLocaleString('en-IN')}!`;
        } else {
          msg += `Remaining budget: ₹${targetBudget.remaining.toLocaleString('en-IN')}.`;
        }
      }
      return msg;
    }

    case 'total_expense':
    case 'top_expenses': {
      const exp = toolResults.expenses;
      const cats = toolResults.categories;
      if (exp.transactionCount === 0) {
        return `You have no recorded expenses for **${periodLabel}**.`;
      }

      let msg = `### 💳 Expense Breakdown (${periodLabel})\n\n`;
      msg += `Your total expenses for **${periodLabel}** are **${exp.formatted}** across **${exp.transactionCount} recorded transaction(s)**.\n\n`;
      msg += `**Key Highlights:**\n`;
      msg += `- **Highest Single Expense:** ₹${exp.highestExpense.toLocaleString('en-IN')}\n`;
      msg += `- **Average per Transaction:** ₹${exp.averageExpense.toLocaleString('en-IN')}\n\n`;

      if (cats.categories.length > 0) {
        msg += `**Top Spending Categories:**\n`;
        cats.categories.slice(0, 5).forEach((c, idx) => {
          msg += `${idx + 1}. **${c.category}**: ${c.formatted} (${c.percentage}% of total)\n`;
        });
      }
      return msg;
    }

    case 'savings_query': {
      const s = toolResults.savingsRate;
      let msg = `### 💰 Savings & Health Assessment (${periodLabel})\n\n`;
      msg += `- **Total Inflow:** ₹${s.income.toLocaleString('en-IN')}\n`;
      msg += `- **Total Outflow:** ₹${s.expense.toLocaleString('en-IN')}\n`;
      msg += `- **Net Savings:** ₹${s.netSavings.toLocaleString('en-IN')}\n`;
      msg += `- **Current Savings Rate:** **${s.savingsRate}%** (${s.rating})\n\n`;

      msg += `**50/30/20 Benchmark Comparison:**\n`;
      msg += `- Essential Needs (50% guideline): Target ₹${s.rule503020.needs.toLocaleString('en-IN')}\n`;
      msg += `- Discretionary Wants (30% guideline): Target ₹${s.rule503020.wants.toLocaleString('en-IN')}\n`;
      msg += `- Savings & Investments (20% guideline): Target ₹${s.rule503020.savingsTarget.toLocaleString('en-IN')}\n\n`;

      if (s.savingsRate >= 20) {
        msg += `🎉 You are currently meeting and beating the standard 20% savings rule!`;
      } else {
        msg += `💡 Aim to cut 5-10% from non-essential spending to reach a 20%+ savings buffer.`;
      }
      return msg;
    }

    case 'budget_status': {
      const b = toolResults.budget;
      if (!b.budgets || b.budgets.length === 0) {
        return `You have not set any active budget limits for **${b.monthName} ${b.year}**. Navigate to the **Budgets** section to set monthly category targets!`;
      }

      let msg = `### 🎯 Budget Status (${b.monthName} ${b.year})\n\n`;
      msg += `Overall Budget: **₹${b.totalSpent.toLocaleString('en-IN')}** spent of **₹${b.totalBudget.toLocaleString('en-IN')}** (${b.overallUtilization}% utilized).\n\n`;

      if (b.exceededCount > 0) {
        msg += `⚠️ **${b.exceededCount} Category Alert(s):**\n`;
        b.exceededCategories.forEach(item => {
          msg += `- **${item.category}**: Spent ₹${item.spent.toLocaleString('en-IN')} / Limit ₹${item.limit.toLocaleString('en-IN')} (**${item.utilization}%**)\n`;
        });
        msg += `\n`;
      }

      msg += `**Category Utilization:**\n`;
      b.budgets.forEach(item => {
        const icon = item.isExceeded ? '🔴' : item.isNearLimit ? '🟡' : '🟢';
        msg += `${icon} **${item.category}**: ₹${item.spent.toLocaleString('en-IN')} / ₹${item.limit.toLocaleString('en-IN')} (${item.utilization}%)\n`;
      });
      return msg;
    }

    case 'compare_periods': {
      const c = toolResults.comparison;
      const changes = c.changes;
      let msg = `### 📊 Month-over-Month Comparison\n\n`;
      msg += `| Metric | This Month | Last Month | Change |\n`;
      msg += `| :--- | :--- | :--- | :--- |\n`;
      msg += `| **Income** | ₹${c.period1.income.toLocaleString('en-IN')} | ₹${c.period2.income.toLocaleString('en-IN')} | ${changes.incomeChange >= 0 ? '+' : ''}₹${changes.incomeChange.toLocaleString('en-IN')} (${changes.incomePercentChange}%) |\n`;
      msg += `| **Expenses** | ₹${c.period1.expenses.toLocaleString('en-IN')} | ₹${c.period2.expenses.toLocaleString('en-IN')} | ${changes.expenseChange >= 0 ? '+' : ''}₹${changes.expenseChange.toLocaleString('en-IN')} (${changes.expensePercentChange}%) |\n`;
      msg += `| **Net Savings** | ₹${c.period1.savings.toLocaleString('en-IN')} | ₹${c.period2.savings.toLocaleString('en-IN')} | ${changes.savingsChange >= 0 ? '+' : ''}₹${changes.savingsChange.toLocaleString('en-IN')} |\n\n`;

      if (changes.spendingIncreased) {
        msg += `⚠️ Your expenses increased by **${changes.expensePercentChange}%** this month compared with the previous month.`;
      } else {
        msg += `✅ Your expenses decreased by **${Math.abs(changes.expensePercentChange)}%** compared to last month!`;
      }
      return msg;
    }

    case 'affordability_check': {
      const a = toolResults.affordability;
      let msg = `### 🧐 Purchase Feasibility Analysis (₹${a.itemCost.toLocaleString('en-IN')})\n\n`;
      msg += `**Verdict:** ${a.isAffordable ? '✅ Affordable' : '⚠️ Financial Strain'}\n\n`;
      msg += `**Financial Context:**\n`;
      msg += `- **Current Month Cash Surplus:** ₹${a.currentMonthNetSavings.toLocaleString('en-IN')}\n`;
      msg += `- **Surplus After Purchase:** ₹${a.remainingAfterPurchase.toLocaleString('en-IN')}\n`;
      msg += `- **Available Liquid Reserves:** ₹${a.liquidCash.toLocaleString('en-IN')}\n\n`;

      if (a.budgetImpact) {
        msg += `**Budget Impact (${a.budgetImpact.category}):**\n`;
        msg += `Adding this expense would bring ${a.budgetImpact.category} spending to ₹${(a.budgetImpact.currentSpent + a.itemCost).toLocaleString('en-IN')}, which is **${a.budgetImpact.newUtilization}%** of your allocated ₹${a.budgetImpact.limit.toLocaleString('en-IN')} budget.\n\n`;
      }

      msg += `**AI Recommendation:** ${a.recommendation}`;
      return msg;
    }

    case 'cash_flow': {
      const cf = toolResults.cashFlow;
      let msg = `### 🌊 Cash Flow Summary (${periodLabel})\n\n`;
      msg += `- **Total Inflow:** ₹${cf.totalIncome.toLocaleString('en-IN')}\n`;
      msg += `- **Total Outflow:** ₹${cf.totalExpense.toLocaleString('en-IN')}\n`;
      msg += `- **Net Cash Flow:** **${cf.netCashFlow >= 0 ? '+' : ''}₹${cf.netCashFlow.toLocaleString('en-IN')}**\n\n`;
      if (cf.timeline.length > 0) {
        msg += `Recent activity has been logged across ${cf.timeline.length} distinct period dates.`;
      }
      return msg;
    }

    case 'goals_query': {
      const g = toolResults.goals;
      if (g.goalsCount === 0) {
        return `You haven't set any financial savings goals yet! You can create goals like **Emergency Fund**, **New Laptop**, or **Vacation** in the **Savings Goals** module.`;
      }

      let msg = `### 🎯 Savings Goals Progress\n\n`;
      msg += `You have **${g.goalsCount} active goal(s)** totaling **₹${g.totalSaved.toLocaleString('en-IN')}** saved towards a total target of **₹${g.totalTarget.toLocaleString('en-IN')}** (${g.overallProgress}% achieved).\n\n`;
      g.goals.forEach(item => {
        const status = item.isCompleted ? '🏆 Completed' : `${item.progress}% (Needs ₹${item.neededMonthlyContribution.toLocaleString('en-IN')}/mo)`;
        msg += `- **${item.name}**: ₹${item.currentAmount.toLocaleString('en-IN')} / ₹${item.targetAmount.toLocaleString('en-IN')} — ${status}\n`;
      });
      return msg;
    }

    case 'recurring_query': {
      const r = toolResults.recurring;
      if (r.count === 0) {
        return `You have no active recurring subscriptions or bills logged. Track your Netflix, Rent, Electricity, and WiFi commitments in **Subscriptions & Bills**.`;
      }

      let msg = `### 🔁 Recurring Commitments & Bills\n\n`;
      msg += `- **Active Subscriptions/Bills:** ${r.activeCount}\n`;
      msg += `- **Monthly Commitment:** ₹${r.monthlyCommitment.toLocaleString('en-IN')}\n`;
      msg += `- **Annual Cost:** ₹${r.annualCommitment.toLocaleString('en-IN')}\n\n`;

      if (r.dueSoonCount > 0) {
        msg += `⏰ **Bills Due in the Next 7 Days:**\n`;
        r.dueSoon.forEach(s => {
          msg += `- **${s.name}**: ₹${s.amount.toLocaleString('en-IN')} (Due in ${s.daysUntilDue} day(s))\n`;
        });
      } else {
        msg += `✅ No immediate bills due in the next 7 days.`;
      }
      return msg;
    }

    case 'net_worth': {
      const nw = toolResults.netWorth;
      let msg = `### 💎 Net Worth Statement\n\n`;
      msg += `- **Total Assets:** ₹${nw.totalAssets.toLocaleString('en-IN')}\n`;
      msg += `- **Total Liabilities:** ₹${nw.totalLiabilities.toLocaleString('en-IN')}\n`;
      msg += `- **Net Worth:** **${nw.formattedNetWorth}**\n`;
      msg += `- **Debt-to-Asset Ratio:** ${nw.debtToAssetRatio}%\n\n`;

      if (Object.keys(nw.assetsByCategory).length > 0) {
        msg += `**Top Assets:**\n`;
        Object.entries(nw.assetsByCategory).slice(0, 4).forEach(([cat, val]) => {
          msg += `- ${cat}: ₹${val.toLocaleString('en-IN')}\n`;
        });
      }
      return msg;
    }

    default: {
      const inc = toolResults.income;
      const exp = toolResults.expenses;
      const h = toolResults.health;
      const savings = inc.totalIncome - exp.totalExpenses;

      let msg = `### 📊 Financial Overview (${periodLabel})\n\n`;
      msg += `Here is your current financial standing based on verified database records:\n\n`;
      msg += `- **Total Income:** ${inc.formatted}\n`;
      msg += `- **Total Expenses:** ${exp.formatted}\n`;
      msg += `- **Net Cash Flow:** ₹${savings.toLocaleString('en-IN')}\n`;
      msg += `- **Financial Health Score:** **${h.score}/100** (${h.label})\n\n`;

      if (toolResults.insights && toolResults.insights.length > 0) {
        msg += `**Key Insight:** ${toolResults.insights[0].message}\n\n`;
      }

      msg += `Feel free to ask me detailed questions like:\n`;
      msg += `- *"How much did I spend on Food this month?"*\n`;
      msg += `- *"What was my highest expense?"*\n`;
      msg += `- *"Show my salary history"*\n`;
      msg += `- *"Can I afford a purchase of ₹15,000?"*`;
      return msg;
    }
  }
}

/**
 * Main AI Assistant processor.
 * 1. Analyzes user query
 * 2. Invokes backend financial functions (database grounded)
 * 3. Uses Gemini if available, or verified deterministic engine
 * 4. Saves message history
 */
async function processUserMessage(userId, userMessage) {
  // 1. Analyze query
  const analysis = analyzeFinancialQuery(userMessage);

  // 2. Execute verified backend database tools
  const { toolsUsed, toolResults } = await executeToolsForIntent(userId, analysis);

  // 3. Generate response
  let finalResponse = '';

  // Check if GEMINI_API_KEY is available for LLM synthesis
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an elite, highly professional AI Personal Finance Advisor named Sikka AI for an Indian user.
CRITICAL ACCURACY RULES:
1. You must ONLY use the provided verified financial data below.
2. NEVER invent, hallucinate, or alter any numbers, currency amounts, or dates.
3. Currency is Indian Rupees (₹).
4. Explain calculations clearly and conversationally.
5. Highlight important numbers using bold or markdown formatting.

USER QUESTION: "${userMessage}"

VERIFIED FINANCIAL DATABASE RESULTS:
${JSON.stringify({ analysis, toolsUsed, toolResults }, null, 2)}

Provide a helpful, precise, and polite response answering the user's question directly based on these verified facts.`;

      const result = await model.generateContent(prompt);
      finalResponse = result.response.text();
    } catch (llmErr) {
      console.warn('Gemini API call failed, falling back to deterministic verified engine:', llmErr.message);
      finalResponse = buildVerifiedResponse(analysis, { toolsUsed, toolResults });
    }
  } else {
    // Deterministic verified engine (100% grounded and reliable without external API keys)
    finalResponse = buildVerifiedResponse(analysis, { toolsUsed, toolResults });
  }

  // 4. Save to ChatMessage collection
  await ChatMessage.create({
    user: userId,
    role: 'user',
    content: userMessage
  });

  await ChatMessage.create({
    user: userId,
    role: 'assistant',
    content: finalResponse,
    toolsUsed,
    dataSnapshot: { analysis, toolResults }
  });

  return {
    response: finalResponse,
    toolsUsed,
    analysis,
    dataSnapshot: toolResults
  };
}

module.exports = {
  analyzeFinancialQuery,
  processUserMessage
};
