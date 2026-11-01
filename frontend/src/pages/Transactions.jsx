import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Receipt,
  Search,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import QuickAddModal from '../components/QuickAddModal';

const Transactions = () => {
  const { user, currencySymbol } = useContext(AuthContext);

  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Bulk Operations
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const [bulkTargetCategory, setBulkTargetCategory] = useState('Food');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [viewTx, setViewTx] = useState(null);

  const categories = ['Food', 'Rent', 'Utilities', 'Shopping', 'Transport', 'Entertainment', 'Salary', 'Freelance', 'Healthcare', 'Education', 'Investment', 'Other'];
  const paymentMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Bank Transfer'];

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const skip = (page - 1) * limit;

      const params = new URLSearchParams({
        limit,
        skip,
        sortBy,
        sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (paymentFilter !== 'all') params.append('paymentMethod', paymentFilter);
      if (minAmount) params.append('minAmount', minAmount);
      if (maxAmount) params.append('maxAmount', maxAmount);

      const res = await axios.get(`http://localhost:5000/api/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTransactions(res.data.transactions || []);
      setTotalCount(res.data.totalCount || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, categoryFilter, paymentFilter, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchTransactions();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, minAmount, maxAmount]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        const token = Cookies.get('token');
        await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Transaction removed');
        fetchTransactions();
        window.dispatchEvent(new Event('finance_updated'));
      } catch (err) {
        toast.error('Failed to delete transaction');
      }
    }
  };

  // Bulk Select Toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map(t => t._id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Permanently delete ${selectedIds.length} selected transaction(s)?`)) {
      try {
        const token = Cookies.get('token');
        await axios.post(
          'http://localhost:5000/api/transactions/bulk-delete',
          { ids: selectedIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`Deleted ${selectedIds.length} transaction(s)`);
        setSelectedIds([]);
        fetchTransactions();
        window.dispatchEvent(new Event('finance_updated'));
      } catch (err) {
        toast.error('Bulk delete failed');
      }
    }
  };

  const handleBulkCategorize = async () => {
    try {
      const token = Cookies.get('token');
      await axios.post(
        'http://localhost:5000/api/transactions/bulk-categorize',
        { ids: selectedIds, category: bulkTargetCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Updated category for ${selectedIds.length} items`);
      setShowBulkCategoryModal(false);
      setSelectedIds([]);
      fetchTransactions();
      window.dispatchEvent(new Event('finance_updated'));
    } catch (err) {
      toast.error('Bulk categorize failed');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return toast.info('No transactions to export');
    const headers = ['Date', 'Title', 'Type', 'Category', 'PaymentMethod', 'Merchant', 'Amount'];
    const rows = transactions.map(t => [
      new Date(t.date).toISOString().split('T')[0],
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.paymentMethod || 'UPI',
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      t.amount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Transactions_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV parsing
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importText.trim()) return toast.error('Please paste CSV data');

    try {
      setImportLoading(true);
      const lines = importText.trim().split('\n');
      const records = [];

      // Assume header or detect format: Date, Title, Type, Category, Amount
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Skip header if line has 'title' or 'amount'
        if (i === 0 && line.toLowerCase().includes('title') && line.toLowerCase().includes('amount')) continue;

        const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 2) {
          // Flexible mapping
          const title = parts[0] || 'Imported Entry';
          const amount = parseFloat(parts[1]);
          const type = (parts[2] || 'expense').toLowerCase().includes('in') ? 'income' : 'expense';
          const category = parts[3] || 'General';

          if (!isNaN(amount) && amount > 0) {
            records.push({ title, amount, type, category, date: new Date() });
          }
        }
      }

      if (records.length === 0) {
        return toast.error('Could not parse valid records from CSV text');
      }

      const token = Cookies.get('token');
      const res = await axios.post(
        'http://localhost:5000/api/transactions/import-csv',
        { records },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.msg);
      setShowImportModal(false);
      setImportText('');
      fetchTransactions();
      window.dispatchEvent(new Event('finance_updated'));
    } catch (err) {
      toast.error('Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Financial Transactions</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Complete audit ledger with global search, advanced filters, CSV import/export, and bulk operations.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button onClick={() => setShowImportModal(true)} className="btn btn-outline-custom">
            <Upload size={16} /> Import CSV
          </button>
          <button onClick={handleExportCSV} className="btn btn-outline-custom">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} /> Record Entry
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedIds.length > 0 && (
        <div
          className="card p-3 mb-4 shadow-sm"
          style={{
            backgroundColor: 'var(--color-primary-glow)',
            border: '1px solid var(--color-primary)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold" style={{ color: 'var(--color-primary)' }}>
              {selectedIds.length} item(s) selected
            </span>
            <div className="d-flex gap-2">
              <button
                onClick={() => setShowBulkCategoryModal(true)}
                className="btn btn-sm btn-outline-custom"
              >
                Change Category
              </button>
              <button
                onClick={handleBulkDelete}
                className="btn btn-sm btn-primary"
                style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              >
                <Trash2 size={14} className="me-1" /> Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Toolbar */}
      <div className="card p-3 mb-4 shadow-sm">
        <div className="row g-2 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text border-0" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search merchant, title, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All Types</option>
              <option value="income">Inflow (Income)</option>
              <option value="expense">Outflow (Expense)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All Payment Modes</option>
              {paymentMethods.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card shadow-sm overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <span onClick={toggleSelectAll} style={{ cursor: 'pointer' }}>
                    {selectedIds.length > 0 && selectedIds.length === transactions.length ? (
                      <CheckSquare size={18} className="text-primary" />
                    ) : (
                      <Square size={18} className="text-muted" />
                    )}
                  </span>
                </th>
                <th>Transaction Details</th>
                <th>Category</th>
                <th>Payment Mode</th>
                <th>Date Logged</th>
                <th className="text-end">Amount</th>
                <th className="text-center" style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" />
                    Loading transaction records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No transactions match your criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isSelected = selectedIds.includes(t._id);
                  return (
                    <tr
                      key={t._id}
                      style={{
                        backgroundColor: isSelected ? 'var(--color-primary-glow)' : 'transparent'
                      }}
                    >
                      <td>
                        <span onClick={() => toggleSelectOne(t._id)} style={{ cursor: 'pointer' }}>
                          {isSelected ? (
                            <CheckSquare size={18} className="text-primary" />
                          ) : (
                            <Square size={18} className="text-muted" />
                          )}
                        </span>
                      </td>
                      <td onClick={() => setViewTx(t)} style={{ cursor: 'pointer' }}>
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
                            <small className="text-muted">
                              {t.merchant || `ID: ${t._id.slice(-6).toUpperCase()}`}
                            </small>
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
                      <td className="text-end font-mono fw-bold fs-6">
                        <span className={t.type === 'income' ? 'text-success' : 'text-main'}>
                          {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount?.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="btn btn-sm btn-outline-custom text-danger"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          className="d-flex justify-content-between align-items-center p-3 px-4 border-top"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
        >
          <small className="text-muted">
            Showing {transactions.length} of {totalCount} total entries (Page {page} of {totalPages})
          </small>

          <div className="d-flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-sm btn-outline-custom"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-sm btn-outline-custom"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal / Drawer */}
      {viewTx && (
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
          onClick={() => setViewTx(null)}
        >
          <div
            className="card shadow-lg"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--bg-modal)',
              border: '1px solid var(--border-color)',
              padding: '2rem',
              borderRadius: 'var(--radius-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold mb-0">Transaction Audit Details</h5>
              <button onClick={() => setViewTx(null)} className="btn btn-sm btn-outline-custom">
                <X size={18} />
              </button>
            </div>

            <div className="text-center py-3 mb-3">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2"
                style={{
                  width: '54px',
                  height: '54px',
                  backgroundColor: viewTx.type === 'income' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                  color: viewTx.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)'
                }}
              >
                {viewTx.type === 'income' ? <ArrowDownLeft size={28} /> : <ArrowUpRight size={28} />}
              </div>
              <h2 className="fw-bold font-mono mb-0">
                {viewTx.type === 'income' ? '+' : '-'}{currencySymbol}{viewTx.amount?.toLocaleString('en-IN')}
              </h2>
              <p className="text-muted mb-0">{viewTx.title}</p>
            </div>

            <div className="d-flex flex-column gap-2 p-3 rounded-3 mb-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Category:</span>
                <strong>{viewTx.category}</strong>
              </div>
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Payment Mode:</span>
                <strong>{viewTx.paymentMethod || 'UPI'}</strong>
              </div>
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Merchant / Payee:</span>
                <strong>{viewTx.merchant || 'None listed'}</strong>
              </div>
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Logged Date:</span>
                <strong>{new Date(viewTx.date).toLocaleString()}</strong>
              </div>
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Transaction ID:</span>
                <code className="font-mono">{viewTx._id}</code>
              </div>
              {viewTx.notes && (
                <div className="d-flex justify-content-between small border-top pt-2 mt-1">
                  <span className="text-muted">Notes:</span>
                  <span>{viewTx.notes}</span>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                onClick={() => { handleDelete(viewTx._id); setViewTx(null); }}
                className="btn btn-outline-custom text-danger"
              >
                <Trash2 size={16} /> Delete Record
              </button>
              <button onClick={() => setViewTx(null)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
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
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="card shadow-lg"
            style={{
              width: '100%',
              maxWidth: '600px',
              backgroundColor: 'var(--bg-modal)',
              border: '1px solid var(--border-color)',
              padding: '2rem',
              borderRadius: 'var(--radius-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FileSpreadsheet size={20} className="text-primary" /> Import Transactions CSV
              </h5>
              <button onClick={() => setShowImportModal(false)} className="btn btn-sm btn-outline-custom">
                <X size={18} />
              </button>
            </div>

            <p className="text-muted small mb-3">
              Paste comma-separated rows. Duplicate transactions within the same 24-hour window will be automatically detected and safely skipped.
            </p>

            <form onSubmit={handleImportSubmit}>
              <div className="mb-3">
                <label className="form-label">CSV Text Data</label>
                <textarea
                  className="form-control font-mono"
                  rows={8}
                  placeholder={`Title, Amount, Type, Category\nStarbucks Coffee, 350, expense, Food\nFreelance Logo Design, 8000, income, Freelance\nElectricity Bill, 1850, expense, Utilities`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  required
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="btn btn-outline-custom"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importLoading}
                  className="btn btn-primary"
                >
                  {importLoading ? 'Validating & Importing...' : 'Import Records'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Category Change Modal */}
      {showBulkCategoryModal && (
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
          onClick={() => setShowBulkCategoryModal(false)}
        >
          <div
            className="card shadow-lg p-4"
            style={{ width: '400px', backgroundColor: 'var(--bg-modal)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="fw-bold mb-3">Bulk Categorization</h5>
            <p className="text-muted small mb-3">
              Move {selectedIds.length} selected transaction(s) to a new category:
            </p>
            <select
              className="form-select mb-4"
              value={bulkTargetCategory}
              onChange={(e) => setBulkTargetCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="d-flex justify-content-end gap-2">
              <button onClick={() => setShowBulkCategoryModal(false)} className="btn btn-outline-custom">
                Cancel
              </button>
              <button onClick={handleBulkCategorize} className="btn btn-primary">
                Apply Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {showAddModal && (
        <QuickAddModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => fetchTransactions()}
        />
      )}
    </div>
  );
};

export default Transactions;
