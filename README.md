# 💎 MoneyManager AI Enterprise — Advanced Personal Finance & Salary Platform

> **Final Major MCA Academic Project**  
> An intelligent, full-stack MERN financial ecosystem featuring salary slip generation, smart budgeting, goal trackers, subscription monitors, asset & net worth accounting, grounded zero-hallucination AI advisory, and complete fiscal reporting.

---

## 🌟 Key Highlights & Academic Innovations

- 🧠 **Grounded AI Financial Advisor (Sikka AI)**: Dual-engine deterministic financial advisor + optional Google Gemini integration with 16 strict computational tools guaranteeing zero hallucination.
- 💼 **Salary & Payslip Engine**: Full Indian corporate salary structure breakdown (Basic, HRA, DA, Special Allowances, PF, Tax, PT) with auto-generated downloadable/printable salary slips.
- 🎯 **Visual Savings Goals**: Goal milestone tracking with interactive progress bars, deposit logging, and confetti celebration animations upon completion.
- 📊 **Smart Category Budgets**: Real-time threshold monitoring with dynamic color badges (Normal < 70%, Warning 70-90%, Overspent > 90%).
- 🔁 **Recurring Subscriptions & Commitments**: Tracks monthly and annual burn rate with active renewal alerts.
- 🏦 **Net Worth & Asset Accounting**: Liquid, investment, real estate assets vs. revolving debt & loans with debt-to-asset safety ratios.
- 🧮 **10 Built-in Financial Calculators**: SIP, Lump Sum, EMI, Fire/Retirement, PPF, Compound Interest, Salary Take-home, Emergency Fund, Credit Card Payoff, and Inflation.
- 📄 **Printable Financial Statements**: Date-filtered transaction ledgers with summary metrics and print/PDF export styling.
- 📥 **CSV Bulk Operations**: Export transactions to CSV and import bulk CSV records.
- 🌓 **Dynamic Theme Engine**: Seamless toggle between Dark, Light, and System themes with Stripe/Linear fintech styling.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Bootstrap 5 + Fintech Custom Design System (CSS Variables)
- **Icons**: Lucide React
- **Data Visualization**: Chart.js + React-Chartjs-2
- **Feedback & Effects**: React-Toastify + Canvas Confetti
- **State & Routing**: React Router v6 + Context API (Auth, Theme, Notifications)

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB & Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & BcryptJS password hashing
- **File Management**: Multer static storage for payslips and receipts
- **AI Engine**: Grounded Tool Calling Engine + Google Generative AI (`@google/generative-ai`)

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)

---

### Option A: 1-Click Launch (Recommended for Windows)
Simply double-click the launcher in the root directory:
```text
start_project.bat
```
This automatically boots:
1. Backend on `http://localhost:5000`
2. Frontend Vite server on `http://localhost:5173`
3. Opens your browser directly to the application

---

### Option B: Manual Setup

#### 1. Backend Setup
```bash
cd backend
npm install
node server.js
```
*Backend will run on `http://localhost:5000`.*

#### 2. Seed Database with Realistic Demo Data (Optional but Recommended)
```bash
cd backend
node enrichSeed.js
```
*This enriches demo accounts with salaries, budgets, goals, transactions, and net worth records.*

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend will run on `http://localhost:5173`.*

---

## 🔑 Demo Login Credentials

The platform includes verified demo accounts populated with complete academic data:

| User Name | Email Address | Password |
| :--- | :--- | :--- |
| **Madhav Mishra** (Full Data & Slips) | `madhav@test.com` | **`123456`** |
| **Ayush Rastogi** | `rastogiayush9672@gmail.com` | **`123456`** |
| **Prince Sharma** | `prince@test.com` | **`123456`** |

> ⚡ *Pro Tip:* On the login screen, click **"⚡ 1-Click Login"** to jump straight into the Dashboard!

---

## 📁 Repository Structure

```text
MoneyManager/
├── backend/
│   ├── middleware/
│   │   └── auth.js                     # JWT authorization guard
│   ├── models/
│   │   ├── User.js                     # User profile, currency, theme preferences
│   │   ├── Transaction.js              # Incomes & expenses with categories & methods
│   │   ├── Salary.js                   # CTC, allowances, deductions & payslips
│   │   ├── Budget.js                   # Monthly budgets and threshold limits
│   │   ├── Goal.js                     # Savings targets and contribution logs
│   │   ├── Subscription.js             # Recurring services and billing cycles
│   │   ├── AssetLiability.js           # Net worth tracking (assets vs liabilities)
│   │   ├── Notification.js             # In-app notifications & alerts
│   │   └── ChatMessage.js              # AI chat history and snapshots
│   ├── routes/
│   │   ├── auth.js                     # Auth, profile, password, and export
│   │   ├── transactions.js             # CRUD, bulk operations & CSV import/export
│   │   ├── salary.js                   # Salary recording, summary & slips
│   │   ├── budgets.js                  # Budget CRUD and status comparison
│   │   ├── goals.js                    # Goal CRUD and deposit actions
│   │   ├── subscriptions.js            # Subscription management and burn rate
│   │   ├── assetsLiabilities.js        # Net worth calculations
│   │   ├── analytics.js                # Cash flow, monthly stats & health score
│   │   ├── notifications.js            # Alert center & unread counts
│   │   └── ai.js                       # Sikka AI Grounded Finance Assistant
│   ├── services/
│   │   ├── financeEngine.js            # 16 grounded tools for factual data
│   │   └── aiService.js                # Dual-mode AI advisory logic
│   ├── enrichSeed.js                   # Academic data generation utility
│   ├── testAllModules.js               # Comprehensive 8-suite test script
│   ├── updatePasswords.js              # Password synchronization utility
│   ├── server.js                       # Express application entrypoint
│   └── .env.example                    # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx              # Responsive sidebar & header navigation
│   │   │   ├── Chatbot.jsx             # Floating AI Financial Assistant widget
│   │   │   └── QuickAddModal.jsx       # Global transaction shortcut modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # User state, JWT cookie, and profile management
│   │   │   ├── ThemeContext.jsx        # Dark/Light theme provider
│   │   │   └── NotificationContext.jsx # Real-time notification sync
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx           # Main executive overview
│   │   │   ├── Salary.jsx              # Salary structures & printable payslips
│   │   │   ├── Income.jsx              # Income analytics and entry
│   │   │   ├── Expenses.jsx            # Categorized expenses and trends
│   │   │   ├── Transactions.jsx        # Advanced ledger with filters and CSV tools
│   │   │   ├── Budgets.jsx             # Category budgets and burn limits
│   │   │   ├── Goals.jsx               # Savings targets with confetti triggers
│   │   │   ├── Subscriptions.jsx       # Monthly recurring commitments
│   │   │   ├── NetWorth.jsx            # Balance sheet: Assets vs Liabilities
│   │   │   ├── Calculators.jsx         # 10 Interactive financial calculators
│   │   │   ├── AIAssistant.jsx         # Dedicated full-page AI advisory suite
│   │   │   ├── Reports.jsx             # Printable financial statements
│   │   │   ├── Settings.jsx            # User profile, currency, and data export
│   │   │   ├── LandingPage.jsx         # Modern fintech marketing landing page
│   │   │   ├── Login.jsx               # Quick demo login portal
│   │   │   └── Register.jsx            # Account onboarding
│   │   ├── utils/
│   │   │   └── api.js                  # Axios client with proxy & fallback retry
│   │   ├── App.jsx                     # Route architecture & ErrorBoundary
│   │   └── index.css                   # Custom Linear/Stripe design tokens
│   ├── vite.config.js                  # Vite dev server with reverse proxy
│   └── package.json
├── start_project.bat                   # 1-click startup automation
└── README.md                           # Project documentation
```

---

## 🧪 System Verification

To run an automated verification across all 8 backend financial modules:
```bash
cd backend
node testAllModules.js
```
Expected output:
```text
=== ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY! ===
✓ Authentication & Token Acquisition
✓ Analytics Overview & Health Score
✓ Salary Management & Calculation
✓ Budget Utilization
✓ Savings Goal Progress
✓ Subscription Burn Rate
✓ Net Worth Accounting
✓ Grounded AI Finance Tool Execution
```

---

## 📄 Academic Project Attribution
- **Degree**: Master of Computer Applications (MCA)
- **Domain**: Web Technologies, Full-Stack Software Engineering, Financial Technology (FinTech), Applied AI
- **Repository**: MoneyManager MERN Full-Stack Enterprise Platform
