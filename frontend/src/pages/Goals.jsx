import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';
import {
  Target,
  Plus,
  Trophy,
  Calendar,
  PiggyBank,
  CheckCircle2,
  Trash2,
  ArrowUpRight,
  Sparkles,
  X,
  History
} from 'lucide-react';

const Goals = () => {
  const { user, currencySymbol } = useContext(AuthContext);
  const [goalsData, setGoalsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    monthlyContribution: '',
    category: 'Personal Savings'
  });

  const categories = [
    'Emergency Fund',
    'New Laptop',
    'New Phone',
    'Vacation',
    'Higher Education',
    'Personal Savings',
    'Vehicle',
    'Home',
    'Investment',
    'Other'
  ];

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const res = await axios.get('http://localhost:5000/api/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoalsData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Enter goal name');
    if (!formData.targetAmount || Number(formData.targetAmount) <= 0) return toast.error('Enter valid target amount');
    if (!formData.targetDate) return toast.error('Select target date');

    try {
      const token = Cookies.get('token');
      await axios.post('http://localhost:5000/api/goals', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Savings target established!');
      setShowAddModal(false);
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        monthlyContribution: '',
        category: 'Personal Savings'
      });
      fetchGoals();
      window.dispatchEvent(new Event('finance_updated'));
    } catch (err) {
      toast.error('Failed to create goal');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amt = Number(depositAmount);
    if (!amt || amt <= 0) return toast.error('Enter valid contribution amount');

    try {
      const token = Cookies.get('token');
      const res = await axios.post(
        `http://localhost:5000/api/goals/${contributeGoal._id}/contribute`,
        { amount: amt, note: depositNote || 'Goal deposit' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check if completed
      if (res.data.currentAmount >= res.data.targetAmount) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        toast.success(`🎉 Congratulations! You reached your goal: ${contributeGoal.name}!`);
      } else {
        toast.success(`Deposited ${currencySymbol}${amt.toLocaleString('en-IN')} to ${contributeGoal.name}!`);
      }

      setContributeGoal(null);
      setDepositAmount('');
      setDepositNote('');
      fetchGoals();
      window.dispatchEvent(new Event('finance_updated'));
    } catch (err) {
      toast.error('Failed to add contribution');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this savings goal?')) {
      try {
        const token = Cookies.get('token');
        await axios.delete(`http://localhost:5000/api/goals/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Goal removed');
        fetchGoals();
        window.dispatchEvent(new Event('finance_updated'));
      } catch (err) {
        toast.error('Failed to delete goal');
      }
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Savings & Financial Goals</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Set wealth milestones, emergency reserves, vacation plans, and gadget acquisitions.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} /> New Savings Goal
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card stat-card accent-emerald h-100 shadow-sm">
            <span className="form-label mb-1">Total Saved Across Goals</span>
            <h2 className="fw-bold mb-1 font-mono text-success">
              {currencySymbol}{goalsData?.totalSaved?.toLocaleString('en-IN') || 0}
            </h2>
            <small className="text-muted">Target aggregate: {currencySymbol}{goalsData?.totalTarget?.toLocaleString('en-IN') || 0}</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card stat-card accent-blue h-100 shadow-sm">
            <span className="form-label mb-1">Overall Goal Completion</span>
            <h2 className="fw-bold mb-1 font-mono">
              {goalsData?.overallProgress || 0}%
            </h2>
            <div className="progress mt-2" style={{ height: '6px' }}>
              <div
                className="progress-bar bg-primary"
                style={{ width: `${Math.min(100, goalsData?.overallProgress || 0)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card stat-card accent-violet h-100 shadow-sm">
            <span className="form-label mb-1">Active Targets</span>
            <h2 className="fw-bold mb-1 font-mono" style={{ color: 'var(--color-accent)' }}>
              {goalsData?.goalsCount || 0}
            </h2>
            <small className="text-muted">Milestones currently tracking</small>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="row g-4">
        {goalsData?.goals?.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted card shadow-sm">
            <Target size={40} className="mx-auto mb-2 opacity-50" />
            <h5>No savings goals created</h5>
            <p className="small mb-3">Define your dream targets like a MacBook Pro or Emergency Fund.</p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm mx-auto">
              Create First Goal
            </button>
          </div>
        ) : (
          goalsData?.goals?.map((g) => (
            <div key={g._id} className="col-md-6 col-lg-4">
              <div className="card p-4 h-100 shadow-sm position-relative overflow-hidden d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="badge-fintech neutral mb-1">{g.category}</span>
                      <h5 className="fw-bold mb-0">{g.name}</h5>
                    </div>

                    <div className="d-flex align-items-center gap-1">
                      {g.isCompleted ? (
                        <span className="badge-fintech success">
                          <Trophy size={13} /> Completed
                        </span>
                      ) : (
                        <span className="badge-fintech info">
                          {g.progress}%
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(g._id)}
                        className="btn btn-sm"
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '2px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">Current:</span>
                      <strong className="font-mono text-success">{currencySymbol}{g.currentAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="d-flex justify-content-between small mb-2">
                      <span className="text-muted">Target:</span>
                      <strong className="font-mono">{currencySymbol}{g.targetAmount.toLocaleString('en-IN')}</strong>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress" style={{ height: '8px', backgroundColor: 'var(--bg-surface)' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(100, g.progress)}%`,
                          background: g.isCompleted
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded-3 mb-3 small" style={{ backgroundColor: 'var(--bg-surface)' }}>
                    <div className="d-flex justify-content-between text-muted">
                      <span>Target Date:</span>
                      <span>{new Date(g.targetDate).toLocaleDateString()}</span>
                    </div>
                    {!g.isCompleted && g.neededMonthlyContribution > 0 && (
                      <div className="d-flex justify-content-between text-muted mt-1">
                        <span>Required / Mo:</span>
                        <strong className="text-primary font-mono">{currencySymbol}{g.neededMonthlyContribution.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div>
                  {!g.isCompleted ? (
                    <button
                      onClick={() => setContributeGoal(g)}
                      className="btn btn-outline-custom w-100 btn-sm fw-bold"
                    >
                      <Plus size={14} /> Add Deposit
                    </button>
                  ) : (
                    <div className="text-center text-success small fw-bold py-1">
                      <CheckCircle2 size={15} className="me-1" /> Goal Reached & Achieved!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Goal Modal */}
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
              <h5 className="fw-bold mb-0">Create Savings Goal</h5>
              <button onClick={() => setShowAddModal(false)} className="btn btn-sm btn-outline-custom">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label">Goal Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Emergency Fund, New Laptop, Japan Trip"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">Target Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="150000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Initial Deposit</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">Target Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
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
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-bold mt-2">
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Contribution Modal */}
      {contributeGoal && (
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
          onClick={() => setContributeGoal(null)}
        >
          <div
            className="card shadow-lg p-4"
            style={{ width: '100%', maxWidth: '440px', backgroundColor: 'var(--bg-modal)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold mb-0">Deposit to {contributeGoal.name}</h5>
              <button onClick={() => setContributeGoal(null)} className="btn btn-sm btn-outline-custom">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDeposit}>
              <div className="mb-3">
                <label className="form-label">Deposit Amount ({currencySymbol})</label>
                <input
                  type="number"
                  className="form-control font-mono fs-4 text-center"
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  autoFocus
                  required
                  min="1"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Note / Source</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Monthly salary savings, Freelance bonus"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
                Confirm Deposit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
