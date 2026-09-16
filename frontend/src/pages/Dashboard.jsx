import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { toast } from 'react-toastify';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [catData, setCatData] = useState({});
    
    // Quick Add Form
    const [showModal, setShowModal] = useState(false);
    const [quickTx, setQuickTx] = useState({ title: '', amount: '', type: 'expense', category: 'Food' });

    const fetchTransactions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/transactions', {
                headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
            });
            setTransactions(res.data);
            calculateSummary(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const calculateSummary = (data) => {
        let income = 0;
        let expense = 0;
        let categories = {};
        
        data.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else {
                expense += t.amount;
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            }
        });
        setSummary({ income, expense, balance: income - expense });
        setCatData(categories);
    };

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/transactions', quickTx, {
                headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
            });
            toast.success('Transaction logged!');
            setShowModal(false);
            setQuickTx({ title: '', amount: '', type: 'expense', category: 'Food' });
            fetchTransactions();
        } catch (err) {
            toast.error('Failed to add transaction');
        }
    };

    // Dummy data for Line Chart (Net Cash Flow)
    const lineData = {
        labels: ['W1', 'W2', 'W3', 'W4'],
        datasets: [{
            label: 'Net Cash Flow',
            data: [2000, 4500, 3200, summary.balance],
            borderColor: '#f5b041',
            backgroundColor: 'rgba(245, 176, 65, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#f5b041',
        }]
    };
    
    const lineOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { 
            x: { display: false }, 
            y: { display: false } 
        }
    };

    const doughnutData = {
        labels: Object.keys(catData),
        datasets: [{
            data: Object.values(catData),
            backgroundColor: ['#f5b041', '#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#1abc9c'],
            borderWidth: 0,
            cutout: '80%',
        }]
    };

    return (
        <div style={{ paddingBottom: '80px' }}>
            {/* Top Balance & Chart Section */}
            <div className="mb-4">
                <p className="text-muted small mb-1 text-uppercase fw-bold" style={{letterSpacing: '1px'}}>Net Cash Flow - This Month</p>
                <div className="d-flex align-items-center mb-2">
                    <h1 className="display-3 fw-bold mb-0 me-3 text-white">${summary.balance.toLocaleString()}</h1>
                    <span className="badge bg-success bg-opacity-25 text-success rounded-pill px-2 py-1">
                        <i className="bi bi-caret-up-fill"></i> 9% vs Last Month
                    </span>
                </div>
                
                <div style={{ height: '120px', width: '100%' }}>
                    <Line data={lineData} options={lineOptions} />
                </div>
            </div>
            
            {/* Income / Expense Stats */}
            <div className="row mb-4">
                <div className="col-6">
                    <div className="card p-3 border-0">
                        <p className="text-muted small mb-1">IN - THIS MONTH</p>
                        <h4 className="text-white fw-bold mb-2">${summary.income.toLocaleString()}</h4>
                        <div style={{ height: '3px', background: '#2ecc71', width: '100%', borderRadius: '2px' }}></div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="card p-3 border-0">
                        <p className="text-muted small mb-1">OUT - THIS MONTH</p>
                        <h4 className="text-white fw-bold mb-2">${summary.expense.toLocaleString()}</h4>
                        <div style={{ height: '3px', background: '#f5b041', width: '100%', borderRadius: '2px' }}></div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Visual Analytics Doughnut */}
                <div className="col-md-6 mb-4">
                    <div className="card p-4 h-100 position-relative">
                        <div className="row align-items-center h-100">
                            <div className="col-6 position-relative">
                                <Doughnut data={doughnutData} options={{ plugins: { legend: { display: false } } }} />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <p className="text-muted mb-0" style={{fontSize: '10px'}}>SPENT</p>
                                    <h6 className="fw-bold text-white mb-0">${summary.expense.toLocaleString()}</h6>
                                </div>
                            </div>
                            <div className="col-6">
                                {Object.entries(catData).slice(0, 4).map(([cat, amt], i) => (
                                    <div key={i} className="d-flex justify-content-between align-items-center mb-2 small">
                                        <div className="d-flex align-items-center">
                                            <div style={{width:'8px', height:'8px', borderRadius:'50%', backgroundColor: doughnutData.datasets[0].backgroundColor[i], marginRight:'8px'}}></div>
                                            <span className="text-white">{cat}</span>
                                        </div>
                                        <span className="text-muted">{Math.round((amt/summary.expense)*100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Insights & Alerts */}
                <div className="col-md-6 mb-4">
                    <div className="card p-4 h-100">
                        <div className="d-flex align-items-center mb-3">
                            <div className="rounded-circle d-flex justify-content-center align-items-center" style={{width:'40px', height:'40px', border:'2px solid #2ecc71'}}>
                                <span className="text-white fw-bold">82</span>
                            </div>
                            <div className="ms-3">
                                <h6 className="mb-0 text-white fw-bold">Health Score: Strong</h6>
                                <small className="text-success"><i className="bi bi-caret-up-fill"></i> 4 this month</small>
                            </div>
                        </div>
                        
                        <div className="p-3 rounded-3" style={{backgroundColor: '#262626', borderLeft: '3px solid #f5b041'}}>
                            <p className="text-white mb-1 fw-bold"><i className="bi bi-stars text-primary me-2"></i>AI Insight</p>
                            <p className="text-muted small mb-0">Your Dining expenses are 34% above average. Cap it at $520 to hit your Japan trip goal in March.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Activity / Transactions */}
            <div className="row">
                <div className="col-12">
                    <h5 className="fw-bold text-white mb-3 mt-2">Recent Activity</h5>
                    {transactions.length === 0 ? <p className="text-muted">No recent transactions.</p> : (
                        <div className="list-group list-group-flush bg-transparent">
                            {transactions.slice(0, 10).map(t => (
                                <div key={t._id} className="list-group-item bg-transparent border-bottom border-dark px-0 py-3 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-3 d-flex justify-content-center align-items-center text-white me-3" 
                                             style={{width: '45px', height: '45px', backgroundColor: t.type==='income'?'#2ecc71':'#333'}}>
                                            <i className={`bi ${t.type==='income'?'bi-arrow-down':'bi-cart'} fs-5`}></i>
                                        </div>
                                        <div>
                                            <h6 className="mb-0 text-white fw-bold">{t.title}</h6>
                                            <small className="text-muted">{t.category} • {new Date(t.date).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                    <h6 className={`mb-0 fw-bold ${t.type==='income'?'text-success':'text-white'}`}>
                                        {t.type==='income'?'+':'-'}${t.amount.toLocaleString()}
                                    </h6>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Floating Action Button (Gold) */}
            <button className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center" 
                    style={{ width: '65px', height: '65px', position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, fontSize: '28px', backgroundColor: '#f5b041', color: '#000' }}
                    onClick={() => setShowModal(true)}>
                <i className="bi bi-plus-lg"></i>
            </button>

            {/* Dark Fintech Quick Add Modal */}
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050, backdropFilter: 'blur(5px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 p-3 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="fw-bold text-white">Log Expense</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleQuickAdd}>
                                    <div className="text-center mb-4">
                                        <h1 className="display-4 text-white fw-bold">$<span className="text-muted">0</span></h1>
                                        <p className="small text-muted">Tap to enter amount</p>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-12 mb-3">
                                            <input type="number" className="form-control py-2 text-center fs-3 fw-bold" placeholder="Amount" required 
                                                value={quickTx.amount} onChange={e=>setQuickTx({...quickTx, amount: e.target.value})} style={{backgroundColor: 'transparent', borderBottom: '2px solid #f5b041', borderTop:'none', borderLeft:'none', borderRight:'none', borderRadius: 0}} />
                                        </div>
                                        <div className="col-12 mb-3">
                                            <input type="text" className="form-control py-2" placeholder="Merchant or Title" required 
                                                value={quickTx.title} onChange={e=>setQuickTx({...quickTx, title: e.target.value})} />
                                        </div>
                                        <div className="col-6">
                                            <select className="form-select py-2" value={quickTx.type} onChange={e=>setQuickTx({...quickTx, type: e.target.value})}>
                                                <option value="expense">Expense</option>
                                                <option value="income">Income</option>
                                            </select>
                                        </div>
                                        <div className="col-6">
                                            <input type="text" className="form-control py-2" placeholder="Category" required 
                                                value={quickTx.category} onChange={e=>setQuickTx({...quickTx, category: e.target.value})} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 rounded-pill py-3 fw-bold mt-2">Enter Amount</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
