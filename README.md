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
| **Database / Storage** | PostgreSQL (`pg`) with automatic import from `server/data/db.json`; JSON fallback + Browser `localStorage` |
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
│       ├── constants.js      # Categories and demo transactions
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
    ├── database.js           # PostgreSQL schema, data access, and JSON import
    ├── .env.example          # PostgreSQL connection configuration template
    └── data/
        └── db.json           # Persistent JSON database (auto-created on start)
```

---

## 🚀 How to Run in Visual Studio Code

### 1. Open the Project in VS Code
Open VS Code, select **File > Open Folder...**, and choose `c:\Project`.

### 2. Start Both Frontend and Backend (1 Command)
Open the integrated terminal in VS Code (`Ctrl + ~`) and run:

To use PostgreSQL, create a database named `expense_tracker` (for example, with
`createdb expense_tracker`), copy `server/.env.example` to `server/.env` using
PowerShell (`Copy-Item server\\.env.example server\\.env`), and set
`DATABASE_URL` to your local or hosted PostgreSQL connection string. On startup,
the server creates its tables and imports the existing `server/data/db.json`
data once if the database is empty. Keep `server/.env` private and never commit
database credentials.

If `DATABASE_URL` is not set, the backend continues using `server/data/db.json`.

```bash
npm run dev
```

This starts:
- 🌐 **Backend API:** `http://localhost:5000` (Express REST server + AI API)
- 💻 **Frontend App:** `http://localhost:5173` (Vite dev server)

Open your browser at **`http://localhost:5173`**.

---

## 🌐 Deploying to Vercel (For Final Submission)

> **Security status:** The demo financial data remains shared. In authenticated
> mode, the server blocks financial APIs until per-user storage is implemented.
> Production startup now fails closed in `server/config/env.js`. Do not bypass
> that guard or expose the demo API publicly. The authentication schema in
> `server/db/schema.sql` is a foundation. Local email/password registration,
> login, logout, and session lookup are implemented; provider OAuth, email
> verification/reset delivery, and user-owned financial storage are not.

The Vercel frontend-only demo can still be deployed for a presentation, but it
must not be described as a multi-user or production financial service. The
backend must remain private until the per-user data migration and authorization
work is complete. Existing `server/data/db.json` records remain demo data and
must not be assigned automatically to a new account.

### Authentication database foundation

Back up PostgreSQL before applying any schema. To apply the additive auth schema
manually, run `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f server/db/schema.sql`.
The schema creates identity, session, token, MFA, passkey, and audit tables; it
does not change or migrate the legacy financial tables. Rollback requires a
separate backup because dropping auth tables would permanently remove accounts
and security history.

Before production authentication can be enabled, implement and test a migration
that assigns existing records only through an explicit, user-confirmed import,
then add `user_id` ownership and authorization to every financial operation.
Never migrate the existing shared demo ledger into the first account by default.

`server/.env.example` lists intended provider settings. Blank OAuth, SMTP, SMS,
and WebAuthn values mean those integrations are unavailable; this code does not
fake successful sign-ins. Use HTTPS, provider-registered callback URLs, a
dedicated PostgreSQL database, a secret manager, and backups when the missing
auth implementation is completed.

The backend defaults to `AUTH_MODE=authenticated`. Set `AUTH_MODE=demo` only
for local sample-data development. The backend rejects `NODE_ENV=production`
until isolated financial storage and the remaining production controls are
implemented.

### Authentication UI mode

The sign-in and account-security experience is the default UI. Set
`VITE_AUTH_MODE=demo` in `client/.env.local` to show the existing sample
dashboard. Setting `VITE_AUTH_MODE=authenticated` explicitly also shows the
sign-in experience and keeps the shared demo ledger out of that mode. Vite variables are public;
never place provider secrets, session keys, or database credentials in the
client environment. The forms use `/api/auth/*` routes backed by Argon2id
password hashes and HTTP-only sessions. If `DATABASE_URL` is set, accounts and
sessions use PostgreSQL; without it, development uses temporary in-memory
accounts and sessions that are lost when the server restarts. Social buttons
remain disabled until provider callbacks and account linking are implemented.
Adding credentials alone does not enable OAuth login.

#### Google, GitHub, Microsoft, and Apple OAuth credentials

The backend template at `server/.env.example` now contains the credential names
and local callback URLs. Copy it to `server/.env`, then fill values issued by
each provider. Do not send credentials through chat or commit `server/.env`.

| Provider | Create credentials in | Local callback to register |
| --- | --- | --- |
| Google | [Google Cloud OAuth web application](https://developers.google.com/identity/protocols/oauth2/web-server) | `http://localhost:5000/api/oauth/google/callback` |
| GitHub | [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) | `http://localhost:5000/api/oauth/github/callback` |
| Microsoft | [Microsoft Entra app registration](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-redirect-uri) | `http://localhost:5000/api/oauth/microsoft/callback` |
| Apple | [Sign in with Apple web Services ID](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web/) | `http://localhost:5000/api/oauth/apple/callback` |

Put client IDs and client secrets only in the matching server variables. For
Microsoft, set `MICROSOFT_TENANT_ID` to `common` for the intended supported
account types or to the tenant identifier required by your app registration.
For Apple, `APPLE_CLIENT_ID` is the web Services ID; also configure the Team ID,
Key ID, and private signing key. Register the exact production HTTPS callback
URLs after deploying the backend. These repository callback routes are
configuration placeholders: OAuth route handlers and validated user sessions
have not yet been implemented, so provider sign-in is not operational.

TOTP primitives now use `otplib` and `qrcode`. Enrollment secrets are encrypted
with AES-256-GCM using `MFA_ENCRYPTION_KEY`; recovery codes are stored as
peppered SHA-256 hashes using `RECOVERY_CODE_PEPPER`. The service functions are
not yet connected to authenticated routes because this repository does not yet
have a validated server-side user session. Do not treat TOTP as enabled until
that session and login challenge flow is implemented.

1. Push your repository to **GitHub**:
   ```bash
   git add .
   git commit -m "Update Expense Tracker project"
   git push origin main
   ```
2. Log into [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository (`Adhii-x/Expense-Tracker`).
4. Click **Deploy**. Vercel will build the `client/` folder and deliver your live link!
