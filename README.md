# 📊 Expense Tracker Pro with FinAI Copilot

[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.19-000000.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384.svg?style=flat-square&logo=chart.js)](https://www.chartjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> A modern, luxury dark fintech dashboard built for students and young professionals. Features an **interactive AI Financial Copilot**, live area charts, layered 3D virtual cards, automated budget threshold warnings, multi-currency formatting, and CSV export.

---

## 🌟 Key Highlights & Innovations

### 1. 🤖 FinAI Financial Copilot Agent
- **Conversational Financial Intelligence**:
  - Ask: *"How can I save $200 this month?"*
  - Ask: *"What is my highest expense category?"*
  - Ask: *"Can I afford a $150 textbook right now?"*
  - Ask: *"Predict my cashflow for next month"*
- **Natural Language Quick-Logging**:
  - Type natural statements like: `Spent $45 on groceries today` or `Received $600 scholarship`.
  - The AI parses the title, amount, type, category, and date, and provides an instant **"Add to Ledger"** button.
- **Financial Health Score**:
  - Real-time score (e.g. `92/100`) calculated from savings rate, budget utilization, and cash reserves.
- **Dual Engine**: Runs via Express REST endpoint (`/api/ai/chat`) with seamless client-side heuristics fallback for offline / Vercel hosting.

### 2. 🎨 Luxury Dark Fintech Interface
- **Left Vertical Sidebar Dock**:
  - Minimalist navigation with active glow indicator (Dashboard, Analytics, Charts, FinAI Copilot, Cards, Ledger, Calendar, Settings).
- **Top Header**:
  - Glass search bar with `⌘ + Space` keyboard badge.
  - Interactive notifications bell with live badge and popover.
  - Dynamic currency selector (**USD $**, **INR ₹**, **EUR €**, **GBP £**, **CAD CA$**, **AUD AU$**, **JPY ¥**).
  - User profile badge: **Ethan Reynolds (`@ethan_reynolds`)**.
- **Interactive Total Balance Area Chart**:
  - Timeframe switcher (`1 year`, `6 month`, `3 month`, `1 month`).
  - Glowing sunset orange spline curve with gradient fill.
  - Interactive highlight callout (`09 Dec, 2026 ↗ $9,780.90 USD`).
  - Timeline tracker with month milestones (`Sep`, `Oct`, `Nov`, `Dec`, `Jan`, `Feb`).
- **"My Cards" 3D Virtual Card Stack**:
  - Layered card tabs: Visa, Mastercard, and active carbon card with gold EMV chip, contactless symbol, and masked card numbers.
  - Quick action buttons: **`↘ Request`** (Add Income) and **`↗ Transfer`** (Add Expense).
  - Recent Transactions feed with custom avatars and formatted amounts.
- **Investments & Spending Bar Chart**:
  - Month-by-month bar chart with sort and month controls, highlighting the peak spending month in vibrant neon green (`$500`).
- **Monthly Budget Threshold Tracker**:
  - Editable monthly allowance with multi-tiered progress bar:
    - **Safe (<80%)**: Teal/Green on-track badge.
    - **Warning (80%–99%)**: Amber alert banner warning of approaching limits.
    - **Danger (≥100%)**: Pulsing red alert warning when budget has been exceeded with exact overage calculation.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite, Tailwind CSS |
| **Icons & Visuals** | Lucide React |
| **Data Visualizations** | Chart.js, React-Chartjs-2 |
| **AI Copilot** | FinAI Heuristics & Reasoning Model (`server/server.js` + client fallback) |
| **Backend Server** | Node.js, Express.js, CORS |
| **Data Persistence** | File-based JSON Database (`server/data/db.json`) + Browser `localStorage` |
| **Deployment** | Vercel (Frontend) / Node runtime (Full-stack) |

---

## 📁 Directory Structure

```text
c:\Project\
├── package.json              # Root package with concurrently dev scripts
├── vercel.json               # Configuration for instant Vercel deployment
├── .gitignore                # Git ignore rules for node_modules and builds
├── README.md                 # Project documentation and presentation guide
│
├── client/                   # Frontend React Application
│   ├── package.json          # Frontend dependencies (React 19, Vite, Chart.js, Tailwind)
│   ├── vite.config.js        # Vite config with Tailwind & proxy
│   ├── index.html            # Main HTML with Inter typography & favicon
│   └── src/
│       ├── main.jsx          # React application root
│       ├── App.jsx           # Dashboard coordinating state and modals
│       ├── index.css         # Dark theme styles, animations and scrollbars
│       ├── constants.js      # Categories, currencies, and demo transactions
│       ├── utils.js          # Currency formatters, date formatters, CSV exporter
│       ├── services/
│       │   └── api.js        # Dual-mode API client + AI Agent integration
│       └── components/
│           ├── Sidebar.jsx             # Left vertical navigation dock
│           ├── TopHeader.jsx           # Top header with search & profile
│           ├── BalanceChartCard.jsx    # Glowing area line chart with timeframes
│           ├── CardsWidget.jsx         # 3D cards stack, transfer buttons & feed
│           ├── AiAgentWidget.jsx       # Glowing FinAI copilot launch card
│           ├── InvestmentsBarChart.jsx # Bar chart with neon green peak month
│           ├── AiCopilotModal.jsx      # Interactive AI Agent chat & quick-log
│           ├── QuickTransferModal.jsx  # Instant transfer/request payment modal
│           ├── BudgetTracker.jsx       # Budget threshold warning manager
│           ├── SummaryCards.jsx        # Balance, Income, Expense, Savings metrics
│           ├── ExpenseChart.jsx        # Category Doughnut & Monthly Bar charts
│           ├── TransactionList.jsx     # Searchable, filterable ledger table
│           ├── EditModal.jsx           # Transaction edit modal popup
│           └── Toast.jsx               # Feedback notifications
│
└── server/                   # Backend Express REST API
    ├── server.js             # REST API routes, AI Agent endpoints, static hosting
    └── data/
        └── db.json           # Persistent JSON database (auto-created on start)
```

---

## 🚀 How to Run in Visual Studio Code

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [VS Code](https://code.visualstudio.com/)

### Step 1: Open the Project in VS Code
1. Open VS Code.
2. Select **File > Open Folder...** and choose `c:\Project`.
3. Open the integrated terminal (`Ctrl + ~` or **Terminal > New Terminal**).

### Step 2: Install Dependencies
```bash
# In the root folder:
npm install

# In the client folder:
cd client && npm install && cd ..

# In the server folder:
cd server && npm install && cd ..
```

### Step 3: Run Full-Stack (Both Frontend + Backend)
From the root directory, simply run:
```bash
npm run dev
```

This starts:
- 🌐 **Backend API:** `http://localhost:5000` (Express REST server + FinAI API)
- 💻 **Frontend App:** `http://localhost:5173` (Vite dev server)

Open your browser at **`http://localhost:5173`**.

---

## 📡 REST API & AI Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check to verify server status |
| `GET` | `/api/transactions` | Retrieve all transactions (supports `?category=`, `?month=`, `?type=`, `?search=`) |
| `POST` | `/api/transactions` | Add a new transaction (validates title, positive amount, type, date) |
| `PUT` | `/api/transactions/:id` | Update an existing transaction |
| `DELETE` | `/api/transactions/:id` | Delete transaction by ID |
| `GET` | `/api/cards` | Retrieve virtual cards list |
| `POST` | `/api/cards` | Add a new virtual card |
| `GET` | `/api/budget` | Get current monthly budget threshold and currency |
| `POST` | `/api/budget` | Update monthly budget limit |
| `GET` | `/api/summary` | Get aggregated financial summary metrics |
| `POST` | `/api/ai/chat` | FinAI Copilot chat reasoning and financial advice |
| `POST` | `/api/ai/parse-transaction` | Natural language to structured transaction parser |
| `POST` | `/api/seed` | Reset dataset to initial student demo records |
| `GET` | `/api/export/csv` | Download CSV export directly from server |

---

## 🌐 Deploying to Vercel (For Final Submission)

The project includes `vercel.json` configured for zero-setup Vercel deployment:

1. Push your repository to **GitHub**:
   ```bash
   git add .
   git commit -m "Update Expense Tracker with FinAI Copilot"
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository (`Adhii-x/Expense-Tracker`).
4. Keep the default settings (Framework Preset: **Vite**, Root Directory: **`./`**).
5. Click **Deploy**. Vercel will build the `client/` folder and deliver your live link!

---

## 🎓 Academic Viva / Project Defense Tips

When presenting this project to your evaluator or professor:
1. **Explain the Dual Architecture**: Highlight that the application implements modern client-server separation with a RESTful Express API while gracefully falling back to browser `localStorage` for offline / static Vercel hosting.
2. **Showcase the FinAI Copilot**:
   - Open the AI Assistant and click **"How can I save $200 this month?"** to demonstrate contextual financial reasoning.
   - Type a natural sentence like: `Spent $45 on textbooks today` -> show how the AI parses the title, amount, and category, and adds it to the ledger with 1 click.
3. **Demonstrate Input Validation**: Show that the form explicitly blocks negative amounts (e.g. entering `-20` triggers an immediate error), empty strings, and invalid dates.
4. **Showcase the Visual Threshold Warning**: In the Budget Tracker, lower the monthly limit below current spending (e.g. \$500) to demonstrate how the UI reacts with a pulsing red alert and overage notification.
5. **Demonstrate 3D Virtual Cards**: Click through the cards in the card stack and use the **"Transfer"** and **"Request"** buttons to log payments.
6. **Demonstrate Export to CSV**: Click "Export" to show how the app produces a clean `.csv` file for financial auditing in Excel or Google Sheets.
