import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'What do you want to know about your money? I can suggest plans for Stocks, Mutual Funds, LIC, FDs, or general saving tips.' }
    ]);
    const [input, setInput] = useState('');

    const getBotResponse = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('stock') || lower.includes('market')) {
            return "Stocks offer high returns but carry high risk. Consider investing in Nifty 50 Index funds or blue-chip stocks like Reliance or TCS for long-term growth.";
        } else if (lower.includes('lic') || lower.includes('insurance')) {
            return "LIC Jeevan Anand or Term Life Insurance is great for risk-free saving and life cover. It provides assured returns and tax benefits under 80C.";
        } else if (lower.includes('mutual fund') || lower.includes('sip')) {
            return "A Systematic Investment Plan (SIP) in mutual funds is the best way to compound wealth. Start with an index fund or flexi-cap fund for steady 12-15% returns.";
        } else if (lower.includes('save') || lower.includes('saving')) {
            return "A good rule of thumb is the 50/30/20 rule: 50% for Needs, 30% for Wants, and 20% for Savings & Investments.";
        } else if (lower.includes('fd') || lower.includes('fixed deposit')) {
            return "Fixed Deposits are very safe and offer 7-8% returns currently. Good for emergency funds, but they may not beat inflation in the long run.";
        } else {
            return "I can see your July analytics: $6,240 in, $3,878 out. Ask me 'Can I afford a flight?' or 'Why was July expensive?'.";
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if(!input.trim()) return;

        const userMsg = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'bot', text: getBotResponse(input) }]);
        }, 600);
        
        setInput('');
    };

    return (
        <>
            <div className={`chatbot-window shadow-lg ${isOpen ? 'open' : ''}`}>
                <div className="chatbot-header p-3 d-flex justify-content-between align-items-center" style={{backgroundColor: '#111', borderBottom: '1px solid #333'}}>
                    <div className="d-flex align-items-center">
                        <div className="bg-primary rounded-3 d-flex justify-content-center align-items-center me-2" style={{width:'30px', height:'30px'}}>
                            <i className="bi bi-robot text-dark"></i>
                        </div>
                        <h6 className="m-0 fw-bold text-white">Ask Sikka AI</h6>
                    </div>
                    <button className="btn-close btn-close-white" onClick={() => setIsOpen(false)}></button>
                </div>
                <div className="chatbot-body p-3" style={{ height: '350px', overflowY: 'auto', backgroundColor: '#1a1a1a' }}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`mb-3 d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div className={`p-3 rounded-4 shadow-sm ${msg.sender === 'user' ? 'text-dark' : 'text-white border'}`} 
                                 style={{ maxWidth: '85%', fontSize: '0.9rem', backgroundColor: msg.sender === 'user' ? '#f5b041' : '#262626', borderColor: '#333' }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="chatbot-footer p-2 border-top" style={{backgroundColor: '#111', borderColor: '#333 !important'}}>
                    <form onSubmit={handleSend} className="d-flex">
                        <input type="text" className="form-control rounded-pill me-2 border-0 text-white" 
                               style={{backgroundColor: '#262626'}} placeholder="Ask about stocks, LIC..." value={input} onChange={e => setInput(e.target.value)} />
                        <button type="submit" className="btn btn-primary rounded-circle d-flex justify-content-center align-items-center" style={{width:'40px', height:'40px'}}>
                            <i className="bi bi-arrow-up text-dark fw-bold"></i>
                        </button>
                    </form>
                </div>
            </div>

            <button className="chatbot-toggle shadow-lg rounded-circle" onClick={() => setIsOpen(!isOpen)} style={{backgroundColor: '#262626', border: '1px solid #444'}}>
                <i className={`bi fs-3 ${isOpen ? 'bi-x text-white' : 'bi-stars text-primary'}`}></i>
            </button>
        </>
    );
};

export default Chatbot;
