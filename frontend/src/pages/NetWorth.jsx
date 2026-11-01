import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import {
  Scale,
  Plus,
  Landmark,
  TrendingUp,
  CreditCard,
  Building,
  DollarSign,
  PieChart as PieIcon,
  Trash2,
  Edit2,
  X,
  ShieldCheck
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const NetWorth = () => {
  const { user, currencySymbol } = useContext(AuthContext);
  const { isDark } = useTheme();

  const [netWorthData, setNetWorthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    type: 'asset',
    category: 'Cash & Bank Balance',
    name: '',
    value: '',
    institution: '',
    interestRate: '',
    notes: ''
  });

  const assetCategories = [
    'Cash & Bank Balance',
    'Fixed Deposits & RD',
    'Mutual Funds & SIP',
    'Stocks & Equity',
    'Provident Fund & PPF',
    'Real Estate & Property',
    'Gold & Precious Metals',
    'Cryptocurrency',
    'Other Assets'
  ];

  const liabilityCategories = [
    'Home Loan',
    'Personal Loan',
    'Education Loan',
    'Car / Vehicle Loan',
    'Credit Card Outstanding',
    'Other Liabilities'
  ];

  const fetchNetWorth = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const res = await axios.get('http://localhost:5000/api/net-worth', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNetWorthData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Net Worth data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetWorth();
  }, []);

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type,
      category: type === 'asset' ? assetCategories[0] : liabilityCategories[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Enter asset/liability name');
    if (!formData.value || Number(formData.value) <= 0) return toast.error('Enter valid valuation');

    try {
      const token = Cookies.get('token');
      await axios.post('http://localhost:5000/api/net-worth', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${formData.type === 'asset' ? 'Asset' : 'Liability'} recorded!`);
      setShowAddModal(false);
      setFormData({
        type: 'asset',
        category: 'Cash & Bank Balance',
        name: '',
        value: '',
        institution: '',
        interestRate: '',
        notes: ''
      });
      fetchNetWorth();
      window.dispatchEvent(new Event('finance_updated'));
    } catch (err) {
      toast.error('Failed to save record');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this asset/liability record?')) {
      try {
        const token = Cookies.get('token');
        await axios.delete(`http://localhost:5000/api/net-worth/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Record removed');
        fetchNetWorth();
        window.dispatchEvent(new Event('finance_updated'));
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  // Asset allocation donut
  const assetKeys = Object.keys(netWorthData?.assetsByCategory || {});
  const assetValues = Object.values(netWorthData?.assetsByCategory || {});
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#eab308'];

  const assetDonutData = {
    labels: assetKeys,
    datasets: [
      {
        data: assetValues,
        backgroundColor: colors.slice(0, assetKeys.length),
        borderWidth: 2,
        borderColor: isDark ? '#0f1b38' : '#ffffff',
        cutout: '70%'
      }
    ]
  };

  const assets = netWorthData?.records?.filter(r => r.type === 'asset') || [];
  const liabilities = netWorthData?.records?.filter(r => r.type === 'liability') || [];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Net Worth & Asset Tracking</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Consolidated statement of cash reserves, investments, retirement accounts, loans, and net wealth.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} /> Add Asset / Liability
        </button>
      </div>

      {/* Overview Cards */}
      <div className="row g-3 mb-4">
        {/* Net Worth */}
        <div className="col-md-4">
          <div className="card stat-card accent-violet h-100 shadow-sm p-4">
            <span className="form-label mb-1">Total Net Worth</span>
            <h1 className="fw-bold mb-1 font-mono" style={{ color: 'var(--color-accent)' }}>
              {currencySymbol}{netWorthData?.netWorth?.toLocaleString('en-IN') || 0}
            </h1>
            <small className="text-muted">Total Assets minus Total Liabilities</small>
          </div>
        </div>

        {/* Total Assets */}
        <div className="col-md-4">
          <div className="card stat-card accent-emerald h-100 shadow-sm p-4">
            <span className="form-label mb-1">Gross Assets Value</span>
            <h2 className="fw-bold mb-1 font-mono text-success">
              +{currencySymbol}{netWorthData?.totalAssets?.toLocaleString('en-IN') || 0}
            </h2>
            <small className="text-muted">Cash, Equity, Mutual Funds & Real Estate</small>
          </div>
        </div>

        {/* Total Liabilities */}
        <div className="col-md-4">
          <div className="card stat-card accent-red h-100 shadow-sm p-4">
            <span className="form-label mb-1">Outstanding Liabilities</span>
            <h2 className="fw-bold mb-1 font-mono text-danger">
              -{currencySymbol}{netWorthData?.totalLiabilities?.toLocaleString('en-IN') || 0}
            </h2>
            <small className="text-muted">Debt-to-Asset Ratio: {netWorthData?.debtToAssetRatio || 0}%</small>
          </div>
        </div>
      </div>

      {/* Row 2: Asset Allocation Chart & Categorized View */}
      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div className="card p-4 h-100 shadow-sm">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <PieIcon size={18} className="text-primary" /> Asset Allocation Portfolio
            </h5>
            {assetKeys.length === 0 ? (
              <div className="py-5 text-center text-muted">No asset classes recorded yet.</div>
            ) : (
              <div>
                <div style={{ height: '200px', position: 'relative', marginBottom: '1.25rem' }}>
                  <Doughnut data={assetDonutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Assets</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{currencySymbol}{netWorthData?.totalAssets?.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2">
                  {assetKeys.map((k, idx) => (
                    <div key={idx} className="d-flex justify-content-between small">
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors[idx % colors.length] }} />
                        <span>{k}</span>
                      </div>
                      <strong className="font-mono">{currencySymbol}{netWorthData.assetsByCategory[k]?.toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assets & Liabilities Ledger */}
        <div className="col-lg-7">
          <div className="card p-4 h-100 shadow-sm">
            {/* Assets section */}
            <h5 className="fw-bold text-success mb-3 d-flex align-items-center gap-2">
              <Landmark size={18} /> Assets ({assets.length})
            </h5>
            <div className="d-flex flex-column gap-2 mb-4">
              {assets.map(a => (
                <div key={a._id} className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <div>
                    <div className="fw-bold">{a.name}</div>
                    <small className="text-muted">{a.category} • {a.institution || 'Direct'}</small>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold font-mono text-success">
                      +{currencySymbol}{a.value?.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="btn btn-sm btn-outline-custom text-danger"
                      style={{ padding: '2px 6px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Liabilities section */}
            <h5 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
              <CreditCard size={18} /> Liabilities & Debt ({liabilities.length})
            </h5>
            <div className="d-flex flex-column gap-2">
              {liabilities.length === 0 ? (
                <div className="text-muted small py-2">No liabilities recorded. Debt-free!</div>
              ) : (
                liabilities.map(l => (
                  <div key={l._id} className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
                    <div>
                      <div className="fw-bold">{l.name}</div>
                      <small className="text-muted">{l.category} • {l.institution || 'Credit'}</small>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-bold font-mono text-danger">
                        -{currencySymbol}{l.value?.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => handleDelete(l._id)}
                        className="btn btn-sm btn-outline-custom text-danger"
                        style={{ padding: '2px 6px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card shadow-lg p-4"
            style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-modal)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold mb-0">Record Asset / Liability</h5>
              <button onClick={() => setShowAddModal(false)} className="btn btn-sm btn-outline-custom">
                <X size={18} />
              </button>
            </div>

            {/* Type selector */}
            <div className="d-flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleTypeChange('asset')}
                className={`btn flex-1 w-50 ${formData.type === 'asset' ? 'btn-primary' : 'btn-outline-custom'}`}
              >
                Asset (+)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('liability')}
                className={`btn flex-1 w-50 ${formData.type === 'liability' ? 'btn-primary bg-danger border-danger' : 'btn-outline-custom'}`}
              >
                Liability (-)
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Classification Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {(formData.type === 'asset' ? assetCategories : liabilityCategories).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Asset / Liability Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Zerodha FlexiCap SIP, HDFC Regalia Card"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">Valuation ({currencySymbol})</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="250000"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Institution / Bank</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. HDFC, SBI, Zerodha"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-bold mt-2">
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetWorth;
