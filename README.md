# PennyWise — AI-Powered Family Finance Management Platform

> *"Your Money. Your Family. Your Financial Clarity."*

PennyWise is a modern family personal finance platform designed with a **Private-by-Default** architecture. It separates private individual financial lives from shared family financial obligations, budgets, and goals.

---

## 🌟 Key Capabilities

1. **Private-by-Default Architecture**:
   - Personal bank accounts, salary details, and personal expenses remain completely private.
   - Household shared expenses, joint bills, and shared savings goals are visible to authorized family members.
   - 4 Role personas: **Family Admin**, **Finance Manager**, **Adult Member**, and **Dependent**.

2. **Automated Transaction Ingestion & NLP Parsing**:
   - Automated message parser for bank SMS, UPI alerts, and notifications.
   - Intelligent field extraction (amount, merchant, category, account, reference number).
   - Duplicate prevention with multi-field matching.

3. **Multi-Tier Budgeting & Alerts**:
   - Monthly family and personal budgets with category caps.
   - Real-time threshold alerts (50%, 75%, 80%, 90%, 100%, and excess).
   - Strict self-transfer exclusions that prevent balance transfers from inflating expenses or income.

4. **Loans, EMIs & Prepayment Simulator**:
   - Reducing-balance loan schedule tracking.
   - Interactive prepayment impact simulator calculating exact interest savings and tenure reductions.

5. **Multi-Contributor Savings Goals**:
   - Shared family milestones (Vacation, Emergency Fund, Education).
   - Multi-member contribution tracking with celebratory completion animations.

6. **PennyAI Financial Assistant**:
   - Conversational AI assistant providing spending pattern analysis, budget health evaluations, and financial Q&A.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 & TypeScript
  - Vite
  - Tailwind CSS
  - Recharts for financial analytics
  - Lucide Icons
  - SignalR client (`@microsoft/signalr`)
- **Backend**:
  - ASP.NET Core Web API (.NET 10/11)
  - C#
  - Entity Framework Core (In-Memory / SQL Server)
  - SignalR real-time hub
  - xUnit test suite for business & calculation verification

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [.NET 10 SDK or later](https://dotnet.microsoft.com/)

### 1. Running the Backend Web API
```bash
cd backend/PennyWise.API
dotnet run
```
*The API server will listen on `http://localhost:5191`.*
- Swagger / REST endpoints: `http://localhost:5191/api`
- SignalR real-time hub: `http://localhost:5191/hub/finance`

### 2. Running the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*The client application will run on `http://localhost:5173`.*

### 3. Running Unit Tests
```bash
cd backend/PennyWise.Tests
dotnet test
```

---

## 🔒 Security & Privacy Guarantees
- Individual salaries are strictly inaccessible to non-admin / non-permitted roles.
- Transfers between a user's own accounts are classified as self-transfers and never inflate income or expense metrics.
- Credit card bill settlements do not duplicate recorded card expenses.

---

## 📄 License
MIT License. Copyright © 2026 PennyWise Inc.
