import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success('Logged in successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Login failed');
        }
    };

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-5">
                <div className="card shadow border-0" style={{borderRadius: '15px'}}>
                    <div className="card-body p-5">
                        <h3 className="text-center mb-4 text-primary fw-bold">Welcome Back</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label text-muted">Email address</label>
                                <input type="email" className="form-control bg-light" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label text-muted">Password</label>
                                <input type="password" className="form-control bg-light" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 fw-bold">Login</button>
                        </form>
                        <p className="text-center mt-3 text-muted">Don't have an account? <Link to="/register">Register</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
