import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  TrendingUp,
  X,
  Clock,
  ArrowRight
} from 'lucide-react';

const Budgets = () => {
  const { user, currencySymbol } = useContext(AuthContext);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBudget, setEditBudget] = useState(null);

  const [formData, setFormData] = useState({
    category: 'Food',
    limit: '',
    period: 'monthly',
    alertThreshold: 80
  });

  const categories = ['Food', 'Rent', 'Shopping', 'Transport', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Investment', 'Other'];

  const fetchBudgetStatus = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const res = await axios.get('http://localhost:5000/api/budgets/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudgetStatus(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.limit || Number(formData.limit) <= 0) {
      return toast.error('Please enter a valid spending limit');
    }

    try {
      const token = Cookies.get('token');
      await axios.post(
        'http://localhost:5000/api/budgets',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Budget cap configured!');
      setShowAddModal(false);
      setEditBudget(null);
      setFormData({ category: 'Food', limit: '', period: 'monthly', alertThreshold: 80 });
      fetchBudgetStatus();
      window.dispatchEvent(new Event('finance_updated'));
    } catch (err) {
      toast.error('Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category budget?')) {
      try {
        const token = Cookies.get('token');
        await axios.delete(`http://localhost:5000/api/budgets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Budget removed');
        fetchBudgetStatus();
        window.dispatchEvent(new Event('finance_updated'));
      } catch (err) {
        toast.error('Failed to delete budget');
      }
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Smart Budget Management</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Set category limits, monitor real-time utilization, and prevent overspending before month-end.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} /> Set Category Budget
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card stat-card accent-blue h-100 shadow-sm">
            <span className="form-label mb-1">Total Budget Allocated</span>
            <h2 className="fw-bold mb-1 font-mono">
              {currencySymbol}{budgetStatus?.totalBudget?.toLocaleString('en-IN') || 0}
            </h2>
            <small className="text-muted">Target maximum monthly limit</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card stat-card accent-amber h-100 shadow-sm">
            <span className="form-label mb-1">Total Spent Across Budgets</span>
            <h2 className="fw-bold mb-1 font-mono text-warning">
              {currencySymbol}{budgetStatus?.totalSpent?.toLocaleString('en-IN') || 0}
            </h2>
            <small className="text-muted">
              {budgetStatus?.overallUtilization || 0}% overall utilization
            </small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card stat-card accent-red h-100 shadow-sm">
            <span className="form-label mb-1">Exceeded Alert Categories</span>
            <h2 className="fw-bold mb-1 font-mono text-danger">
              {budgetStatus?.exceededCount || 0}
            </h2>
            <small className="text-muted">
              {budgetStatus?.exceededCount > 0 ? 'Urgent attention required' : 'All budgets healthy'}
            </small>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="row g-4">
        {budgetStatus?.budgets?.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted card shadow-sm">
            <PieChart size={40} className="mx-auto mb-2 opacity-50" />
            <h5>No category budgets defined</h5>
            <p className="small mb-3">Set monthly caps to trigger automated overspending alerts.</p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm mx-auto">
              Create First Budget
            </button>
          </div>
        ) : (
          budgetStatus?.budgets?.map((b) => {
            const isExceeded = b.isExceeded;
            const isNearLimit = b.isNearLimit;
            const barColor = isExceeded
              ? 'var(--color-danger)'
              : isNearLimit
              ? 'var(--color-warning)'
              : 'var(--color-success)';

            return (
              <div key={b._id} className="col-md-6 col-lg-4">
                <div
                  className="card p-4 h-100 shadow-sm position-relative overflow-hidden"
                  style={{
                    borderLeft: `4px solid ${barColor}`
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold mb-0">{b.category}</h5>
                      <small className="text-muted">Monthly Cap</small>
                    </div>

                    <div className="d-flex align-items-center gap-1">
                      {isExceeded ? (
                        <span className="badge-fintech danger">
                          <AlertTriangle size={13} /> Over Budget
                        </span>
                      ) : isNearLimit ? (
                        <span className="badge-fintech warning">
                          <Clock size={13} /> {b.utilization}%
                        </span>
                      ) : (
                        <span className="badge-fintech success">
                          <CheckCircle2 size={13} /> On Track
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="btn btn-sm"
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '2px' }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1 font-mono">
                      <span>Spent: <strong>{currencySymbol}{b.spent.toLocaleString('en-IN')}</strong></span>
                      <span className="text-muted">Limit: {currencySymbol}{b.limit.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="progress" style={{ height: '8px', backgroundColor: 'var(--bg-surface)' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(100, b.utilization)}%`,
                          backgroundColor: barColor
                        }}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between small text-muted pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
                    <span>
                      {isExceeded ? (
                        <strong className="text-danger">Exceeded by {currencySymbol}{b.overspent.toLocaleString('en-IN')}</strong>
                      ) : (
                        <span>Remaining: <strong className="text-success font-mono">{currencySymbol}{b.remaining.toLocaleString('en-IN')}</strong></span>
                      )}
                    </span>
                    <span>{b.utilization}% utilized</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Budget Modal */}
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
            style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-modal)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold mb-0">Set Category Budget</h5>
              <button onClick={() => setShowAddModal(false)} className="btn btn-sm btn-outline-custom">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Monthly Limit ({currencySymbol})</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 15000"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  required
                  min="1"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Warning Alert Threshold (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                  min="50"
                  max="100"
                />
                <small className="text-muted">Sends an alert when spending hits this percentage.</small>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
                Save Budget Limit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
