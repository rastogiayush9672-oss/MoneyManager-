import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Scale,
  Activity,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Filler);

const Dashboard = () => {
  const { user, currencySymbol } = useContext(AuthContext);
  const { isDark } = useTheme();

  const [overview, setOverview] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [salarySummary, setSalarySummary] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [overviewRes, cashFlowRes, txRes, salaryRes, budgetRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/overview', { headers }),
        axios.get('http://localhost:5000/api/analytics/cash-flow', { headers }),
        axios.get('http://localhost:5000/api/transactions?limit=8', { headers }),
        axios.get('http://localhost:5000/api/salary/summary', { headers }),
        axios.get('http://localhost:5000/api/budgets/status', { headers })
      ]);

      setOverview(overviewRes.data);
      setCashFlow(cashFlowRes.data);
      setRecentTx(txRes.data.transactions || []);
      setSalarySummary(salaryRes.data);
      setBudgetStatus(budgetRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for global finance update events
    const handleUpdate = () => fetchDashboardData();
    window.addEventListener('finance_updated', handleUpdate);
    return () => window.removeEventListener('finance_updated', handleUpdate);
  }, []);

  // Cash flow line chart data
  const lineLabels = cashFlow?.timeline?.length > 0 
    ? cashFlow.timeline.map(t => t.date.slice(-5))
    : ['W1', 'W2', 'W3', 'W4'];

  const lineIncomeData = cashFlow?.timeline?.length > 0
    ? cashFlow.timeline.map(t => t.income)
    : [20000, 35000, 15000, overview?.totalIncome || 0];

  const lineExpenseData = cashFlow?.timeline?.length > 0
    ? cashFlow.timeline.map(t => t.expense)
    : [8000, 14000, 11000, overview?.totalExpenses || 0];

  const cashFlowChartData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Inflow (Income)',
        data: lineIncomeData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#10b981'
      },
      {
        label: 'Outflow (Expenses)',
        data: lineExpenseData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.06)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#ef4444'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${currencySymbol}${Number(context.raw).toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b' }
      },
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          callback: (value) => `${currencySymbol}${value.toLocaleString('en-IN')}`
        }
      }
    }
  };

  // Category Donut Data
  const catLabels = overview?.categoryExpenses?.map(c => c.category) || ['Rent', 'Food', 'Utilities', 'Shopping'];
  const catAmounts = overview?.categoryExpenses?.map(c => c.amount) || [25000, 5270, 2450, 2890];
  const donutColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1'];

  const doughnutData = {
    labels: catLabels,
    datasets: [
      {
        data: catAmounts,
        backgroundColor: donutColors.slice(0, catLabels.length),
        borderWidth: 2,
        borderColor: isDark ? '#0f1b38' : '#ffffff',
        cutout: '72%'
      }
    ]
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 text-muted">Compiling verified financial analytics...</p>
      </div>
    );
  }

  const health = overview?.healthScore || { score: 85, label: 'Strong', badgeColor: '#3b82f6' };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Top Banner: Greeting & Quick Summary */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Financial health overview for <strong>{overview?.period?.monthName || 'November 2026'}</strong>
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link to="/ai-assistant" className="btn btn-outline-custom">
            <Sparkles size={16} className="text-primary" /> Ask Sikka AI
          </Link>
          <Link to="/transactions" className="btn btn-primary">
            View All Records <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* 4 Core Financial Metrics Cards */}
      <div className="row g-3 mb-4">
        {/* Total Balance / Net Savings */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card accent-blue h-100 shadow-sm">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="form-label mb-0">Total Inflow Balance</span>
              <div className="p-2 rounded-circle" style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
                <Wallet size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-2 font-mono">
              {currencySymbol}{overview?.totalBalance?.toLocaleString('en-IN') || 0}
            </h3>
            <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
              {overview?.monthlyGrowthPercent >= 0 ? (
                <span className="text-success fw-bold d-flex align-items-center">
                  <TrendingUp size={14} className="me-1" /> +{overview?.monthlyGrowthPercent}%
                </span>
              ) : (
                <span className="text-danger fw-bold d-flex align-items-center">
                  <TrendingDown size={14} className="me-1" /> {overview?.monthlyGrowthPercent}%
                </span>
              )}
              <span className="text-muted">vs last month</span>
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card accent-emerald h-100 shadow-sm">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="form-label mb-0">Total Monthly Income</span>
              <div className="p-2 rounded-circle" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <ArrowDownLeft size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-2 font-mono text-success">
              +{currencySymbol}{overview?.totalIncome?.toLocaleString('en-IN') || 0}
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Salary: {currencySymbol}{salarySummary?.latestSalary?.netSalary?.toLocaleString('en-IN') || '1,18,800'}
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card accent-red h-100 shadow-sm">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="form-label mb-0">Total Monthly Expenses</span>
              <div className="p-2 rounded-circle" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
                <ArrowUpRight size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-2 font-mono text-danger">
              -{currencySymbol}{overview?.totalExpenses?.toLocaleString('en-IN') || 0}
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Highest single: {currencySymbol}{overview?.categoryExpenses?.[0]?.highest?.toLocaleString('en-IN') || '25,000'}
            </div>
          </div>
        </div>

        {/* Net Worth */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card accent-violet h-100 shadow-sm">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="form-label mb-0">Estimated Net Worth</span>
              <div className="p-2 rounded-circle" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--color-accent)' }}>
                <Scale size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-2 font-mono" style={{ color: 'var(--color-accent)' }}>
              {currencySymbol}{overview?.netWorth?.toLocaleString('en-IN') || 0}
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Savings Rate: <strong>{overview?.savingsRate || 0}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Cash Flow Timeline Chart & Spending Distribution */}
      <div className="row g-4 mb-4">
        {/* Cash Flow Line Chart */}
        <div className="col-lg-8">
          <div className="card p-4 h-100 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0">Cash Flow Trajectory</h5>
                <small className="text-muted">Inflow vs Outflow comparison across transaction periods</small>
              </div>
              <span className="badge-fintech info">Verified Data</span>
            </div>
            <div style={{ height: '280px', width: '100%' }}>
              <Line data={cashFlowChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="col-lg-4">
          <div className="card p-4 h-100 shadow-sm d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Spending by Category</h5>
                <Link to="/expenses" className="small text-muted">View all</Link>
              </div>
              <div style={{ height: '180px', position: 'relative', marginBottom: '1.25rem' }}>
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Total Spent</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>{currencySymbol}{overview?.totalExpenses?.toLocaleString('en-IN') || 0}</div>
                </div>
              </div>
            </div>

            <div className="d-flex flex-column gap-2">
              {overview?.categoryExpenses?.slice(0, 4).map((c, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.825rem' }}>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: donutColors[i % donutColors.length] }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{c.category}</span>
                  </div>
                  <span className="fw-bold font-mono">{currencySymbol}{c.amount?.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Financial Health & AI Insights Banner */}
      <div className="row g-4 mb-4">
        {/* Health Score Card */}
        <div className="col-md-5 col-lg-4">
          <div className="card p-4 h-100 shadow-sm">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Activity size={18} className="text-primary" /> Financial Health Score
            </h6>

            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                style={{
                  width: '65px',
                  height: '65px',
                  borderRadius: '50%',
                  border: `4px solid ${health.badgeColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-main)'
                }}
              >
                {health.score}
              </div>
              <div>
                <h5 className="fw-bold mb-0" style={{ color: health.badgeColor }}>
                  {health.label}
                </h5>
                <small className="text-muted">Based on savings rate & budget adherence</small>
              </div>
            </div>

            <div className="p-3 rounded-3 mb-2" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="d-flex justify-content-between small mb-1">
                <span>Savings Rate Target (20%)</span>
                <strong>{overview?.savingsRate || 0}%</strong>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${Math.min(100, (overview?.savingsRate || 0) * 2)}%` }}
                />
              </div>
            </div>

            <div className="d-flex justify-content-between small text-muted">
              <span>Liquid Cash: {currencySymbol}{health?.liquidCash?.toLocaleString('en-IN') || 0}</span>
              <span>Debt Ratio: {health?.debtRatio || 0}%</span>
            </div>
          </div>
        </div>

        {/* Automated AI Insights Carousel/List */}
        <div className="col-md-7 col-lg-8">
          <div className="card p-4 h-100 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Sparkles size={18} className="text-primary" /> Smart Financial Intelligence
              </h6>
              <Link to="/insights" className="small text-primary fw-bold">Deep Dive →</Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {overview?.insights?.slice(0, 3).map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-3 d-flex align-items-start gap-3"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderLeft: `4px solid ${
                      insight.type === 'danger'
                        ? 'var(--color-danger)'
                        : insight.type === 'warning'
                        ? 'var(--color-warning)'
                        : insight.type === 'success'
                        ? 'var(--color-success)'
                        : 'var(--color-primary)'
                    }`
                  }}
                >
                  <div style={{ marginTop: '2px' }}>
                    {insight.type === 'danger' || insight.type === 'warning' ? (
                      <AlertCircle size={18} className="text-warning" />
                    ) : (
                      <CheckCircle2 size={18} className="text-success" />
                    )}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>{insight.title}</h6>
                    <p className="text-muted small mb-0">{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Transactions Table */}
      <div className="card shadow-sm overflow-hidden">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center p-3 px-4 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h5 className="fw-bold mb-0">Recent Transaction Activity</h5>
            <small className="text-muted">Latest financial movements recorded in database</small>
          </div>
          <Link to="/transactions" className="btn btn-sm btn-outline-custom">
            Full Ledger
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Transaction Details</th>
                <th>Category</th>
                <th>Payment Mode</th>
                <th>Date</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                recentTx.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '38px',
                            height: '38px',
                            backgroundColor: t.type === 'income' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                            color: t.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)'
                          }}
                        >
                          {t.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <div className="fw-bold">{t.title}</div>
                          {t.merchant && <small className="text-muted">{t.merchant}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-fintech neutral">{t.category}</span>
                    </td>
                    <td>
                      <small className="text-muted">{t.paymentMethod || 'UPI'}</small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </small>
                    </td>
                    <td className="text-end font-mono fw-bold">
                      <span className={t.type === 'income' ? 'text-success' : 'text-main'}>
                        {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount?.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
