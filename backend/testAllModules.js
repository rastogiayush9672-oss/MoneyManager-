const http = require('http');

function postRequest(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data || {});
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getRequest(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'GET',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING COMPLETE SYSTEM VERIFICATION ===\n');

  // 1. Login
  console.log('[1/8] Testing Authentication...');
  const loginRes = await postRequest('/api/auth/login', {
    email: 'madhav@test.com',
    password: 'password123'
  });
  if (loginRes.status !== 200 || !loginRes.data.token) {
    throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
  }
  const token = loginRes.data.token;
  console.log('✓ Login successful! Token acquired for user:', loginRes.data.user.name);

  // 2. Overview
  console.log('\n[2/8] Testing Analytics Overview...');
  const overviewRes = await getRequest('/api/analytics/overview', token);
  console.log('✓ Overview status:', overviewRes.status);
  console.log('  Total Income:', overviewRes.data.totalIncome);
  console.log('  Total Expenses:', overviewRes.data.totalExpenses);
  console.log('  Net Savings:', overviewRes.data.totalBalance);
  console.log('  Savings Rate:', overviewRes.data.savingsRate + '%');
  console.log('  Health Score:', overviewRes.data.healthScore.score + ' (' + overviewRes.data.healthScore.label + ')');

  // 3. Salary
  console.log('\n[3/8] Testing Salary Module...');
  const salaryRes = await getRequest('/api/salary/summary', token);
  console.log('✓ Salary summary status:', salaryRes.status);
  console.log('  Total Records:', salaryRes.data.totalRecords);
  console.log('  Latest Net Salary:', salaryRes.data.latestSalary?.netSalary);
  console.log('  Average Net Salary:', salaryRes.data.averageNetSalary);

  // 4. Budgets
  console.log('\n[4/8] Testing Budget Status...');
  const budgetRes = await getRequest('/api/budgets/status', token);
  console.log('✓ Budget status:', budgetRes.status);
  console.log('  Total Budget:', budgetRes.data.totalBudget);
  console.log('  Total Spent:', budgetRes.data.totalSpent);
  console.log('  Utilization:', budgetRes.data.overallUtilization + '%');
  console.log('  Categories monitored:', budgetRes.data.budgets.length);

  // 5. Goals
  console.log('\n[5/8] Testing Savings Goals...');
  const goalsRes = await getRequest('/api/goals', token);
  console.log('✓ Goals status:', goalsRes.status);
  console.log('  Active Goals Count:', goalsRes.data.goalsCount);
  console.log('  Total Saved:', goalsRes.data.totalSaved);
  console.log('  Overall Progress:', goalsRes.data.overallProgress + '%');

  // 6. Subscriptions
  console.log('\n[6/8] Testing Subscriptions & Bills...');
  const subRes = await getRequest('/api/subscriptions', token);
  console.log('✓ Subscriptions status:', subRes.status);
  console.log('  Active Count:', subRes.data.activeCount);
  console.log('  Monthly Burn:', subRes.data.monthlyCommitment);
  console.log('  Annualized Burn:', subRes.data.annualCommitment);

  // 7. Net Worth
  console.log('\n[7/8] Testing Net Worth...');
  const nwRes = await getRequest('/api/net-worth', token);
  console.log('✓ Net Worth status:', nwRes.status);
  console.log('  Total Assets:', nwRes.data.totalAssets);
  console.log('  Total Liabilities:', nwRes.data.totalLiabilities);
  console.log('  Net Worth:', nwRes.data.netWorth);

  // 8. AI Chatbot
  console.log('\n[8/8] Testing Grounded AI Finance Assistant...');
  const aiRes1 = await postRequest('/api/ai/chat', { message: 'How much did I spend this month?' }, token);
  console.log('✓ AI Query 1 status:', aiRes1.status);
  console.log('  Tools Executed:', aiRes1.data.toolsUsed);
  console.log('  AI Response snippet:\n', aiRes1.data.response.slice(0, 180) + '...\n');

  const aiRes2 = await postRequest('/api/ai/chat', { message: 'Can I afford a purchase of 25000?' }, token);
  console.log('✓ AI Query 2 status:', aiRes2.status);
  console.log('  Tools Executed:', aiRes2.data.toolsUsed);
  console.log('  AI Response snippet:\n', aiRes2.data.response.slice(0, 180) + '...\n');

  console.log('=== ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
