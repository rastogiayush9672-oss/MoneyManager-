import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Briefcase,
  Plus,
  FileText,
  Download,
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Trash2,
  Edit2,
  Eye,
  X
} from 'lucide-react';

const Salary = () => {
  const { user, currencySymbol } = useContext(AuthContext);
  const [salaries, setSalaries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    employer: '',
    designation: '',
    paymentDate: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: '',
    hra: '',
    da: '',
    specialAllowance: '',
    bonuses: '',
    incentives: '',
    pfDeduction: '',
    taxDeduction: '',
    professionalTax: '200',
    otherDeductions: '',
    paymentMethod: 'Direct Bank Transfer (HDFC Bank)',
    notes: '',
    alsoCreateTransaction: true
  });

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [listRes, summaryRes] = await Promise.all([
        axios.get('http://localhost:5000/api/salary', { headers }),
        axios.get('http://localhost:5000/api/salary/summary', { headers })
      ]);

      setSalaries(listRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load salary statements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  // Computed live numbers in form
  const numBasic = Number(formData.basicSalary) || 0;
  const numHra = Number(formData.hra) || 0;
  const numDa = Number(formData.da) || 0;
  const numSpecial = Number(formData.specialAllowance) || 0;
  const numBonus = Number(formData.bonuses) || 0;
  const numIncentives = Number(formData.incentives) || 0;

  const grossCalculated = numBasic + numHra + numDa + numSpecial + numBonus + numIncentives;

  const numPf = Number(formData.pfDeduction) || 0;
  const numTax = Number(formData.taxDeduction) || 0;
  const numPt = Number(formData.professionalTax) || 200;
  const numOther = Number(formData.otherDeductions) || 0;

  const deductionsCalculated = numPf + numTax + numPt + numOther;
  const netCalculated = Math.max(0, grossCalculated - deductionsCalculated);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employer.trim()) return toast.error('Please enter employer name');
    if (numBasic <= 0) return toast.error('Basic salary must be greater than 0');

    try {
      const token = Cookies.get('token');
      await axios.post(
        'http://localhost:5000/api/salary',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Salary statement successfully recorded!');
      setShowAddModal(false);
      setFormData({
        employer: '',
        designation: '',
        paymentDate: new Date().toISOString().split('T')[0],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: '',
        hra: '',
        da: '',
        specialAllowance: '',
        bonuses: '',
        incentives: '',
        pfDeduction: '',
        taxDeduction: '',
        professionalTax: '200',
        otherDeductions: '',
        paymentMethod: 'Direct Bank Transfer (HDFC Bank)',
        notes: '',
        alsoCreateTransaction: true
      });
      fetchSalaries();
      window.dispatchEvent(new Event('finance_updated'));
    } catch (err) {
      console.error(err);
      toast.error('Failed to save salary record');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this salary record?')) {
      try {
        const token = Cookies.get('token');
        await axios.delete(`http://localhost:5000/api/salary/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Salary statement deleted');
        fetchSalaries();
        window.dispatchEvent(new Event('finance_updated'));
      } catch (err) {
        toast.error('Failed to delete salary');
      }
    }
  };

  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Salary Management</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Payslips, allowances breakdown, tax deductions, PF tracking, and net take-home analytics.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} /> Log Salary Statement
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {/* Latest Monthly Salary */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card accent-emerald h-100 shadow-sm">
            <span className="form-label mb-1">Latest Net Take-Home</span>
            <h3 className="fw-bold mb-1 font-mono text-success">
              {currencySymbol}{summary?.latestSalary?.netSalary?.toLocaleString('en-IN') || 0}
            </h3>
            <small className="text-muted">
              {summary?.latestSalary ? `${monthNames[summary.latestSalary.month]} ${summary.latestSalary.year}` : 'No records'}
            </small>
          </div>
        </div>

        {/* Average Net Salary */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card accent-blue h-100 shadow-sm">
            <span className="form-label mb-1">Average Monthly Net</span>
            <h3 className="fw-bold mb-1 font-mono">
              {currencySymbol}{summary?.averageNetSalary?.toLocaleString('en-IN') || 0}
            </h3>
            <small className="text-muted">Across {summary?.totalRecords || 0} recorded months</small>
          </div>
        </div>

        {/* Total PF Accumulated */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card accent-violet h-100 shadow-sm">
            <span className="form-label mb-1">Total Provident Fund (PF)</span>
            <h3 className="fw-bold mb-1 font-mono" style={{ color: 'var(--color-accent)' }}>
              {currencySymbol}{summary?.totalPf?.toLocaleString('en-IN') || 0}
            </h3>
            <small className="text-muted">Retirement wealth contribution</small>
          </div>
        </div>

        {/* Total Tax (TDS) Paid */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card stat-card accent-amber h-100 shadow-sm">
            <span className="form-label mb-1">Total Tax / TDS Deducted</span>
            <h3 className="fw-bold mb-1 font-mono text-warning">
              {currencySymbol}{summary?.totalTax?.toLocaleString('en-IN') || 0}
            </h3>
            <small className="text-muted">Tax deducted at source</small>
          </div>
        </div>
      </div>

      {/* Salary Records Ledger */}
      <div className="card shadow-sm overflow-hidden">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center p-3 px-4 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h5 className="fw-bold mb-0">Salary History & Payslips</h5>
            <small className="text-muted">Detailed breakdown of gross earnings and deductions</small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Period & Employer</th>
                <th>Payment Date</th>
                <th className="text-end">Basic Salary</th>
                <th className="text-end">Allowances</th>
                <th className="text-end">Deductions (PF+Tax)</th>
                <th className="text-end">Net Take-Home</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {salaries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No salary statements logged yet. Click "Log Salary Statement" to begin.
                  </td>
                </tr>
              ) : (
                salaries.map((s) => (
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
                          <Building size={18} />
                        </div>
                        <div>
                          <div className="fw-bold">
                            {monthNames[s.month]} {s.year}
                          </div>
                          <small className="text-muted">{s.employer}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(s.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </small>
                    </td>
                    <td className="text-end font-mono">
                      {currencySymbol}{s.basicSalary?.toLocaleString('en-IN')}
                    </td>
                    <td className="text-end font-mono text-muted">
                      +{currencySymbol}{(s.grossSalary - s.basicSalary)?.toLocaleString('en-IN')}
                    </td>
                    <td className="text-end font-mono text-danger">
                      -{currencySymbol}{s.totalDeductions?.toLocaleString('en-IN')}
                    </td>
                    <td className="text-end font-mono fw-bold text-success fs-6">
                      {currencySymbol}{s.netSalary?.toLocaleString('en-IN')}
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <button
                          onClick={() => setSelectedSlip(s)}
                          className="btn btn-sm btn-outline-custom"
                          title="View Payslip"
                        >
                          <Eye size={15} />
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

      {/* Payslip Generator Modal */}
      {selectedSlip && (
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
          onClick={() => setSelectedSlip(null)}
        >
          <div
            className="card shadow-lg"
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: 'var(--bg-modal)',
              border: '1px solid var(--border-color)',
              padding: '2rem',
              borderRadius: 'var(--radius-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
              <div>
                <h4 className="fw-bold mb-0">Salary Statement & Payslip</h4>
                <small className="text-muted">
                  {monthNames[selectedSlip.month]} {selectedSlip.year} • {selectedSlip.employer}
                </small>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="btn btn-sm btn-outline-custom"
              >
                <X size={18} />
              </button>
            </div>

            {/* Payslip Header Info */}
            <div className="row g-3 p-3 rounded-3 mb-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="col-6">
                <small className="text-muted d-block">EMPLOYEE</small>
                <strong>{user?.name}</strong>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">DESIGNATION</small>
                <strong>{selectedSlip.designation || 'Software Professional'}</strong>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">PAYMENT DATE</small>
                <span>{new Date(selectedSlip.paymentDate).toLocaleDateString()}</span>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">PAYMENT METHOD</small>
                <span>{selectedSlip.paymentMethod}</span>
              </div>
            </div>

            {/* Two column Earnings vs Deductions */}
            <div className="row g-4 mb-4">
              {/* Earnings */}
              <div className="col-6">
                <h6 className="fw-bold text-success border-bottom pb-2">EARNINGS</h6>
                <div className="d-flex justify-content-between py-1 small">
                  <span>Basic Salary</span>
                  <span className="font-mono">{currencySymbol}{selectedSlip.basicSalary?.toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between py-1 small">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-mono">{currencySymbol}{selectedSlip.hra?.toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between py-1 small">
                  <span>Dearness Allowance (DA)</span>
                  <span className="font-mono">{currencySymbol}{selectedSlip.da?.toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between py-1 small">
                  <span>Special Allowance</span>
                  <span className="font-mono">{currencySymbol}{selectedSlip.specialAllowance?.toLocaleString('en-IN')}</span>
                </div>
                {selectedSlip.bonuses > 0 && (
                  <div className="d-flex justify-content-between py-1 small">
                    <span>Performance Bonus</span>
                    <span className="font-mono">{currencySymbol}{selectedSlip.bonuses?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between py-2 border-top fw-bold mt-2">
                  <span>GROSS EARNINGS</span>
                  <span className="font-mono">{currencySymbol}{selectedSlip.grossSalary?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="col-6">
                <h6 className="fw-bold text-danger border-bottom pb-2">DEDUCTIONS</h6>
                <div className="d-flex justify-content-between py-1 small">
                  <span>Provident Fund (PF)</span>
                  <span className="font-mono">{currencySymbol}{selectedSlip.pfDeduction?.toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between py-1 small">
                  <span>Income Tax / TDS</span>
                  <span className="font-mono">{currencySymbol}{selectedSlip.taxDeduction?.toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between py-1 small">
                  <span>Professional Tax</span>
                  <span className="font-mono">{currencySymbol}{selectedSlip.professionalTax?.toLocaleString('en-IN')}</span>
                </div>
                {selectedSlip.otherDeductions > 0 && (
                  <div className="d-flex justify-content-between py-1 small">
                    <span>Other Deductions</span>
                    <span className="font-mono">{currencySymbol}{selectedSlip.otherDeductions?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between py-2 border-top fw-bold mt-2 text-danger">
                  <span>TOTAL DEDUCTIONS</span>
                  <span className="font-mono">{currencySymbol}{selectedSlip.totalDeductions?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Net Pay Callout */}
            <div
              className="p-3 rounded-3 text-center mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
                border: '1px solid var(--color-success)'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>NET TAKE-HOME PAY</div>
              <h2 className="fw-bold text-success font-mono mb-0">
                {currencySymbol}{selectedSlip.netSalary?.toLocaleString('en-IN')}
              </h2>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button onClick={() => window.print()} className="btn btn-outline-custom">
                <Download size={16} /> Print / Save PDF
              </button>
              <button onClick={() => setSelectedSlip(null)} className="btn btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Salary Modal */}
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
            className="card shadow-lg"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-modal)',
              border: '1px solid var(--border-color)',
              padding: '2rem',
              borderRadius: 'var(--radius-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
              <h5 className="fw-bold mb-0">Record Monthly Salary Statement</h5>
              <button onClick={() => setShowAddModal(false)} className="btn btn-sm btn-outline-custom">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Employer / Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Google India, Infosys"
                    value={formData.employer}
                    onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Job Designation</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label">Month</label>
                  <select
                    className="form-select"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  >
                    {monthNames.slice(1).map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="col-4">
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label">Payment Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Earnings Inputs */}
              <h6 className="fw-bold text-success mt-4 mb-2">Earnings Components ({currencySymbol})</h6>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">Basic Salary *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="75000"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">HRA (House Rent Allowance)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="30000"
                    value={formData.hra}
                    onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Dearness Allowance (DA)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="15000"
                    value={formData.da}
                    onChange={(e) => setFormData({ ...formData, da: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Special Allowance</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="20000"
                    value={formData.specialAllowance}
                    onChange={(e) => setFormData({ ...formData, specialAllowance: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Bonuses</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={formData.bonuses}
                    onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Incentives</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={formData.incentives}
                    onChange={(e) => setFormData({ ...formData, incentives: e.target.value })}
                  />
                </div>
              </div>

              {/* Deductions Inputs */}
              <h6 className="fw-bold text-danger mt-4 mb-2">Deductions ({currencySymbol})</h6>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">Provident Fund (PF)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="9000"
                    value={formData.pfDeduction}
                    onChange={(e) => setFormData({ ...formData, pfDeduction: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Income Tax (TDS)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="12000"
                    value={formData.taxDeduction}
                    onChange={(e) => setFormData({ ...formData, taxDeduction: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Professional Tax</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="200"
                    value={formData.professionalTax}
                    onChange={(e) => setFormData({ ...formData, professionalTax: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Other Deductions</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={formData.otherDeductions}
                    onChange={(e) => setFormData({ ...formData, otherDeductions: e.target.value })}
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="d-flex justify-content-between mb-1">
                  <span>Gross Salary:</span>
                  <strong className="font-mono">{currencySymbol}{grossCalculated.toLocaleString('en-IN')}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1 text-danger">
                  <span>Total Deductions:</span>
                  <strong className="font-mono">-{currencySymbol}{deductionsCalculated.toLocaleString('en-IN')}</strong>
                </div>
                <div className="d-flex justify-content-between border-top pt-2 mt-2 fw-bold text-success fs-5">
                  <span>Net Take-Home Pay:</span>
                  <span className="font-mono">{currencySymbol}{netCalculated.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="autoTx"
                  checked={formData.alsoCreateTransaction}
                  onChange={(e) => setFormData({ ...formData, alsoCreateTransaction: e.target.checked })}
                />
                <label className="form-check-label small" htmlFor="autoTx">
                  Automatically log this net salary as an Income transaction in your ledger
                </label>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-3 fw-bold">
                Save & Record Salary
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salary;
