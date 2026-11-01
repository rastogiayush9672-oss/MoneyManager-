import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  ArrowDownLeft,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  Briefcase,
  DollarSign,
  TrendingUp,
  CreditCard,
  Download
} from 'lucide-react';
import QuickAddModal from '../components/QuickAddModal';

const Income = () => {
  const { user, currencySymbol } = useContext(AuthContext);
  const [incomes, setIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchIncome = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const res = await axios.get('http://localhost:5000/api/transactions?type=income&limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tx = res.data.transactions || [];
      setIncomes(tx);
      const sum = tx.reduce((acc, t) => acc + t.amount, 0);
      setTotalIncome(sum);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load income data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this income record?')) {
      try {
        const token = Cookies.get('token');
        await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Income removed');
        fetchIncome();
        window.dispatchEvent(new Event('finance_updated'));
      } catch (err) {
        toast.error('Failed to delete income');
      }
    }
  };

  const filteredIncomes = incomes.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.merchant && t.merchant.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || t.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Salary', 'Freelance', 'Business', 'Investments', 'Rental', 'Dividends', 'Other'];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Income Streams</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Track salaries, freelance payouts, dividends, business revenue, and additional earnings.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} /> Record Income
        </button>
      </div>

      {/* Summary Stat Banner */}
      <div className="card stat-card accent-emerald p-4 mb-4 shadow-sm">
        <div className="row align-items-center">
          <div className="col-md-6">
            <span className="form-label mb-1">Total Recorded Income</span>
            <h1 className="fw-bold mb-1 font-mono text-success">
              +{currencySymbol}{totalIncome.toLocaleString('en-IN')}
            </h1>
            <small className="text-muted">Across {incomes.length} inflow transactions</small>
          </div>
          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <span className="badge-fintech success" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
              <TrendingUp size={16} /> Healthy Positive Cash Inflow
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card p-3 mb-4 shadow-sm">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search income title, client, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6 d-flex gap-2 justify-content-md-end flex-wrap">
            {categories.map((c) => (
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

      {/* Incomes Table */}
      <div className="card shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Income Stream</th>
                <th>Category</th>
                <th>Payment Mode</th>
                <th>Date Logged</th>
                <th className="text-end">Amount</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No income records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredIncomes.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '38px',
                            height: '38px',
                            backgroundColor: 'var(--color-success-bg)',
                            color: 'var(--color-success)'
                          }}
                        >
                          <ArrowDownLeft size={18} />
                        </div>
                        <div>
                          <div className="fw-bold">{t.title}</div>
                          {t.merchant && <small className="text-muted">{t.merchant}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-fintech success">{t.category}</span>
                    </td>
                    <td>
                      <small className="text-muted">{t.paymentMethod || 'Bank Transfer'}</small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </small>
                    </td>
                    <td className="text-end font-mono fw-bold text-success fs-6">
                      +{currencySymbol}{t.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="btn btn-sm btn-outline-custom text-danger"
                        title="Delete record"
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
          onAdded={() => fetchIncome()}
        />
      )}
    </div>
  );
};

export default Income;
