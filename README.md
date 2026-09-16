# Money Manager (MERN Stack)

A complete MERN (MongoDB, Express, React, Node.js) web application for personal finance management.

## Prerequisites
- Node.js installed
- MongoDB installed and running locally on `mongodb://127.0.0.1:27017`
  - (Alternatively, update the `MONGO_URI` in `backend/.env` with your MongoDB Atlas connection string)

## Setup Instructions

### 1. Backend Setup
1. Open terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   (Server will run on http://localhost:5000)

### 2. Frontend Setup
1. Open a **new** terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
   (App will be accessible at http://localhost:5173 or the port shown in the terminal)

## Features
- **Authentication**: Secure Login/Register using JWT and bcrypt.
- **Transactions**: Add, delete, and view Income/Expenses.
- **Dashboard**: Real-time calculated balances and interactive Pie charts (Chart.js) showing Income vs Expense.
- **Responsive UI**: Built with Bootstrap 5 and customized modern CSS for a premium look.

## Project Structure
- `backend/`: Node.js, Express, Mongoose API.
- `frontend/`: React, Vite, Axios, Chart.js.
