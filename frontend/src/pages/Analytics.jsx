import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
  ArrowRight,
  Download
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const Analytics = () => {
  const { user, currencySymbol } = useContext(AuthContext);
  const { isDark } = useTheme();

  const [timeRange, setTimeRange] = useState('30'); // '7', '30', '90', '180', '365'
  const [cashFlow, setCashFlow] = useState(null);
  const [categories, setCategories] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const headers = { Authorization: `Bearer ${token}` };

      const days = Number(timeRange);
      const end = new Date();
      const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

      const [cfRes, catRes, compRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/analytics/cash-flow?startDate=${start.toISOString()}&endDate=${end.toISOString()}`, { headers }),
        axios.get(`http://localhost:5000/api/analytics/categories?startDate=${start.toISOString()}&endDate=${end.toISOString()}`, { headers }),
        axios.get('http://localhost:5000/api/analytics/compare', { headers })
      ]);

      setCashFlow(cfRes.data);
      setCategories(catRes.data.categories || []);
      setComparison(compRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // Cash Flow Bar Chart (Income vs Expense)
  const cfLabels = cashFlow?.timeline?.map(t => t.date.slice(-5)) || ['W1', 'W2', 'W3', 'W4'];
  const cfIncomes = cashFlow?.timeline?.map(t => t.income) || [25000, 30000, 20000, 118800];
  const cfExpenses = cashFlow?.timeline?.map(t => t.expense) || [12000, 15000, 8000, 35000];

  const barData = {
    labels: cfLabels,
    datasets: [
      {
        label: 'Income Received',
        data: cfIncomes,
        backgroundColor: '#10b981',
        borderRadius: 6
      },
      {
        label: 'Expenses Logged',
        data: cfExpenses,
        backgroundColor: '#ef4444',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'Plus Jakarta Sans', weight: 600 } }
      },
      tooltip: {
        callbacks: {
          label: (c) => ` ${c.dataset.label}: ${currencySymbol}${Number(c.raw).toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b' }
      },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)' },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          callback: (val) => `${currencySymbol}${val.toLocaleString('en-IN')}`
        }
      }
    }
  };

  const catColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
  const donutData = {
    labels: categories.map(c => c.category),
    datasets: [
      {
        data: categories.map(c => c.amount),
        backgroundColor: catColors.slice(0, categories.length),
        borderWidth: 2,
        borderColor: isDark ? '#0f1b38' : '#ffffff',
        cutout: '70%'
      }
    ]
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header with Time Filter */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Financial Analytics & Trends</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Multi-period comparisons, spending velocity, income vs expense trajectories.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="d-flex gap-1 p-1 rounded-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          {[
            { label: '7 Days', val: '7' },
            { label: '30 Days', val: '30' },
            { label: '90 Days', val: '90' },
            { label: '6 Months', val: '180' },
            { label: '1 Year', val: '365' }
          ].map(p => (
            <button
              key={p.val}
              onClick={() => setTimeRange(p.val)}
              className={`btn btn-sm ${timeRange === p.val ? 'btn-primary' : 'btn-outline-custom'}`}
              style={{ border: 'none', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Period Comparison Card */}
      {comparison && (
        <div className="card p-4 mb-4 shadow-sm" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Sparkles size={18} className="text-primary" /> Month-Over-Month Performance Audit
          </h5>
          <div className="row g-4 text-center text-md-start">
            <div className="col-md-4">
              <span className="form-label">This Month Net Cash Flow</span>
              <h3 className="fw-bold mb-1 font-mono text-success">
                +{currencySymbol}{comparison.period1.savings.toLocaleString('en-IN')}
              </h3>
              <small className="text-muted">{comparison.period1.range}</small>
            </div>

            <div className="col-md-4">
              <span className="form-label">Previous Month Net Cash Flow</span>
              <h3 className="fw-bold mb-1 font-mono">
                {currencySymbol}{comparison.period2.savings.toLocaleString('en-IN')}
              </h3>
              <small className="text-muted">{comparison.period2.range}</small>
            </div>

            <div className="col-md-4">
              <span className="form-label">Spending Delta</span>
              <div className="d-flex align-items-center gap-2">
                <h3 className={`fw-bold mb-1 font-mono ${comparison.changes.spendingIncreased ? 'text-danger' : 'text-success'}`}>
                  {comparison.changes.spendingIncreased ? '+' : ''}{comparison.changes.expensePercentChange}%
                </h3>
                {comparison.changes.spendingIncreased ? (
                  <TrendingUp size={20} className="text-danger" />
                ) : (
                  <TrendingDown size={20} className="text-success" />
                )}
              </div>
              <small className="text-muted">
                {comparison.changes.spendingIncreased ? 'Outflow expanded vs last month' : 'Outflow controlled successfully'}
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Row 2: Inflow vs Outflow Bar Chart */}
      <div className="card p-4 mb-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-0">Inflow vs Outflow Distribution</h5>
            <small className="text-muted">Total receipts versus logged disbursements across selected period</small>
          </div>
          <span className="badge-fintech info">{timeRange} Days Period</span>
        </div>
        <div style={{ height: '320px', width: '100%' }}>
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      {/* Row 3: Category Donut & Breakdown Table */}
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card p-4 h-100 shadow-sm">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <PieIcon size={18} className="text-primary" /> Category Spending Ratio
            </h5>
            <div style={{ height: '220px', position: 'relative', marginBottom: '1.5rem' }}>
              <Doughnut data={donutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>

            <div className="d-flex flex-column gap-2">
              {categories.slice(0, 5).map((c, i) => (
                <div key={i} className="d-flex justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: catColors[i % catColors.length] }} />
                    <span>{c.category}</span>
                  </div>
                  <span><strong>{c.percentage}%</strong> ({currencySymbol}{c.amount.toLocaleString('en-IN')})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card p-4 h-100 shadow-sm overflow-hidden">
            <h5 className="fw-bold mb-3">Category Spending Deep-Dive</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="text-center">Transaction Count</th>
                    <th className="text-end">Highest Single</th>
                    <th className="text-end">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold">{c.category}</td>
                      <td className="text-center font-mono">{c.count}</td>
                      <td className="text-end font-mono text-muted">{currencySymbol}{c.highest.toLocaleString('en-IN')}</td>
                      <td className="text-end font-mono fw-bold">{currencySymbol}{c.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
