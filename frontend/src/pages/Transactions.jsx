import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const fetchTransactions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/transactions', {
                headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
            });
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/transactions', {
                title, amount: Number(amount), type, category
            }, {
                headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
            });
            toast.success('Transaction added!');
            setTitle(''); setAmount(''); setType('expense'); setCategory('');
            fetchTransactions();
        } catch (err) {
            toast.error('Failed to add transaction');
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Delete this transaction?')) {
            try {
                await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
                    headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
                });
                toast.success('Deleted!');
                fetchTransactions();
            } catch (err) {
                toast.error('Failed to delete');
            }
        }
    };

    // Derived stats
    const totalIncome = transactions.filter(t=>t.type==='income').reduce((acc, t)=>acc+t.amount, 0);
    const totalExpense = transactions.filter(t=>t.type==='expense').reduce((acc, t)=>acc+t.amount, 0);
    const highestExpense = transactions.filter(t=>t.type==='expense').sort((a,b)=>b.amount-a.amount)[0]?.amount || 0;

    // Filtered list
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div style={{ paddingBottom: '100px' }}>
            {/* Top Header / Options Area */}
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="fw-bold text-white mb-1">Transaction History</h2>
                    <p className="text-muted mb-0">View, search, and manage all your financial records in one place.</p>
                </div>
                <button className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-none d-md-block" style={{color: '#000'}} data-bs-toggle="modal" data-bs-target="#addTxModal">
                    <i className="bi bi-plus-lg me-2"></i> New Entry
                </button>
            </div>

            {/* Top Summary Cards to increase layout/length */}
            <div className="row mb-5">
                <div className="col-md-4 mb-3 mb-md-0">
                    <div className="card border-0 rounded-4 p-4 shadow-lg h-100 position-relative overflow-hidden" style={{backgroundColor: '#1a1a1a'}}>
                        <div style={{position:'absolute', right:'-20px', top:'-20px', width:'100px', height:'100px', background:'rgba(46, 204, 113, 0.1)', borderRadius:'50%'}}></div>
                        <p className="text-muted small fw-bold mb-2"><i className="bi bi-graph-up-arrow text-success me-2"></i> TOTAL INCOME GENERATED</p>
                        <h2 className="fw-bold text-white mb-0">+₹{totalIncome.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="col-md-4 mb-3 mb-md-0">
                    <div className="card border-0 rounded-4 p-4 shadow-lg h-100 position-relative overflow-hidden" style={{backgroundColor: '#1a1a1a'}}>
                        <div style={{position:'absolute', right:'-20px', top:'-20px', width:'100px', height:'100px', background:'rgba(231, 76, 60, 0.1)', borderRadius:'50%'}}></div>
                        <p className="text-muted small fw-bold mb-2"><i className="bi bi-graph-down-arrow text-danger me-2"></i> TOTAL EXPENSES LOGGED</p>
                        <h2 className="fw-bold text-white mb-0">-₹{totalExpense.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 rounded-4 p-4 shadow-lg h-100 position-relative overflow-hidden" style={{backgroundColor: '#1a1a1a'}}>
                        <div style={{position:'absolute', right:'-20px', top:'-20px', width:'100px', height:'100px', background:'rgba(245, 176, 65, 0.1)', borderRadius:'50%'}}></div>
                        <p className="text-muted small fw-bold mb-2"><i className="bi bi-exclamation-triangle text-warning me-2"></i> HIGHEST SINGLE EXPENSE</p>
                        <h2 className="fw-bold text-white mb-0">₹{highestExpense.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            {/* Advanced Filters Bar */}
            <div className="card border-0 rounded-4 p-3 mb-4 shadow-lg" style={{backgroundColor: '#111', border: '1px solid #333 !important'}}>
                <div className="row g-3 align-items-center">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text border-0" style={{backgroundColor: '#262626', color: '#888'}}><i className="bi bi-search"></i></span>
                            <input type="text" className="form-control border-0 text-white" style={{backgroundColor: '#262626'}} placeholder="Search by merchant, title, or category..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <select className="form-select border-0 text-white" style={{backgroundColor: '#262626'}} value={filterType} onChange={e=>setFilterType(e.target.value)}>
                            <option value="all">All Types</option>
                            <option value="income">Income Only</option>
                            <option value="expense">Expense Only</option>
                        </select>
                    </div>
                    <div className="col-md-3 text-end">
                        <button className="btn btn-outline-light w-100 rounded-pill"><i className="bi bi-cloud-download me-2"></i> Export CSV</button>
                    </div>
                </div>
            </div>

            {/* Transactions Large Table */}
            <div className="card shadow-lg border-0 rounded-4 p-0 overflow-hidden" style={{backgroundColor: '#1a1a1a'}}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle table-borderless mb-0">
                        <thead style={{borderBottom: '1px solid #333', backgroundColor: '#111'}}>
                            <tr>
                                <th className="text-muted small py-3 px-4">TRANSACTION DETAILS</th>
                                <th className="text-muted small py-3">CATEGORY</th>
                                <th className="text-muted small py-3">DATE LOGGED</th>
                                <th className="text-muted small py-3 text-end">AMOUNT</th>
                                <th className="text-muted small py-3 text-center px-4">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(t => (
                                <tr key={t._id} style={{borderBottom: '1px solid #262626'}}>
                                    <td className="px-4 py-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle d-flex justify-content-center align-items-center me-3" style={{width: '40px', height: '40px', backgroundColor: t.type === 'income' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)', color: t.type === 'income' ? '#2ecc71' : '#e74c3c'}}>
                                                <i className={`bi ${t.type === 'income' ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold text-white mb-0">{t.title}</h6>
                                                <small className="text-muted">ID: {t._id.slice(-6).toUpperCase()}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge rounded-pill fw-normal" style={{backgroundColor: '#333', color: '#ccc', border: '1px solid #444'}}><i className="bi bi-tag me-1"></i>{t.category}</span></td>
                                    <td className="text-muted small">{new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                    <td className={`fw-bold text-end fs-5 ${t.type === 'income' ? 'text-success' : 'text-white'}`}>
                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                    </td>
                                    <td className="text-center px-4">
                                        <button className="btn btn-sm rounded-circle" onClick={() => handleDelete(t._id)} style={{backgroundColor: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c'}}>
                                            <i className="bi bi-trash3-fill"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr><td colSpan="5" className="text-center text-muted py-5 bg-transparent border-0"><i className="bi bi-inbox fs-1 d-block mb-3 opacity-50"></i>No transactions match your criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile FAB for Add */}
            <button className="btn btn-primary rounded-circle shadow-lg d-md-none" style={{ width: '60px', height: '60px', position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, fontSize: '24px', color: '#000' }} data-bs-toggle="modal" data-bs-target="#addTxModal">
                <i className="bi bi-plus-lg"></i>
            </button>

            {/* Add Transaction Modal */}
            <div className="modal fade" id="addTxModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4 border-0 shadow-lg" style={{backgroundColor: '#1a1a1a'}}>
                        <div className="modal-header border-0 pb-0">
                            <h5 className="fw-bold text-white mb-0">Record New Transaction</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-4">
                            <form onSubmit={(e) => { handleSubmit(e); document.querySelector('#addTxModal .btn-close').click(); }}>
                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold text-uppercase">Transaction Title</label>
                                    <input type="text" className="form-control border-0 py-2 text-white" style={{backgroundColor: '#262626'}} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Amazon Shopping" required />
                                </div>
                                <div className="row mb-4">
                                    <div className="col-6">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Amount (₹)</label>
                                        <input type="number" className="form-control border-0 py-2 text-white" style={{backgroundColor: '#262626'}} value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" required min="1" />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Type</label>
                                        <select className="form-select border-0 py-2 text-white" style={{backgroundColor: '#262626'}} value={type} onChange={e=>setType(e.target.value)}>
                                            <option value="expense">Out (Expense)</option>
                                            <option value="income">In (Income)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold text-uppercase">Category</label>
                                    <input type="text" className="form-control border-0 py-2 text-white" style={{backgroundColor: '#262626'}} value={category} onChange={e=>setCategory(e.target.value)} placeholder="e.g. Salary, Food, Utilities" required />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 rounded-pill py-3 text-dark fw-bold fs-5">Save Record</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
