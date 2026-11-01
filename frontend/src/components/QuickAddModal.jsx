import React, { useState, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { X, ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react';

const QuickAddModal = ({ onClose, onAdded }) => {
  const { currencySymbol } = useContext(AuthContext);
  const [tab, setTab] = useState('expense'); // 'expense' | 'income'
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [merchant, setMerchant] = useState('');
  const [isEssential, setIsEssential] = useState(true);
  const [loading, setLoading] = useState(false);

  const categories = {
    expense: ['Food', 'Rent', 'Utilities', 'Shopping', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Investment', 'Other'],
    income: ['Salary', 'Freelance', 'Business', 'Investments', 'Rental', 'Dividends', 'Gift', 'Other']
  };

  const handleTabChange = (t) => {
    setTab(t);
    setCategory(categories[t][0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      return toast.error('Please enter a valid amount');
    }
    if (!title.trim()) {
      return toast.error('Please enter a title');
    }

    try {
      setLoading(true);
      await axios.post(
        'http://localhost:5000/api/transactions',
        {
          title: title.trim(),
          amount: Number(amount),
          type: tab,
          category,
          paymentMethod,
          merchant: merchant.trim(),
          isEssential: tab === 'expense' ? isEssential : true,
          date: new Date()
        },
        {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` }
        }
      );

      toast.success(`${tab === 'expense' ? 'Expense' : 'Income'} of ${currencySymbol}${Number(amount).toLocaleString('en-IN')} logged!`);
      if (onAdded) onAdded();
      onClose();
      // Dispatch custom event to notify open pages to refresh data
      window.dispatchEvent(new Event('finance_updated'));
    } catch (err) {
      console.error(err);
      toast.error('Failed to log transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
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
      onClick={onClose}
    >
      <div
        className="card shadow-lg"
        style={{
          width: '100%',
          maxWidth: '500px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-modal)',
          padding: '1.75rem',
          borderRadius: 'var(--radius-xl)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h5 style={{ fontWeight: 800, margin: 0 }}>Log Transaction</h5>
          <button
            onClick={onClose}
            className="btn btn-sm"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)'
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange('expense')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: tab === 'expense' ? 'var(--color-danger)' : 'transparent',
              color: tab === 'expense' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowUpRight size={16} /> Expense
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('income')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: tab === 'income' ? 'var(--color-success)' : 'transparent',
              color: tab === 'income' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowDownLeft size={16} /> Income
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Large Amount Input */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Amount</label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-muted)' }}>{currencySymbol}</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                min="1"
                step="any"
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  width: '200px',
                  textAlign: 'center',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${tab === 'expense' ? 'var(--color-danger)' : 'var(--color-success)'}`,
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>
          </div>

          {/* Title / Description */}
          <div className="mb-3">
            <label className="form-label">Title / Note</label>
            <input
              type="text"
              className="form-control"
              placeholder={tab === 'expense' ? 'e.g. Swiggy Lunch, Uber Ride' : 'e.g. November Salary, Client Payment'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            {/* Category */}
            <div className="col-6">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories[tab].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="col-6">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI">UPI (GPay / PhonePe)</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="row g-3 mb-4">
            {/* Merchant / Payee */}
            <div className="col-6">
              <label className="form-label">Merchant / Payee</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Amazon, Landlord"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>

            {/* Essential Checkbox (for expense) */}
            {tab === 'expense' && (
              <div className="col-6 d-flex align-items-center mt-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="essentialCheck"
                    checked={isEssential}
                    onChange={(e) => setIsEssential(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="essentialCheck" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Essential Need (50/30/20)
                  </label>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-3"
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              background: tab === 'expense'
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}
          >
            {loading ? 'Logging...' : `Record ${tab === 'expense' ? 'Expense' : 'Income'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickAddModal;
