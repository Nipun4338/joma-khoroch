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

### 3. Google Sign-In (optional)

The dummy email/password login always works. To additionally enable **Sign in with Google**:

1. In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (type: Web application).
2. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-domain/api/auth/callback/google` (prod)
3. Put the client ID/secret in `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   # Restrict who can sign in with Google (comma-separated). Strongly
   # recommended for a finance app — leave empty to allow any Google account.
   ALLOWED_GOOGLE_EMAILS=you@gmail.com
   ```

The Google button appears on the sign-in page only when these are configured. Set the same variables in your **Vercel project env** for production.

### 4. Install & Run

```bash
npm install
npm run dev
```

### 🔑 Default Credentials

- **Email**: `user@example.com`
- **Password**: `password123`
