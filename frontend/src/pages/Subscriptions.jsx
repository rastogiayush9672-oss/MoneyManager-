import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Repeat,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  CreditCard,
  Trash2,
  X,
  ExternalLink,
  DollarSign
} from 'lucide-react';

const Subscriptions = () => {
  const { user, currencySymbol } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billingCycle: 'monthly',
    category: 'Streaming',
    nextDueDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Credit Card Auto-Debit',
    notes: ''
  });

  const categories = ['Streaming', 'Software', 'Utilities', 'Rent', 'Mobile & Internet', 'Insurance', 'Loan EMI', 'Gym & Fitness', 'Other'];
  const cycles = ['monthly', 'yearly', 'quarterly', 'weekly'];

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const res = await axios.get('http://localhost:5000/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Enter subscription name');
    if (!formData.amount || Number(formData.amount) <= 0) return toast.error('Enter valid amount');

    try {
      const token = Cookies.get('token');
      await axios.post('http://localhost:5000/api/subscriptions', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Recurring commitment recorded!');
      setShowAddModal(false);
      setFormData({
        name: '',
        amount: '',
        billingCycle: 'monthly',
        category: 'Streaming',
        nextDueDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Credit Card Auto-Debit',
        notes: ''
      });
      fetchSubscriptions();
      window.dispatchEvent(new Event('finance_updated'));
    } catch (err) {
      toast.error('Failed to save subscription');
    }
  };

  const handleMarkPaid = async (id, name) => {
    try {
      const token = Cookies.get('token');
      await axios.post(`http://localhost:5000/api/subscriptions/${id}/pay`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Payment logged for ${name}. Next due date updated!`);
      fetchSubscriptions();
      window.dispatchEvent(new Event('finance_updated'));
    } catch (err) {
      toast.error('Failed to log payment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this subscription/bill?')) {
      try {
        const token = Cookies.get('token');
        await axios.delete(`http://localhost:5000/api/subscriptions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Subscription deleted');
        fetchSubscriptions();
        window.dispatchEvent(new Event('finance_updated'));
      } catch (err) {
        toast.error('Failed to delete subscription');
      }
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Subscriptions & Recurring Bills</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Manage software, OTT streaming, house rent, utility bills, and insurance auto-debits.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} /> Add Subscription / Bill
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card stat-card accent-blue h-100 shadow-sm">
            <span className="form-label mb-1">Monthly Recurring Burn</span>
            <h2 className="fw-bold mb-1 font-mono">
              {currencySymbol}{data?.monthlyCommitment?.toLocaleString('en-IN') || 0}
            </h2>
            <small className="text-muted">Total fixed monthly outflow</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card stat-card accent-amber h-100 shadow-sm">
            <span className="form-label mb-1">Annualized Total Cost</span>
            <h2 className="fw-bold mb-1 font-mono text-warning">
              {currencySymbol}{data?.annualCommitment?.toLocaleString('en-IN') || 0}
            </h2>
            <small className="text-muted">Projected 12-month commitment</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card stat-card accent-red h-100 shadow-sm">
            <span className="form-label mb-1">Due in Next 7 Days</span>
            <h2 className="fw-bold mb-1 font-mono text-danger">
              {data?.dueSoonCount || 0}
            </h2>
            <small className="text-muted">
              {data?.dueSoonCount > 0 ? 'Upcoming payment due soon' : 'No urgent commitments'}
            </small>
          </div>
        </div>
      </div>

      {/* Subscriptions Table / Cards */}
      <div className="card shadow-sm overflow-hidden">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center p-3 px-4 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h5 className="fw-bold mb-0">Active Recurring Commitments</h5>
            <small className="text-muted">Track renewal cycle, payment modes, and due alerts</small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Service / Bill</th>
                <th>Category</th>
                <th>Billing Cycle</th>
                <th>Next Due Date</th>
                <th>Payment Mode</th>
                <th className="text-end">Amount</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.subscriptions?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No subscriptions or recurring bills tracked yet.
                  </td>
                </tr>
              ) : (
                data?.subscriptions?.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '38px',
                            height: '38px',
                            backgroundColor: 'var(--color-primary-glow)',
                            color: 'var(--color-primary)'
                          }}
                        >
                          <Repeat size={18} />
                        </div>
                        <div>
                          <div className="fw-bold">{s.name}</div>
                          {s.isDueSoon && (
                            <span className="badge-fintech warning" style={{ fontSize: '0.7rem' }}>
                              Due in {s.daysUntilDue} day(s)
                            </span>
                          )}
                          {s.isOverdue && (
                            <span className="badge-fintech danger" style={{ fontSize: '0.7rem' }}>
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-fintech neutral">{s.category}</span>
                    </td>
                    <td>
                      <span className="text-capitalize small">{s.billingCycle}</span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(s.nextDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </small>
                    </td>
                    <td>
                      <small className="text-muted">{s.paymentMethod}</small>
                    </td>
                    <td className="text-end font-mono fw-bold fs-6">
                      {currencySymbol}{s.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <button
                          onClick={() => handleMarkPaid(s._id, s.name)}
                          className="btn btn-sm btn-outline-custom text-success"
                          title="Mark as Paid"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="btn btn-sm btn-outline-custom text-danger"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subscription Modal */}
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
              <h5 className="fw-bold mb-0">Add Recurring Bill / Subscription</h5>
              <button onClick={() => setShowAddModal(false)} className="btn btn-sm btn-outline-custom">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label">Service / Bill Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Netflix, JioFiber, House Rent, LIC"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="649"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Billing Cycle</label>
                  <select
                    className="form-select text-capitalize"
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  >
                    {cycles.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
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
                <div className="col-6">
                  <label className="form-label">Next Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Payment Method</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Credit Card Auto-Debit, UPI AutoPay"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
                Save Recurring Commitment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
