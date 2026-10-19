# 📊 Expense Tracker Pro — AI Financial Copilot

[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.19-000000.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384.svg?style=flat-square&logo=chart.js)](https://www.chartjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **Expense Tracker Pro — Your money, in focus.** An ultra-modern, luxury dark fintech dashboard engineered for students and young professionals. Features an interactive **AI Financial Copilot**, live 4-KPI analytics grid, month-stepper timeline, 3D cards, target savings goals, AI receipt vision OCR scanner, and full transaction history.

---

## 🎯 Modules & Architecture

### 1. 📊 Financial Analytics Module (`UNDERSTAND YOUR MONEY`)
Matches the exact 4-KPI analytics grid and data visualization layout:
- **Savings Rate (`↗`)**: Dynamic calculation of income retained vs. spent (e.g. `24.5%`).
- **Expense-to-Income (`↗`)**: Ratio of outflows to total monthly earnings (e.g. `75.5%`).
- **Top Expense (`🔥`)**: Automatic identification of your largest spending drain and total amount.
- **Expense Change (`↗`)**: Month-over-month change percentage comparison.
- **50/30/20 Budget Breakdown**: Visual gauges measuring Needs (50%), Wants (30%), and Savings (20%).
- **Interactive Chart.js Visuals**: Category Doughnut/Pie chart and Monthly Inflow vs Outflow bar charts.

### 2. 📑 Transaction History Module (`EVERY RUPEE, ACCOUNTED FOR`)
Matches the exact ledger management view:
- **Page Header**: Headline with `+ New transaction` action button.
- **Filter Toolbar Card**:
  - Subheader showing total matching transactions count + **`↓ Export CSV`** button.
  - Substring search input (`Search your transactions...`).
  - Sort dropdown (`Newest first`, `Oldest first`, `Amount: High to Low`, `Amount: Low to High`).
  - **`Clear filters`** reset button.
  - Category dropdown (`All categories`) & Type filter (`All types`, `Expenses only`, `Income only`).
- **Empty State**: Package icon with `No transactions found` message when zero records match filters.
- **Ledger Entries**: Color-coded category tags, formatted amounts (`+` green, `-` red), notes, edit modal, and delete actions.

### 3. 🛡️ WellthPlan 2.0 — AI Financial Health Score & Personal CFO
High-priority AI intelligence module that makes Expense Tracker deeply understand the user's financial life:
- **Dynamic 0–100 Health Score**: Comprehensive evaluation across 4 essential pillars (max 25 pts each):
  1. **Savings Rate (25 pts)**: Evaluates monthly income retained vs. burned.
  2. **Spending Habits (25 pts)**: Analyzes ratio of discretionary wants vs. essential needs.
  3. **Emergency Reserves (25 pts)**: Measures runway in months against sudden shocks.
  4. **Budget Adherence (25 pts)**: Tracks threshold utilization against monthly caps.
- **Explainable AI (XAI)**: Detailed breakdown explaining exactly why the score increased or decreased with explicit point deltas.
- **Interactive Multi-Horizon Trend Charting**: Visual historical tracking across **30, 90, and 180 days** powered by Chart.js.
- **Personal CFO Actionable Guidance**: Prioritized recommendations with potential point gain estimates (e.g. `+5 pts`, `+3 pts`).

### 4. 🧭 Modern Sidebar Dock
- **Brand Header**: Expense Tracker Pro trend icon with *"Your money, in focus."* tagline.
- **Navigation Items**:
  - `Dashboard` (LayoutGrid)
  - `Transactions` (FileText)
  - `Analytics` (BarChart2)
  - `Budgets` (Wallet)
  - `Settings` (Sliders)
  - `AI Copilot` (Bot / Sparkles)
- **Active Navigation Pill**: Glowing active pill with colored icon, bold label, and a **subtle white dot indicator on the right edge**.
- **Sidebar Motivational Card**: *"Make every rupee count. Small steps today. Big wins tomorrow."* (all transactions are recorded in INR).
- **Dark Appearance Toggle**: Interactive Moon icon toggle.
- **Collapsible Sidebar**: `< Collapse sidebar` toggle between full width (260px) and compact icon dock (80px).

### 4. 🔝 Global Top Bar Navigation
- **Date Subtitle**: `Friday, 16 October 2026` + dynamic page title.
- **Search Bar**: Quick transaction search input.
- **Month Stepper Selector**: `< 📅 Oct 2026 ⌄ >` with interactive `<` and `>` buttons to step month, and dropdown selector.
- **Notifications Bell**: Live unread indicator and notifications popover.
- **`+ Add transaction` Button**: Primary action button.
- **User Avatar**: Profile letter badge `T`.

### 5. 🤖 FinAI Financial Copilot Agent (Interactive Assistant)
- **Voice Dictation**: Microphone button in chat allowing voice speech-to-text input.
- **Natural Language Parsing**: Dictate or type *"Spent ₹450 on textbooks today"* — the AI extracts title, amount, category, date, and provides a 1-click **"Add to Ledger"** button.
- **Financial Health Score**: Live score calculated from net savings, cash reserves, and budget adherence.
- **Proactive Savings Strategies**: Analyzes top expense categories and provides tailored recommendations.

### 6. 📷 FinAI Vision Receipt OCR Scanner
- Scan receipts with simulated laser beam animation.
- Detects merchant, line items, tax, total, category, and date for 1-click approval.

### 7. 🎯 Target Savings Goals & 🔄 Recurring Subscriptions
- **Savings Goals**: Visual progress bars and quick deposits for milestones (MacBook Fund, Emergency Buffer, Hackathon Trip).
- **Subscriptions Manager**: Track recurring memberships (GitHub Copilot, Spotify, ChatGPT Plus, Gym) with AI cancellation tips.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite, Tailwind CSS 4 |
| **Icons** | Lucide React |
| **Data Visualizations** | Chart.js, React-Chartjs-2 |
| **AI Copilot** | FinAI Reasoning Model (`server/server.js` + client fallback) |
| **Backend API** | Node.js, Express.js, CORS |
| **Database / Storage** | File-based JSON Database (`server/data/db.json`) + Browser `localStorage` |
| **Deployment** | Vercel (Frontend) / Node runtime (Full-stack) |

---

## 📁 Directory Structure

```text
c:\Project\
├── package.json              # Root package with concurrently dev scripts
├── vercel.json               # Configuration for instant Vercel deployment
├── .gitignore                # Git ignore rules for node_modules and builds
├── README.md                 # Project documentation and viva guide
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
│       ├── services/api.js   # Dual-mode API client + AI Agent integration
│       └── components/
│           ├── Sidebar.jsx               # Collapsible navigation sidebar with active dot
│           ├── TopHeader.jsx             # Top header with month stepper & date
│           ├── AnalyticsView.jsx         # 4-KPI cards grid & charts (Photos 1 & 2)
│           ├── WellthPlanHealthScore.jsx # AI Financial Health Score 2.0 & Personal CFO
│           ├── TransactionsView.jsx      # Full transaction history view (Photos 3, 4, 5)
│           ├── DashboardView.jsx         # Balance chart, 3D cards stack, and widgets
│           ├── BudgetsView.jsx           # Budgets, savings goals & subscriptions
│           ├── SettingsView.jsx          # Preferences, demo data reload & CSV export
│           ├── BudgetBreakdown503020.jsx # 50/30/20 budget framework analysis
│           ├── AiCopilotModal.jsx        # AI Agent chat with voice dictation
│           ├── ReceiptScannerModal.jsx   # AI OCR receipt scanning simulation
│           ├── CommandPalette.jsx        # Command palette (⌘ + Space / Ctrl + K)
│           ├── QuickTransferModal.jsx    # Instant transfer/request payment modal
│           ├── EditModal.jsx             # Transaction edit modal popup
│           └── Toast.jsx                 # Feedback notifications
│
└── server/                   # Backend Express REST API
    ├── server.js             # REST API routes, AI Agent endpoints, static hosting
    └── data/
        └── db.json           # Persistent JSON database (auto-created on start)
```

---

## 🚀 How to Run in Visual Studio Code

### 1. Open the Project in VS Code
Open VS Code, select **File > Open Folder...**, and choose `c:\Project`.

### 2. Start Both Frontend and Backend (1 Command)
Open the integrated terminal in VS Code (`Ctrl + ~`) and run:
```bash
npm run dev
```

This starts:
- 🌐 **Backend API:** `http://localhost:5000` (Express REST server + AI API)
- 💻 **Frontend App:** `http://localhost:5173` (Vite dev server)

Open your browser at **`http://localhost:5173`**.

---

## 🌐 Deploying to Vercel (For Final Submission)

1. Push your repository to **GitHub**:
   ```bash
   git add .
   git commit -m "Update Expense Tracker project"
   git push origin main
   ```
2. Log into [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository (`Adhii-x/Expense-Tracker`).
4. Click **Deploy**. Vercel will build the `client/` folder and deliver your live link!
