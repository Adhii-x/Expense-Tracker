# 📊 Expense Tracker with Chart (Full-Stack Finance Dashboard)

> A modern, responsive Full-Stack Financial Dashboard built for students and young professionals to record income and expenses, monitor budget thresholds, and gain visual spending insights through interactive charts.

---

## 🎯 Project Overview & Objective

This project was built following the specification for **"09 Expense Tracker with Chart"**. It incorporates all required features, UI/UX criteria, bonus credits, and a dual-architecture that allows it to run seamlessly as a **Full-Stack REST Application** (Node.js/Express) or a **Standalone Client Application** (with browser `localStorage` persistence, ideal for Vercel static deployment).

### Target Audience
Students, fresh graduates, and young professionals seeking an intuitive tool to budget their allowances, salaries, freelance earnings, textbooks, transit, and living expenses.

---

## ✨ Features Implemented

### 1. Must-Have Requirements
- **Transaction Entry Form:**
  - Record `title`, `amount`, `type` (Income / Expense), `category`, and `date`.
  - Automatic category switching based on Income or Expense selection.
  - Optional `notes` field for memos or receipt tags.
- **Summary Financial Metric Cards:**
  - **Total Balance**: Live net cash flow with positive/negative color indicators.
  - **Total Income**: Green card displaying total earnings and source counts.
  - **Total Expenses**: Rose card displaying total deductions and item counts.
  - **Savings Rate (%)**: Dynamic calculation of income retained vs. spent.
- **Transaction Management (Edit & Delete):**
  - **Edit Modal**: Update any existing entry with pre-populated form fields and instant validation.
  - **Delete Action**: Safe deletion with user confirmation prompt to prevent accidental loss.
- **Real-Time Filtering & Search:**
  - **Filter by Month**: Dynamically populated list of all recorded months (e.g., *Oct 2026*, *Sep 2026*) or *All Months*.
  - **Filter by Category**: Quick drilldown into specific expense or income categories.
  - **Filter by Type**: Toggle between *All Types*, *Expenses Only*, or *Income Only*.
  - **Live Search**: Instant substring search across titles, categories, and notes.
  - **Sorting**: Sort by Date (Newest/Oldest) or Amount (Highest/Lowest).
- **Interactive Data Visualizations (Chart.js):**
  - **Category Breakdown (Doughnut / Pie Chart)**: Visual slice per category with tooltips showing currency values and percentage shares.
  - **Monthly Income vs. Expense (Bar Chart)**: Dual side-by-side bar comparison per calendar month.
  - Responsive canvas layout adapting cleanly to mobile, tablet, and desktop viewports.
- **Data Persistence:**
  - **Browser `localStorage`**: Zero-configuration local persistence ensuring records survive browser refreshes.
  - **Express REST API + JSON Database**: Full-stack backend mode for local development and database storage.

### 2. UI & UX Polish
- **Strict Input Validation**:
  - Rejects empty or whitespace-only titles.
  - Disallows negative or zero amounts (strictly requires $> 0$).
  - Validates date formats and category selections.
  - Descriptive inline red error messages beneath each input.
- **Dynamic Multi-Currency Formatter**:
  - Switch on the fly between **USD ($)**, **INR (₹)**, **EUR (€)**, **GBP (£)**, **CAD (CA$)**, **AUD (AU$)**, and **JPY (¥)**.
- **Responsive Layout**:
  - Built with Tailwind CSS. Flexbox and CSS Grid adapt from small mobile screens to ultra-wide desktop monitors.

### 3. Bonus Features (Extra Credit)
- 📥 **Export to CSV**: Download complete transaction ledger as a spreadsheet-compatible `.csv` file with a single click.
- 🎯 **Monthly Budget Limit with Multi-Tier Warning System**:
  - Set a custom monthly budget limit (e.g., \$1,500).
  - Live animated progress bar displaying % used.
  - **Safe (< 80%)**: Teal/Green on-track badge.
  - **Warning (80% - 99%)**: Amber alert banner warning of approaching limits.
  - **Danger (≥ 100%)**: Pulsing red alert warning when budget has been exceeded with exact overage calculation.
- 🌙 **Dark Mode / Light Mode**:
  - Full dark theme toggle with persistent user preference in `localStorage`.
- ⚡ **One-Click Demo Data Loader**:
  - "Demo Data" button to instantly populate realistic student transactions for evaluator presentations.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React (Icons) |
| **Data Visualization** | Chart.js, React-Chartjs-2 |
| **Backend API** | Node.js, Express.js, CORS |
| **Database / Storage** | File-based JSON Database (`server/data/db.json`) + Browser `localStorage` |
| **Deployment** | Vercel (Frontend) / Node runtime (Full-stack) |

---

## 📁 Project Directory Structure

```text
c:\Project\
├── package.json              # Root package with concurrently dev scripts
├── vercel.json               # Configuration for instant Vercel deployment
├── .gitignore                # Git ignore rules for node_modules and builds
├── README.md                 # Project documentation and presentation guide
│
├── client/                   # Frontend React Application
│   ├── package.json          # Frontend dependencies (React, Vite, Chart.js, Tailwind)
│   ├── vite.config.js        # Vite config with Tailwind plugin & backend API proxy
│   ├── index.html            # Main HTML with Inter typography & favicon
│   └── src/
│       ├── main.jsx          # React application root
│       ├── App.jsx           # Main Dashboard coordinating state and layout
│       ├── index.css         # Tailwind CSS imports and scrollbar styles
│       ├── constants.js      # Categories, currencies, and demo data
│       ├── utils.js          # Currency formatters, date formatters, CSV generator
│       ├── services/
│       │   └── api.js        # Dual-mode API client (REST API + localStorage fallback)
│       └── components/
│           ├── Navbar.jsx          # Top navigation with currency, dark mode & demo loader
│           ├── SummaryCards.jsx    # Metric cards (Balance, Income, Expenses, Savings)
│           ├── BudgetTracker.jsx   # Budget limit manager & warning thresholds
│           ├── TransactionForm.jsx # Add transaction form with validation
│           ├── ExpenseChart.jsx    # Interactive Doughnut & Bar charts
│           ├── TransactionList.jsx # Filterable, searchable, sorted ledger table
│           ├── EditModal.jsx       # Transaction edit modal popup
│           └── Toast.jsx           # Temporary alert feedback notifications
│
└── server/                   # Backend Express REST API
    ├── package.json          # Backend dependencies (Express, CORS)
    ├── server.js             # REST API routes, validation, and static hosting
    └── data/
        └── db.json           # Persistent JSON database (auto-created on run)
```

---

## 🚀 How to Run in Visual Studio Code

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [VS Code](https://code.visualstudio.com/)

### Step 1: Open the Project in VS Code
1. Open VS Code.
2. Select **File > Open Folder...** and choose `c:\Project` (or your project directory).
3. Open the integrated terminal (`Ctrl + ~` or **Terminal > New Terminal**).

### Step 2: Install Dependencies (if not already installed)
Run the following in the terminal:
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
This runs `concurrently` which executes:
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

Open your browser and navigate to **`http://localhost:5173`**.

> 💡 **Dual-Mode Feature**: In the top navigation bar, you will see a badge indicating **`🟢 REST API Synced`**. If you ever run just the frontend without the backend, the app automatically switches to **`⚡ Browser LocalStorage`** without breaking!

---

## 🌐 Deploying to Vercel (For Final Submission)

The project includes `vercel.json` configured for zero-setup Vercel deployment:

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Expense Tracker with Chart"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Keep the default settings (Framework Preset: **Vite**, Root Directory: **`./`**).
5. Click **Deploy**. Vercel will build the `client/` folder and deliver your live link!

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check to verify server status |
| `GET` | `/api/transactions` | Retrieve all transactions (supports `?category=`, `?month=`, `?type=`, `?search=`) |
| `POST` | `/api/transactions` | Add a new transaction (validates title, positive amount, type, date) |
| `PUT` | `/api/transactions/:id` | Update an existing transaction |
| `DELETE` | `/api/transactions/:id` | Delete transaction by ID |
| `GET` | `/api/budget` | Get current monthly budget threshold and currency |
| `POST` | `/api/budget` | Update monthly budget limit |
| `GET` | `/api/summary` | Get aggregated financial summary metrics |
| `POST` | `/api/seed` | Reset dataset to initial student demo records |
| `GET` | `/api/export/csv` | Download CSV export directly from server |

---

## 🎓 Academic Viva / Project Defense Tips

When presenting this project to your evaluator or professor:
1. **Explain the Dual Architecture**: Highlight that the application implements modern client-server separation with a RESTful Express API while gracefully falling back to browser `localStorage` for offline / static Vercel hosting.
2. **Demonstrate Input Validation**: Show that the form explicitly blocks negative amounts (e.g. entering `-20` triggers an immediate error), empty strings, and invalid dates.
3. **Showcase the Visual Threshold Warning**: In the Budget Tracker, lower the monthly limit below current spending (e.g. \$500) to demonstrate how the UI reacts with a pulsing red alert and overage notification.
4. **Demonstrate Data Visuals**: Toggle between the **Category Doughnut Chart** (showing percentages and legends) and the **Monthly Comparison Bar Chart** (showing side-by-side income vs. expense bars).
5. **Demonstrate Export to CSV**: Click "Export CSV" to show how the app produces a clean `.csv` file for financial auditing in Excel or Google Sheets.
