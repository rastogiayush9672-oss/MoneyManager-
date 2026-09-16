import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div style={{ backgroundColor: '#0d0d0d', color: 'white', minHeight: '100vh', padding: '0', margin: '-24px -15px' }}>
            {/* Hero Section */}
            <div className="container py-5">
                <div className="row align-items-center min-vh-100">
                    <div className="col-md-6">
                        <div className="badge bg-primary text-dark rounded-pill px-3 py-2 mb-3 fw-bold">
                            ✨ AI Powered Financial Assistant
                        </div>
                        <h1 className="display-3 fw-bold mb-4" style={{ lineHeight: '1.2' }}>
                            Track Your Daily <br/>
                            <span className="text-primary">Finance</span> Manage <br/>
                            It Easiest Way
                        </h1>
                        <p className="text-muted mb-5 fs-5">
                            MoneyManager is a software as a service for multipurpose finance management system. Built for MCA Final Year students.
                        </p>
                        <div className="d-flex gap-3">
                            <Link to="/register" className="btn btn-primary rounded-pill px-4 py-3 fw-bold">Get Early Access</Link>
                            <Link to="/login" className="btn btn-outline-light rounded-pill px-4 py-3 fw-bold">Login</Link>
                        </div>
                        
                        <div className="mt-5 d-flex align-items-center gap-4 opacity-50">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-facebook me-2"></i>facebook</h5>
                            <h5 className="mb-0 fw-bold"><i className="bi bi-star-fill me-2"></i>Trustpilot</h5>
                            <h5 className="mb-0 fw-bold"><i className="bi bi-discord me-2"></i>DISCORD</h5>
                        </div>
                    </div>
                    
                    <div className="col-md-6 mt-5 mt-md-0 position-relative">
                        {/* Abstract glow */}
                        <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245,176,65,0.2) 0%, rgba(0,0,0,0) 70%)', zIndex: 0}}></div>
                        
                        <div className="card bg-dark border-secondary rounded-4 shadow-lg p-4 position-relative" style={{zIndex: 1}}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold m-0">Dashboard</h5>
                                <div className="d-flex gap-2">
                                    <div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#e74c3c'}}></div>
                                    <div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#f1c40f'}}></div>
                                    <div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#2ecc71'}}></div>
                                </div>
                            </div>
                            <div className="p-3 rounded-4 mb-3" style={{background: 'linear-gradient(135deg, #f5b041 0%, #e67e22 100%)', color: '#000'}}>
                                <p className="mb-1 fw-bold opacity-75">Available Balance</p>
                                <h2 className="fw-bold m-0">$24,500.00</h2>
                            </div>
                            <div className="row g-2">
                                <div className="col-6">
                                    <div className="bg-black p-3 rounded-3 text-center border border-secondary">
                                        <i className="bi bi-arrow-down-left text-success fs-4"></i>
                                        <h6 className="mt-2 mb-0 fw-bold">Income</h6>
                                        <small className="text-muted">$5,200</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="bg-black p-3 rounded-3 text-center border border-secondary">
                                        <i className="bi bi-arrow-up-right text-danger fs-4"></i>
                                        <h6 className="mt-2 mb-0 fw-bold">Expense</h6>
                                        <small className="text-muted">$1,850</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Floating mini card */}
                        <div className="card bg-black border-secondary rounded-4 shadow-lg p-3 position-absolute" style={{bottom: '-20px', left: '-40px', zIndex: 2, width: '220px'}}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-success bg-opacity-25 text-success rounded-circle d-flex justify-content-center align-items-center" style={{width:'40px', height:'40px'}}>
                                    <i className="bi bi-shield-check fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="m-0 fw-bold">Highly Secured</h6>
                                    <small className="text-muted">Bank-level encryption</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container py-5 my-5">
                <div className="text-center mb-5">
                    <h2 className="display-5 fw-bold">Manage Your Finance & Save Time</h2>
                    <p className="text-muted">We do the hard work so you don't have to.</p>
                </div>
                
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="card bg-dark border-secondary h-100 p-4 rounded-4 text-center">
                            <div className="bg-primary text-dark rounded-circle mx-auto d-flex justify-content-center align-items-center mb-4" style={{width:'60px', height:'60px'}}>
                                <i className="bi bi-person-plus-fill fs-3"></i>
                            </div>
                            <h4 className="fw-bold mb-3">Create Account</h4>
                            <p className="text-muted">Sign up in seconds and get instant access to your personalized financial dashboard.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card bg-dark border-secondary h-100 p-4 rounded-4 text-center">
                            <div className="bg-primary text-dark rounded-circle mx-auto d-flex justify-content-center align-items-center mb-4" style={{width:'60px', height:'60px'}}>
                                <i className="bi bi-link-45deg fs-3"></i>
                            </div>
                            <h4 className="fw-bold mb-3">Log Transactions</h4>
                            <p className="text-muted">Easily record your income and expenses to keep track of where your money goes.</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card bg-dark border-secondary h-100 p-4 rounded-4 text-center">
                            <div className="bg-primary text-dark rounded-circle mx-auto d-flex justify-content-center align-items-center mb-4" style={{width:'60px', height:'60px'}}>
                                <i className="bi bi-graph-up-arrow fs-3"></i>
                            </div>
                            <h4 className="fw-bold mb-3">AI Analytics</h4>
                            <p className="text-muted">Our built-in AI advisor analyzes your spending and gives smart budgeting tips.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <footer className="border-top border-secondary py-4 mt-5">
                <div className="container text-center">
                    <h5 className="fw-bold text-primary mb-3"><i className="bi bi-wallet2"></i> Money Manager</h5>
                    <p className="text-muted small">© 2026 Money Manager. Designed for MCA Final Year Project.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
