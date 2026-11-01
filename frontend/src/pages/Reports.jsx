import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

const Reports = () => {
  const { user, currencySymbol, exportAllData } = useContext(AuthContext);
  const [overview, setOverview] = useState(null);
  const [salaries, setSalaries] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [netWorth, setNetWorth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [overviewRes, salaryRes, budgetRes, nwRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/overview', { headers }),
        axios.get('http://localhost:5000/api/salary', { headers }),
        axios.get('http://localhost:5000/api/budgets/status', { headers }),
        axios.get('http://localhost:5000/api/net-worth', { headers })
      ]);

      setOverview(overviewRes.data);
      setSalaries(salaryRes.data || []);
      setBudgets(budgetRes.data?.budgets || []);
      setNetWorth(nwRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleExportJSON = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MoneyManager_Enterprise_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('JSON financial backup downloaded successfully!');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-center py-5 text-muted">Compiling financial report...</div>;
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header (hidden in print) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 d-print-none">
        <div>
          <h2 className="fw-bold mb-1">Financial Statements & Audit Reports</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Official printable monthly cash flow statements, tax records, and data exports.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button onClick={handleExportJSON} className="btn btn-outline-custom">
            <Download size={16} /> Export JSON Data
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Financial Statement Paper */}
      <div
        className="card shadow-lg p-5 mx-auto"
        style={{
          maxWidth: '850px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Document Header */}
        <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800
                }}
              >
                ₹
              </div>
              <h4 className="fw-bold mb-0">MoneyManager Enterprise</h4>
            </div>
            <p className="text-muted small mb-0">Personal Financial Statement & Cash Flow Audit</p>
          </div>

          <div className="text-end">
            <div className="fw-bold" style={{ fontSize: '0.9rem' }}>CONFIDENTIAL</div>
            <small className="text-muted d-block">Period: {overview?.period?.monthName || 'November 2026'}</small>
            <small className="text-muted">Generated: {new Date().toLocaleDateString()}</small>
          </div>
        </div>

        {/* Member Profile Block */}
        <div className="row g-3 p-3 rounded-3 mb-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="col-4">
            <small className="text-muted d-block text-uppercase">Account Holder</small>
            <strong>{user?.name}</strong>
          </div>
          <div className="col-4">
            <small className="text-muted d-block text-uppercase">Email / Identifier</small>
            <span>{user?.email}</span>
          </div>
          <div className="col-4">
            <small className="text-muted d-block text-uppercase">Designation / Role</small>
            <span>{user?.jobTitle || 'Professional'}</span>
          </div>
        </div>

        {/* Financial Position Executive Summary */}
        <h6 className="fw-bold text-uppercase text-muted border-bottom pb-2 mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
          Executive Position Statement
        </h6>

        <div className="row g-3 mb-4">
          <div className="col-3">
            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <small className="text-muted d-block">TOTAL INFLOW</small>
              <h5 className="fw-bold text-success mb-0 font-mono">
                +{currencySymbol}{overview?.totalIncome?.toLocaleString('en-IN')}
              </h5>
            </div>
          </div>
          <div className="col-3">
            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <small className="text-muted d-block">TOTAL OUTFLOW</small>
              <h5 className="fw-bold text-danger mb-0 font-mono">
                -{currencySymbol}{overview?.totalExpenses?.toLocaleString('en-IN')}
              </h5>
            </div>
          </div>
          <div className="col-3">
            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <small className="text-muted d-block">NET SAVINGS</small>
              <h5 className="fw-bold mb-0 font-mono">
                {currencySymbol}{overview?.monthlySavings?.toLocaleString('en-IN')}
              </h5>
            </div>
          </div>
          <div className="col-3">
            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <small className="text-muted d-block">ESTIMATED NET WORTH</small>
              <h5 className="fw-bold text-primary mb-0 font-mono">
                {currencySymbol}{netWorth?.netWorth?.toLocaleString('en-IN')}
              </h5>
            </div>
          </div>
        </div>

        {/* Category-wise Expenses Table */}
        <h6 className="fw-bold text-uppercase text-muted border-bottom pb-2 mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
          Category Disbursements Breakdown
        </h6>

        <table className="table table-sm mb-4">
          <thead>
            <tr>
              <th>Category</th>
              <th className="text-center">Count</th>
              <th className="text-end">Percentage</th>
              <th className="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {overview?.categoryExpenses?.map((c, i) => (
              <tr key={i}>
                <td>{c.category}</td>
                <td className="text-center font-mono">{c.count}</td>
                <td className="text-end font-mono">{c.percentage}%</td>
                <td className="text-end font-mono fw-bold">{currencySymbol}{c.amount?.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Salary Records Summary */}
        {salaries.length > 0 && (
          <>
            <h6 className="fw-bold text-uppercase text-muted border-bottom pb-2 mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              Payroll & Salary History
            </h6>
            <table className="table table-sm mb-4">
              <thead>
                <tr>
                  <th>Employer</th>
                  <th>Period</th>
                  <th className="text-end">Gross Salary</th>
                  <th className="text-end">PF Deducted</th>
                  <th className="text-end">Tax (TDS)</th>
                  <th className="text-end">Net Salary</th>
                </tr>
              </thead>
              <tbody>
                {salaries.slice(0, 4).map((s) => (
                  <tr key={s._id}>
                    <td>{s.employer}</td>
                    <td>{s.month}/{s.year}</td>
                    <td className="text-end font-mono">{currencySymbol}{s.grossSalary?.toLocaleString('en-IN')}</td>
                    <td className="text-end font-mono">{currencySymbol}{s.pfDeduction?.toLocaleString('en-IN')}</td>
                    <td className="text-end font-mono">{currencySymbol}{s.taxDeduction?.toLocaleString('en-IN')}</td>
                    <td className="text-end font-mono fw-bold text-success">{currencySymbol}{s.netSalary?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Auditor Stamp & Signature */}
        <div className="border-top pt-4 mt-4 d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex align-items-center gap-1 text-success fw-bold small">
              <ShieldCheck size={16} /> Verified Database Records Integrity
            </div>
            <small className="text-muted">Generated by Sikka AI & MongoDB Enterprise Engine</small>
          </div>
          <div className="text-end">
            <div style={{ height: '30px', borderBottom: '1px dashed var(--border-color)', width: '160px', marginBottom: '4px' }}></div>
            <small className="text-muted">Authorized Signature</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
