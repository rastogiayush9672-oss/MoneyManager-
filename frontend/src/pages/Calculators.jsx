import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Calculator,
  Briefcase,
  PiggyBank,
  PieChart,
  Users,
  TrendingUp,
  Percent,
  Landmark,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const Calculators = () => {
  const { currencySymbol } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('sip');

  // 1. SIP Calculator State
  const [sipMonthly, setSipMonthly] = useState(10000);
  const [sipReturn, setSipReturn] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  // 2. Loan EMI Calculator State
  const [loanAmount, setLoanAmount] = useState(2500000);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState(15);

  // 3. Salary In-Hand Calculator State
  const [ctcAmount, setCtcAmount] = useState(1500000);

  // 4. 50/30/20 Budget Calculator State
  const [monthlyInHand, setMonthlyInHand] = useState(100000);

  // 5. Compound Interest State
  const [ciPrincipal, setCiPrincipal] = useState(100000);
  const [ciRate, setCiRate] = useState(8);
  const [ciYears, setCiYears] = useState(5);

  // 6. Expense Split State
  const [splitBillAmount, setSplitBillAmount] = useState(4500);
  const [splitPeople, setSplitPeople] = useState(4);
  const [splitTip, setSplitTip] = useState(5);

  // 7. Income Tax Estimator State
  const [annualTaxableIncome, setAnnualTaxableIncome] = useState(1200000);

  // 8. Retirement Planning State
  const [currentAge, setCurrentAge] = useState(25);
  const [retireAge, setRetireAge] = useState(60);
  const [monthlyExpensesNow, setMonthlyExpensesNow] = useState(40000);
  const [inflationRate, setInflationRate] = useState(6);

  // 9. Emergency Fund State
  const [essentialExpense, setEssentialExpense] = useState(35000);
  const [emergencyMonths, setEmergencyMonths] = useState(6);

  // 10. Monthly Savings Target State
  const [goalTargetAmt, setGoalTargetAmt] = useState(500000);
  const [goalMonths, setGoalMonths] = useState(24);
  const [currentSavings, setCurrentSavings] = useState(50000);

  // --- Calculations ---

  // 1. SIP Calculation
  const totalMonths = sipYears * 12;
  const monthlyRate = sipReturn / 12 / 100;
  const sipInvested = sipMonthly * totalMonths;
  const sipMaturity = Math.round(
    sipMonthly * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
  );
  const sipWealthGain = Math.max(0, sipMaturity - sipInvested);

  // 2. Loan EMI Calculation
  const r = loanRate / 12 / 100;
  const n = loanTenureYears * 12;
  const emi = Math.round((loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  const totalLoanRepayment = emi * n;
  const totalLoanInterest = totalLoanRepayment - loanAmount;

  // 3. Salary In-Hand Calculation (approximate Indian structure)
  const basicSalaryAnnual = ctcAmount * 0.5;
  const annualPf = basicSalaryAnnual * 0.12;
  const standardDeduction = 75000;
  const taxableSalary = Math.max(0, ctcAmount - standardDeduction - annualPf);
  // Simple New Regime Tax slabs FY 2025-26
  let estTax = 0;
  if (taxableSalary > 1500000) estTax = 150000 + (taxableSalary - 1500000) * 0.3;
  else if (taxableSalary > 1200000) estTax = 90000 + (taxableSalary - 1200000) * 0.2;
  else if (taxableSalary > 1000000) estTax = 60000 + (taxableSalary - 1000000) * 0.15;
  else if (taxableSalary > 700000) estTax = 20000 + (taxableSalary - 700000) * 0.1;
  else if (taxableSalary > 300000) estTax = (taxableSalary - 300000) * 0.05;
  if (taxableSalary <= 700000) estTax = 0; // Rebate under 87A

  const annualNet = ctcAmount - annualPf - estTax - 2400; // PT 2400
  const monthlyInHandCalc = Math.round(annualNet / 12);

  // 4. 50/30/20 Rule
  const needs50 = Math.round(monthlyInHand * 0.5);
  const wants30 = Math.round(monthlyInHand * 0.3);
  const savings20 = Math.round(monthlyInHand * 0.2);

  // 5. Compound Interest
  const ciAmount = Math.round(ciPrincipal * Math.pow(1 + ciRate / 100, ciYears));
  const ciInterest = ciAmount - ciPrincipal;

  // 6. Split Bill
  const totalWithTip = splitBillAmount * (1 + splitTip / 100);
  const perPersonSplit = (totalWithTip / Math.max(1, splitPeople)).toFixed(2);

  // 7. Income Tax Comparison
  // Old regime estimation
  let oldTax = 0;
  if (annualTaxableIncome > 1000000) oldTax = 112500 + (annualTaxableIncome - 1000000) * 0.3;
  else if (annualTaxableIncome > 500000) oldTax = 12500 + (annualTaxableIncome - 500000) * 0.2;
  else if (annualTaxableIncome > 250000) oldTax = (annualTaxableIncome - 250000) * 0.05;

  // New regime estimation
  let newTax = 0;
  if (annualTaxableIncome > 1500000) newTax = 150000 + (annualTaxableIncome - 1500000) * 0.3;
  else if (annualTaxableIncome > 1200000) newTax = 90000 + (annualTaxableIncome - 1200000) * 0.2;
  else if (annualTaxableIncome > 1000000) newTax = 60000 + (annualTaxableIncome - 1000000) * 0.15;
  else if (annualTaxableIncome > 700000) newTax = 20000 + (annualTaxableIncome - 700000) * 0.1;
  else if (annualTaxableIncome > 300000) newTax = (annualTaxableIncome - 300000) * 0.05;
  if (annualTaxableIncome <= 700000) newTax = 0;

  // 8. Retirement Planning
  const yearsToRetire = Math.max(1, retireAge - currentAge);
  const monthlyExpenseAtRetire = Math.round(monthlyExpensesNow * Math.pow(1 + inflationRate / 100, yearsToRetire));
  const requiredRetirementCorpus = Math.round(monthlyExpenseAtRetire * 12 * 25); // 25x rule

  // 9. Emergency Fund
  const requiredEmergencyFund = essentialExpense * emergencyMonths;

  // 10. Goal Savings
  const neededSavings = Math.max(0, goalTargetAmt - currentSavings);
  const monthlySavingsNeeded = Math.round(neededSavings / Math.max(1, goalMonths));

  const tabs = [
    { id: 'sip', name: 'SIP Wealth', icon: TrendingUp },
    { id: 'emi', name: 'Loan EMI', icon: Landmark },
    { id: 'salary', name: 'Salary Take-Home', icon: Briefcase },
    { id: '503020', name: '50/30/20 Budget', icon: PieChart },
    { id: 'tax', name: 'Income Tax FY25-26', icon: Percent },
    { id: 'emergency', name: 'Emergency Fund', icon: ShieldCheck },
    { id: 'retirement', name: 'Retirement Corpus', icon: Clock },
    { id: 'ci', name: 'Compound Interest', icon: PiggyBank },
    { id: 'split', name: 'Split Bill', icon: Users },
    { id: 'target', name: 'Goal Planner', icon: Sparkles }
  ];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Financial Planning Calculators</h2>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          Interactive mathematical tools for investment compounding, loan debt, taxation, and retirement planning.
        </p>
      </div>

      {/* Tabs Bar */}
      <div
        className="d-flex gap-2 mb-4 p-2 rounded-3 overflow-auto"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-custom'}`}
              style={{
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: 'none',
                padding: '0.45rem 0.85rem'
              }}
            >
              <Icon size={15} /> {t.name}
            </button>
          );
        })}
      </div>

      {/* 1. SIP CALCULATOR */}
      {activeTab === 'sip' && (
        <div className="card p-4 shadow-sm">
          <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <TrendingUp size={22} className="text-success" /> SIP (Systematic Investment Plan) Calculator
          </h4>
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label d-flex justify-content-between">
                  <span>Monthly Investment</span>
                  <strong className="font-mono text-primary">{currencySymbol}{sipMonthly.toLocaleString('en-IN')}</strong>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="500"
                  max="100000"
                  step="500"
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Number(e.target.value))}
                />
              </div>

              <div className="mb-3">
                <label className="form-label d-flex justify-content-between">
                  <span>Expected Annual Return Rate (%)</span>
                  <strong className="font-mono text-primary">{sipReturn}%</strong>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="5"
                  max="25"
                  step="0.5"
                  value={sipReturn}
                  onChange={(e) => setSipReturn(Number(e.target.value))}
                />
              </div>

              <div className="mb-3">
                <label className="form-label d-flex justify-content-between">
                  <span>Time Horizon (Years)</span>
                  <strong className="font-mono text-primary">{sipYears} Years</strong>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="1"
                  max="35"
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-muted small d-block">EXPECTED MATURITY VALUE</span>
                <h1 className="fw-bold font-mono text-success my-2">
                  {currencySymbol}{sipMaturity.toLocaleString('en-IN')}
                </h1>
                <div className="row g-2 mt-3 pt-3 border-top text-center" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="col-6">
                    <small className="text-muted d-block">Total Invested</small>
                    <strong className="font-mono">{currencySymbol}{sipInvested.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Wealth Growth / Gain</small>
                    <strong className="font-mono text-success">+{currencySymbol}{sipWealthGain.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LOAN EMI CALCULATOR */}
      {activeTab === 'emi' && (
        <div className="card p-4 shadow-sm">
          <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Landmark size={22} className="text-primary" /> Loan EMI & Interest Amortization
          </h4>
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label d-flex justify-content-between">
                  <span>Loan Principal Amount</span>
                  <strong className="font-mono text-primary">{currencySymbol}{loanAmount.toLocaleString('en-IN')}</strong>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="100000"
                  max="10000000"
                  step="50000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                />
              </div>

              <div className="mb-3">
                <label className="form-label d-flex justify-content-between">
                  <span>Annual Interest Rate (%)</span>
                  <strong className="font-mono text-primary">{loanRate}%</strong>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="5"
                  max="20"
                  step="0.1"
                  value={loanRate}
                  onChange={(e) => setLoanRate(Number(e.target.value))}
                />
              </div>

              <div className="mb-3">
                <label className="form-label d-flex justify-content-between">
                  <span>Tenure (Years)</span>
                  <strong className="font-mono text-primary">{loanTenureYears} Years</strong>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="1"
                  max="30"
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-muted small d-block">MONTHLY EMI PAYMENT</span>
                <h1 className="fw-bold font-mono text-danger my-2">
                  {currencySymbol}{emi.toLocaleString('en-IN')}
                </h1>
                <div className="row g-2 mt-3 pt-3 border-top text-center" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="col-6">
                    <small className="text-muted d-block">Principal Amount</small>
                    <strong className="font-mono">{currencySymbol}{loanAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Total Interest Payable</small>
                    <strong className="font-mono text-danger">{currencySymbol}{totalLoanInterest.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SALARY TAKE-HOME CALCULATOR */}
      {activeTab === 'salary' && (
        <div className="card p-4 shadow-sm">
          <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Briefcase size={22} className="text-primary" /> CTC to In-Hand Salary Calculator (India)
          </h4>
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">Annual Cost to Company (CTC)</label>
                <div className="input-group">
                  <span className="input-group-text">{currencySymbol}</span>
                  <input
                    type="number"
                    className="form-control font-mono fs-5"
                    value={ctcAmount}
                    onChange={(e) => setCtcAmount(Number(e.target.value))}
                    step="50000"
                  />
                </div>
              </div>
              <p className="text-muted small">
                Calculates PF (12% of basic), standard deduction (₹75,000 under Budget 2024/2025), and estimated New Tax Regime slab deductions.
              </p>
            </div>

            <div className="col-lg-6">
              <div className="p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-muted small d-block">ESTIMATED MONTHLY IN-HAND</span>
                <h1 className="fw-bold font-mono text-success my-2">
                  {currencySymbol}{monthlyInHandCalc.toLocaleString('en-IN')}
                </h1>
                <small className="text-muted">Net Annual In-Hand: {currencySymbol}{(monthlyInHandCalc * 12).toLocaleString('en-IN')}</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 50/30/20 BUDGET CALCULATOR */}
      {activeTab === '503020' && (
        <div className="card p-4 shadow-sm">
          <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <PieChart size={22} className="text-primary" /> 50/30/20 Rule Budget Allocator
          </h4>
          <div className="row g-4">
            <div className="col-lg-5">
              <label className="form-label">Monthly Take-Home Income ({currencySymbol})</label>
              <input
                type="number"
                className="form-control font-mono fs-5 mb-3"
                value={monthlyInHand}
                onChange={(e) => setMonthlyInHand(Number(e.target.value))}
              />
              <p className="text-muted small">
                The classical financial principle: allocate 50% to essential survival needs, 30% to lifestyle desires, and 20% to savings and investment.
              </p>
            </div>

            <div className="col-lg-7">
              <div className="d-flex flex-column gap-3">
                <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--bg-surface)', borderLeft: '4px solid var(--color-primary)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-0">50% Essential Needs</h6>
                      <small className="text-muted">Rent, Groceries, Utilities, Healthcare, Transit</small>
                    </div>
                    <h4 className="fw-bold font-mono mb-0 text-primary">{currencySymbol}{needs50.toLocaleString('en-IN')}</h4>
                  </div>
                </div>

                <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--bg-surface)', borderLeft: '4px solid var(--color-warning)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-0">30% Discretionary Wants</h6>
                      <small className="text-muted">Dining out, Entertainment, Shopping, Gadgets</small>
                    </div>
                    <h4 className="fw-bold font-mono mb-0 text-warning">{currencySymbol}{wants30.toLocaleString('en-IN')}</h4>
                  </div>
                </div>

                <div className="p-3 rounded-3" style={{ backgroundColor: 'var(--bg-surface)', borderLeft: '4px solid var(--color-success)' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-0">20% Savings & Investments</h6>
                      <small className="text-muted">SIP Mutual Funds, Emergency Fund, Stocks, Gold</small>
                    </div>
                    <h4 className="fw-bold font-mono mb-0 text-success">{currencySymbol}{savings20.toLocaleString('en-IN')}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. INCOME TAX ESTIMATOR */}
      {activeTab === 'tax' && (
        <div className="card p-4 shadow-sm">
          <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Percent size={22} className="text-primary" /> Indian Income Tax Estimator (New vs Old Regime)
          </h4>
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <label className="form-label">Annual Taxable Income ({currencySymbol})</label>
              <input
                type="number"
                className="form-control font-mono fs-5 mb-3"
                value={annualTaxableIncome}
                onChange={(e) => setAnnualTaxableIncome(Number(e.target.value))}
                step="50000"
              />
              <p className="text-muted small">
                Compares standard New Tax Regime (Section 115BAC with ₹7 lakh rebate threshold) versus Old Regime slabs.
              </p>
            </div>

            <div className="col-lg-7">
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--bg-surface)', border: newTax <= oldTax ? '2px solid var(--color-success)' : 'none' }}>
                    <span className="badge-fintech success mb-2">New Tax Regime</span>
                    <h3 className="fw-bold font-mono mb-1">{currencySymbol}{Math.round(newTax).toLocaleString('en-IN')}</h3>
                    <small className="text-muted">Simplified Slabs</small>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--bg-surface)', border: oldTax < newTax ? '2px solid var(--color-success)' : 'none' }}>
                    <span className="badge-fintech neutral mb-2">Old Tax Regime</span>
                    <h3 className="fw-bold font-mono mb-1">{currencySymbol}{Math.round(oldTax).toLocaleString('en-IN')}</h3>
                    <small className="text-muted">With Deductions</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. EMERGENCY FUND CALCULATOR */}
      {activeTab === 'emergency' && (
        <div className="card p-4 shadow-sm">
          <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <ShieldCheck size={22} className="text-success" /> Emergency Fund Readiness Calculator
          </h4>
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label d-flex justify-content-between">
                  <span>Monthly Essential Survival Living Cost</span>
                  <strong className="font-mono text-primary">{currencySymbol}{essentialExpense.toLocaleString('en-IN')}</strong>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={essentialExpense}
                  onChange={(e) => setEssentialExpense(Number(e.target.value))}
                />
              </div>

              <div className="mb-3">
                <label className="form-label d-flex justify-content-between">
                  <span>Buffer Duration (Months)</span>
                  <strong className="font-mono text-primary">{emergencyMonths} Months</strong>
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="3"
                  max="12"
                  value={emergencyMonths}
                  onChange={(e) => setEmergencyMonths(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-muted small d-block">IDEAL LIQUID EMERGENCY BUFFER</span>
                <h1 className="fw-bold font-mono text-success my-2">
                  {currencySymbol}{requiredEmergencyFund.toLocaleString('en-IN')}
                </h1>
                <small className="text-muted">Keep this amount in High-Yield Savings Accounts or Liquid Mutual Funds.</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. RETIREMENT PLANNING CALCULATOR */}
      {activeTab === 'retirement' && (
        <div className="card p-4 shadow-sm">
          <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Clock size={22} className="text-primary" /> Retirement Corpus Calculator
          </h4>
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">Current Age</label>
                  <input type="number" className="form-control" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))} />
                </div>
                <div className="col-6">
                  <label className="form-label">Retirement Age</label>
                  <input type="number" className="form-control" value={retireAge} onChange={(e) => setRetireAge(Number(e.target.value))} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Current Monthly Living Cost ({currencySymbol})</label>
                <input type="number" className="form-control" value={monthlyExpensesNow} onChange={(e) => setMonthlyExpensesNow(Number(e.target.value))} />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-muted small d-block">PROJECTED TARGET CORPUS AT AGE {retireAge}</span>
                <h1 className="fw-bold font-mono text-primary my-2">
                  {currencySymbol}{requiredRetirementCorpus.toLocaleString('en-IN')}
                </h1>
                <small className="text-muted">Adjusted for {inflationRate}% inflation (₹{monthlyExpenseAtRetire.toLocaleString('en-IN')}/month at retirement)</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. COMPOUND INTEREST CALCULATOR */}
      {activeTab === 'ci' && (
        <div className="card p-4 shadow-sm">
          <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <PiggyBank size={22} className="text-primary" /> Compound Interest Growth Calculator
          </h4>
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">Initial Principal ({currencySymbol})</label>
                <input type="number" className="form-control" value={ciPrincipal} onChange={(e) => setCiPrincipal(Number(e.target.value))} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">Annual Interest Rate (%)</label>
                  <input type="number" className="form-control" value={ciRate} onChange={(e) => setCiRate(Number(e.target.value))} />
                </div>
                <div className="col-6">
                  <label className="form-label">Years of Compounding</label>
                  <input type="number" className="form-control" value={ciYears} onChange={(e) => setCiYears(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-muted small d-block">FINAL ACCUMULATED CAPITAL</span>
                <h1 className="fw-bold font-mono text-success my-2">
                  {currencySymbol}{ciAmount.toLocaleString('en-IN')}
                </h1>
                <small className="text-muted">Total Interest Accrued: +{currencySymbol}{ciInterest.toLocaleString('en-IN')}</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. EXPENSE / BILL SPLIT CALCULATOR */}
      {activeTab === 'split' && (
        <div className="card p-4 shadow-sm">
          <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Users size={22} className="text-primary" /> Bill Split & Dining Share Calculator
          </h4>
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">Total Bill Amount ({currencySymbol})</label>
                <input type="number" className="form-control" value={splitBillAmount} onChange={(e) => setSplitBillAmount(Number(e.target.value))} />
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label">Number of People</label>
                  <input type="number" min="1" className="form-control" value={splitPeople} onChange={(e) => setSplitPeople(Number(e.target.value))} />
                </div>
                <div className="col-6">
                  <label className="form-label">Tip / Service Charge (%)</label>
                  <input type="number" className="form-control" value={splitTip} onChange={(e) => setSplitTip(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-muted small d-block">EACH PERSON PAYS</span>
                <h1 className="fw-bold font-mono text-primary my-2">
                  {currencySymbol}{perPersonSplit}
                </h1>
                <small className="text-muted">Total bill including tip: {currencySymbol}{totalWithTip.toFixed(2)}</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. GOAL SAVINGS PLANNER */}
      {activeTab === 'target' && (
        <div className="card p-4 shadow-sm">
          <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Sparkles size={22} className="text-primary" /> Goal Contribution Planner
          </h4>
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="mb-3">
                <label className="form-label">Target Milestone Amount ({currencySymbol})</label>
                <input type="number" className="form-control" value={goalTargetAmt} onChange={(e) => setGoalTargetAmt(Number(e.target.value))} />
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label">Months to Achieve</label>
                  <input type="number" min="1" className="form-control" value={goalMonths} onChange={(e) => setGoalMonths(Number(e.target.value))} />
                </div>
                <div className="col-6">
                  <label className="form-label">Already Saved</label>
                  <input type="number" className="form-control" value={currentSavings} onChange={(e) => setCurrentSavings(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 rounded-4 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <span className="text-muted small d-block">MONTHLY SAVINGS REQUIRED</span>
                <h1 className="fw-bold font-mono text-success my-2">
                  {currencySymbol}{monthlySavingsNeeded.toLocaleString('en-IN')}/mo
                </h1>
                <small className="text-muted">Total remaining to save: {currencySymbol}{neededSavings.toLocaleString('en-IN')}</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculators;
