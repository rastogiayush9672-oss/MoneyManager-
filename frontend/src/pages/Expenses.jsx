import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  ArrowUpRight,
  Plus,
  Search,
  Trash2,
  Calendar,
  CreditCard,
  Tag,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import QuickAddModal from '../components/QuickAddModal';

const Expenses = () => {
  const { user, currencySymbol } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [essentialFilter, setEssentialFilter] = useState('all'); // 'all' | 'essential' | 'discretionary'
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const res = await axios.get('http://localhost:5000/api/transactions?type=expense&limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tx = res.data.transactions || [];
      setExpenses(tx);
      const sum = tx.reduce((acc, t) => acc + t.amount, 0);
      setTotalExpense(sum);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try {
        const token = Cookies.get('token');
        await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Expense removed');
        fetchExpenses();
        window.dispatchEvent(new Event('finance_updated'));
      } catch (err) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const filteredExpenses = expenses.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.merchant && t.merchant.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesEssential = essentialFilter === 'all'
      ? true
      : essentialFilter === 'essential'
      ? t.isEssential === true
      : t.isEssential === false;
    return matchesSearch && matchesCategory && matchesEssential;
  });

  const categories = ['all', 'Food', 'Rent', 'Shopping', 'Transport', 'Entertainment', 'Utilities', 'Healthcare', 'Education'];

  const essentialSum = expenses.filter(t => t.isEssential).reduce((acc, t) => acc + t.amount, 0);
  const discretionarySum = totalExpense - essentialSum;

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Expense Tracking</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Monitor daily spending, merchant records, essential vs discretionary allocations.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} /> Log Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card stat-card accent-red h-100 shadow-sm">
            <span className="form-label mb-1">Total Recorded Outflow</span>
            <h2 className="fw-bold mb-1 font-mono text-danger">
              -{currencySymbol}{totalExpense.toLocaleString('en-IN')}
            </h2>
            <small className="text-muted">Across {expenses.length} logged expense items</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card stat-card accent-blue h-100 shadow-sm">
            <span className="form-label mb-1">Essential Needs (50% Guideline)</span>
            <h3 className="fw-bold mb-1 font-mono">
              {currencySymbol}{essentialSum.toLocaleString('en-IN')}
            </h3>
            <small className="text-muted">
              {totalExpense > 0 ? Math.round((essentialSum / totalExpense) * 100) : 0}% of your total expenses
            </small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card stat-card accent-amber h-100 shadow-sm">
            <span className="form-label mb-1">Discretionary Wants (30% Guideline)</span>
            <h3 className="fw-bold mb-1 font-mono text-warning">
              {currencySymbol}{discretionarySum.toLocaleString('en-IN')}
            </h3>
            <small className="text-muted">
              {totalExpense > 0 ? Math.round((discretionarySum / totalExpense) * 100) : 0}% of your total expenses
            </small>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-3 mb-4 shadow-sm">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search merchant, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={essentialFilter}
              onChange={(e) => setEssentialFilter(e.target.value)}
            >
              <option value="all">All Needs & Wants</option>
              <option value="essential">Essential Needs Only</option>
              <option value="discretionary">Discretionary / Wants Only</option>
            </select>
          </div>

          <div className="col-md-4 d-flex gap-2 justify-content-md-end flex-wrap">
            {categories.slice(0, 6).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`btn btn-sm ${selectedCategory === c ? 'btn-primary' : 'btn-outline-custom'}`}
                style={{ textTransform: 'capitalize', fontSize: '0.78rem' }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Expense Item</th>
                <th>Category</th>
                <th>Classification</th>
                <th>Payment Mode</th>
                <th>Date Logged</th>
                <th className="text-end">Amount</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No expense records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '38px',
                            height: '38px',
                            backgroundColor: 'var(--color-danger-bg)',
                            color: 'var(--color-danger)'
                          }}
                        >
                          <ArrowUpRight size={18} />
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
                      {t.isEssential ? (
                        <span className="badge-fintech info">Essential</span>
                      ) : (
                        <span className="badge-fintech warning">Discretionary</span>
                      )}
                    </td>
                    <td>
                      <small className="text-muted">{t.paymentMethod || 'UPI'}</small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </small>
                    </td>
                    <td className="text-end font-mono fw-bold text-main fs-6">
                      -{currencySymbol}{t.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="btn btn-sm btn-outline-custom text-danger"
                        title="Delete expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <QuickAddModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => fetchExpenses()}
        />
      )}
    </div>
  );
};

export default Expenses;
