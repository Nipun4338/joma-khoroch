# Joma Khoroch - Personal Finance Manager 💰

A premium, smart personal finance tracker built with **Next.js**, **PostgreSQL**, and **Material UI**. This application helps you track daily expenses, manage budgets, and gain deep insights into your financial health.

## ✨ Recently Added Updates (v2.0) 🚀

We've recently overhauled the application with powerful new features and a modern aesthetic:

### 🧠 Smart Financial Intelligence

- **Velocity Budget Guide**: A smart advisor that analyzes your spending speed and tells you if you are "On Track", during "Caution", or in a "Critical" budget state.
- **Spending Forecast**: Predictive logic that calculates your expected month-end total based on current habits.
- **Category Analysis**: Automatic grouping of expenses to show you exactly where your money is going (e.g., Food, Rent, Grocery).
- **Advanced Visualization**: Upgraded charts to interactive Area Graphs with sleek gradients and dual-axis tracking for Income vs Expenses.

### 🎨 Premium UI/UX Modernization

- **Modern Design System**: Completely rebuilt using Material UI with a glassmorphism theme, premium typography (Inter), and sleek gradients.
- **Responsive Navigation**: Added a sticky, blurred header with direct access to your Dashboard and Insights.
- **Safety Checks**: Integrated confirmation dialogs for deleting entries to prevent accidental data loss.
- **Precision Formatting**: Standardized all currency to the Bangladesh standard (Taka symbol `৳`) with Indian digit grouping and 100% accurate 2-decimal math.

### 🔒 Security Enhancements

- **Bcrypt Authentication**: Switched to secure password hashing for all user accounts.
- **Improved Database Setup**: Updated `setup.sql` with pre-hashed default credentials for immediate secure login.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, Material UI, Chart.js
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL
- **Calculations**: Native JavaScript Number precision with `en-IN` locale formatting.

## 🚀 Getting Started

### 1. Database Setup

Run the `setup.sql` script in your PostgreSQL environment to create the necessary tables and initialize default data.

### 2. Configure Environment

Create a `.env.local` file in the root directory:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

PGSQL_USER=your_user
PGSQL_PASSWORD=your_password
PGSQL_HOST=localhost
PGSQL_PORT=5432
PGSQL_DATABASE=joma_khoroch
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 🔑 Default Credentials

- **Email**: `user@example.com`
- **Password**: `password123`
