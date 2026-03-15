# Cypress Visual Journey Intelligence

<div align="center">
  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/cypress.svg" width="80" height="80" alt="Cypress Logo" />
</div>

> **Visual AI-powered E2E workflow automation for modern web applications.**

[![Cypress](https://img.shields.io/badge/Cypress-13.x-04C38E?style=flat&logo=cypress)](https://cypress.io)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat&logo=openai)](https://openai.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js)](https://nodejs.org)

---

## 🚀 Project Overview

Traditional automation frameworks are hard to understand for non-technical stakeholders.
**Cypress Visual Journey Intelligence** solves this by converting automation scripts into
**visual business workflows** with AI-powered failure intelligence:

```
🧑 Visit Site → 🔐 Login → 🔎 Browse Products → 📦 Open Product
  → 🛒 Add To Cart → 👜 View Cart → 💳 Checkout → ✅ Order Success
```

Each visual step maps to real Cypress automation actions and produces:

| Output | Description |
|--------|-------------|
| ✅ Step Status | `passed` / `failed` / `skipped` |
| 📸 Screenshot | Captured after every step |
| ⏱️ Duration | Millisecond-precise execution time |
| ❌ Error Detail | Full error message + DOM snapshot |
| 🤖 AI Analysis | GPT-4o root cause + suggested fix |
| 🌐 HTML Report | Fully exportable self-contained report |

---

## 🏗️ Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   CYPRESS VISUAL JOURNEY INTELLIGENCE                       │
│                         Author: Saran Kumar                                 │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  LAYER 1 — WORKFLOW DEFINITION                                        │  │
│  │  cypress/fixtures/workflowData.json                                   │  │
│  │  { id, icon, label, action, risk, selector, value, description }     │  │
│  └──────────────────────────────┬───────────────────────────────────────┘  │
│                                  │                                           │
│                                  ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  LAYER 2 — EXECUTION ENGINE (Cypress E2E)                             │  │
│  │  cypress/e2e/visualWorkflow.cy.js                                     │  │
│  │  cypress/support/workflowRunner.js                                    │  │
│  │                                                                       │  │
│  │  ┌──────────┐ ┌────────────┐ ┌─────────────┐ ┌──────────────────┐   │  │
│  │  │ HomePage │ │ SearchPage │ │ ProductPage │ │ CartPage         │   │  │
│  │  │  .visit()│ │ .browse()  │ │ .openFirst()│ │ .viewCart()      │   │  │
│  │  │  .login()│ │ .verify()  │ │ .addToCart()│ │ .proceedCheckout│   │  │
│  │  └──────────┘ └────────────┘ └─────────────┘ └──────────────────┘   │  │
│  │                                             ┌──────────────────────┐  │  │
│  │                                             │ CheckoutPage         │  │  │
│  │                                             │ .fillInfo()          │  │  │
│  │                                             │ .finishOrder()       │  │  │
│  │                                             │ .verifySuccess()     │  │  │
│  │                                             └──────────────────────┘  │  │
│  └──────────────┬───────────────────────────────────────────────────────┘  │
│                 │                                                            │
│                 ▼                                                            │
│  ┌─────────────────────────┐     ┌──────────────────────────────────────┐  │
│  │  LAYER 3 — RESULTS       │     │  LAYER 4 — AI FAILURE ANALYZER        │  │
│  │  reports/workflow-       │────▶│  cypress/support/aiFailureAnalyzer.js │  │
│  │  results.json            │     │                                       │  │
│  │  { step, status,         │     │  Provider : OpenAI                    │  │
│  │    duration, error,      │     │  Model    : gpt-4o                    │  │
│  │    screenshot, DOM,      │     │  Tokens   : 4096 max                  │  │
│  │    url, risk }           │     │  Temp     : 0.7                       │  │
│  └─────────────────────────┘     │                                       │  │
│                                  │  ┌──────────────────────────────────┐ │  │
│                                  │  │ Prompt: Senior QA Architect role │ │  │
│                                  │  │ • failureSummary                 │ │  │
│                                  │  │ • likelyRootCause                │ │  │
│                                  │  │ • businessImpact                 │ │  │
│                                  │  │ • suggestedFix                   │ │  │
│                                  │  │ • betterSelectorRecommendation   │ │  │
│                                  │  │ • possibleProductBug             │ │  │
│                                  │  │ • preventionStrategy             │ │  │
│                                  │  │ • debuggingSteps                 │ │  │
│                                  │  │ • confidenceScore (0-100)        │ │  │
│                                  │  └──────────────────────────────────┘ │  │
│                                  └──────────────────────────────────────┘  │
│                                                │                            │
│                                                ▼                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  LAYER 5 — REPORT OUTPUTS                                             │  │
│  │  ┌─────────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │  │
│  │  │ ai-analysis.json    │ │ story-report.txt │ │ report.html      │  │  │
│  │  │ Structured JSON     │ │ Human narrative  │ │ Exportable HTML  │  │  │
│  │  └─────────────────────┘ └──────────────────┘ └──────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌──────────────────────────────────────────────────────────────┐    │  │
│  │  │  VISUAL DASHBOARD  (visual-dashboard/index.html)              │    │  │
│  │  │  Stats  │  Journey Map  │  Step Cards  │  AI Cards  │  Heatmap│   │  │
│  │  └──────────────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### 🧩 Core Architecture Layers

1. **LAYER 1 — Workflow Definition (`workflowData.json`)**: This acts as the single source of truth for the entire user journey. Non-technical users or product managers can define the sequence of actions, assign risk levels, and customize test data using a simple, readable JSON format without writing any automation code.
2. **LAYER 2 — Execution Engine (Cypress)**: The core Cypress automation framework. `visualWorkflow.cy.js` dynamically reads the workflow definition and executes each step using the robust Page Object Model (`cypress/pages/`). It seamlessly captures DOM snapshots, execution time, and screenshots.
3. **LAYER 3 — Results**: The raw telemetry from the E2E test run. It generates `workflow-results.json` containing the status (`passed`, `failed`, or `skipped`), durations, errors, and risk scores for every executed step in the journey.
4. **LAYER 4 — AI Failure Analyzer (`aiFailureAnalyzer.js`)**: The intelligent engine of the framework. If any steps fail, this layer sends the error context, CSS selector, and DOM snapshot to an AI provider (like OpenAI GPT-4o) using a specialized Senior QA Architect system prompt to determine the likely root cause, business impact, and actionable fixes.
5. **LAYER 5 — Report Outputs (Visual Dashboard)**: The final consumption layer. It transforms the E2E telemetry and AI analysis into exportable HTML reports, human-readable text stories, and a rich, interactive Visual Dashboard with a progress track and failure heatmaps.

---

## 📁 Project Structure

```
cypress-visual-journey/
│
├── cypress/
│   ├── e2e/
│   │   └── visualWorkflow.cy.js      ← Main E2E test (1 it() per step)
│   ├── fixtures/
│   │   └── workflowData.json         ← Workflow step configuration
│   ├── pages/                        ← Page Object Model
│   │   ├── HomePage.js               ← Login page
│   │   ├── SearchPage.js             ← Product catalog
│   │   ├── ProductPage.js            ← Product detail
│   │   ├── CartPage.js               ← Shopping cart
│   │   └── CheckoutPage.js           ← 3-step checkout
│   └── support/
│       ├── commands.js               ← Custom Cypress commands
│       ├── workflowRunner.js         ← Workflow execution engine
│       └── aiFailureAnalyzer.js      ← OpenAI integration
│
├── visual-dashboard/                 ← Interactive UI
│   ├── index.html
│   ├── style.css
│   └── dashboard.js
│
├── reports/                          ← Auto-generated after test run
│   ├── workflow-results.json
│   ├── ai-analysis.json
│   ├── story-report.txt
│   └── report.html                  ← ← Exportable HTML report
│
├── scripts/
│   └── runAiAnalysis.js
│
├── .env                              ← Your secrets (git-ignored)
├── .env.example                      ← Template to share
├── .gitignore
├── cypress.config.js
├── package.json
└── README.md
```

---

## 🔧 Step-by-Step Implementation Guide

### STEP 1 — Clone the Repository

```bash
git clone https://github.com/sarankumar/cypress-visual-journey-intelligence.git
cd cypress-visual-journey-intelligence
```

---

### STEP 2 — Install Dependencies

```bash
npm install
```

This installs:
- `cypress` — E2E automation framework
- `openai` — Official OpenAI Node.js SDK
- `dotenv` — Environment variable loader
- `axios` — HTTP client
- `mochawesome` — HTML test reporter

---

### STEP 3 — Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# AI Provider
AI_PROVIDER=openai

# Your OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-your-key-here

# Model to use
AI_MODEL=gpt-4o

# Max response tokens
AI_MAX_TOKENS=4096

# Creativity level (0.0 = precise, 1.0 = creative)
AI_TEMPERATURE=0.7

# Target application URL
BASE_URL=https://www.saucedemo.com
```

> ⚠️ **IMPORTANT:** The `.env` file is git-ignored. Never commit your API key.

---

### STEP 4 — Understand the Workflow Definition

Open `cypress/e2e/visualWorkflow.cy.js` and review the `ecommerceWorkflow` array:

```javascript
const ecommerceWorkflow = [
  {
    id: "visit",          // Unique step ID
    icon: "🧑",           // Emoji for visual display
    label: "Visit Site",  // Human-readable step name
    action: "visitHomePage",  // Maps to a page object method
    risk: "low",          // low | medium | high | critical
    description: "Customer visits the e-commerce homepage",
    selector: null,       // CSS selector (sent to AI on failure)
    value: null           // Input data (credentials, form values)
  },
  // ... more steps
];
```

**Risk Level Rules:**
- `low` — Step failure does not abort the workflow
- `medium` — Step failure does not abort the workflow
- `high` — Step failure aborts remaining steps
- `critical` — Step failure aborts remaining steps

---

### STEP 5 — Review the Page Object Model

Each page object in `cypress/pages/` wraps Cypress commands:

```javascript
// HomePage.js
HomePage.visit()         // cy.visit('/') + title assertion
HomePage.login(u, p)     // Type credentials + click login

// ProductPage.js
ProductPage.openFirstProduct()  // Click first .inventory_item_name
ProductPage.addToCart()         // Click add-to-cart + verify badge

// CartPage.js
CartPage.viewCart()             // Click cart icon + verify URL
CartPage.proceedToCheckout()    // Click checkout button

// CheckoutPage.js
CheckoutPage.fillCheckoutInfo(firstName, lastName, zip)
CheckoutPage.verifyOrderOverview()
CheckoutPage.finishOrder()
CheckoutPage.verifyOrderSuccess()
```

---

### STEP 6 — Run the Tests

```bash
# Headless mode (for CI)
npm test

# Interactive mode (see browser)
npm run test:headed
```

After the run, check `reports/workflow-results.json`:

```json
[
  { "step": "login",    "status": "passed",  "duration": 1200 },
  { "step": "checkout", "status": "failed",  "error": "..." }
]
```

---

### STEP 7 — Run AI Failure Analysis

```bash
npm run analyze:ai
```

The analyzer will:
1. Read `reports/workflow-results.json`
2. Find all `failed` steps
3. Build a structured prompt with error context, selector, DOM snapshot, URL
4. Call `OpenAI GPT-4o` with `json_object` response format
5. Parse the structured JSON response
6. Write three output files

**Generated files:**

| File | Description |
|------|-------------|
| `reports/ai-analysis.json` | Structured AI analysis per failed step |
| `reports/story-report.txt` | Human-readable narrative journey |
| `reports/report.html` | **Fully exportable HTML report** |

---

### STEP 8 — Open the HTML Report

```bash
npm run open:report
# Opens reports/report.html in your default browser
```

The HTML report is **fully self-contained** — it can be:
- Shared via email as an attachment
- Hosted on any static file server
- Printed as a PDF
- Attached to JIRA / Confluence

---

### STEP 9 — View the Visual Dashboard

Open the dashboard in your browser:

```bash
npx serve . -l 3000
# Then open: http://localhost:3000/visual-dashboard/
```

Or just open `visual-dashboard/index.html` directly.

**Dashboard sections:**
1. **Stats Bar** — Total / Passed / Failed / Skipped / Time / Pass Rate
2. **Journey Execution Map** — Visual flow with color-coded nodes
3. **Step Details Grid** — Filterable step cards with error previews
4. **AI Failure Intelligence** — GPT-4o analysis cards with confidence score
5. **Story Mode Report** — Human-readable journey narrative
6. **Risk & Failure Heatmap** — Risk-weighted step visualization

---

### STEP 10 — Full End-to-End Run

```bash
# Runs tests AND AI analysis in sequence
npm run full:run
```

---

## 🤖 AI Integration Details

### System Prompt (Senior QA Architect Role)

```
You are a Senior QA Architect and Automation Engineering expert with 15+ years
of experience in Cypress, Playwright, and Selenium.
```

### Per-Step User Prompt Context Sent to GPT-4o

```
- Step ID, Label, Business Goal
- Risk Level
- Current URL
- CSS Selector
- Full Error Message
- DOM Snapshot (first 1200 chars)
```

### AI Response Schema

```json
{
  "failureSummary": "Plain English summary",
  "likelyRootCause": "Technical root cause",
  "businessImpact": "Stakeholder-level impact description",
  "suggestedFix": "Numbered, copy-paste ready fix",
  "betterSelectorRecommendation": "Stable selector alternatives",
  "possibleProductBug": "Test issue vs product bug assessment",
  "preventionStrategy": "Long-term prevention approach",
  "debuggingSteps": "Step-by-step debug checklist",
  "relatedRisks": "Other steps at risk from same root cause",
  "confidenceScore": 87
}
```

### OpenAI SDK Configuration

```javascript
openai.chat.completions.create({
  model: 'gpt-4o',           // AI_MODEL from .env
  max_tokens: 4096,          // AI_MAX_TOKENS from .env
  temperature: 0.7,          // AI_TEMPERATURE from .env
  response_format: { type: 'json_object' }  // Structured output
})
```

> **Fallback:** If no API key is configured, realistic **mock analysis** is
> generated automatically so the dashboard and reports always work.

---

## 🔐 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_PROVIDER` | `openai` | AI provider name |
| `OPENAI_API_KEY` | *(required)* | OpenAI API key |
| `AI_MODEL` | `gpt-4o` | OpenAI model |
| `AI_MAX_TOKENS` | `4096` | Max response tokens |
| `AI_TEMPERATURE` | `0.7` | Response creativity |
| `BASE_URL` | `https://www.saucedemo.com` | Target site |
| `ENABLE_AI_ANALYSIS` | `true` | Toggle AI analysis |

---

## 🔒 Security — API Key Protection

The `.gitignore` is configured to protect secrets:

```gitignore
# Environment & Secrets — NEVER commit these
.env
*.env
.env.local
.env.*.local
secrets/
*.key
*.pem
```

**Before every push**, verify your key is not staged:
```bash
git status       # .env should NOT appear
git diff --cached # Should not contain API key
```

---

## 📦 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Run tests | `npm test` | Headless Cypress run |
| Open Cypress | `npm run test:headed` | Interactive Cypress UI |
| AI Analysis | `npm run analyze:ai` | Run OpenAI failure analysis |
| Open Report | `npm run open:report` | Open HTML report in browser |
| Full Pipeline | `npm run full:run` | Tests + AI analysis |
| Serve Dashboard | `npm run serve:all` | Serve entire project on port 3000 |

---

## 🧪 Test Target Application

Tests run against **SauceDemo** — a publicly hosted demo e-commerce site:

```
URL      : https://www.saucedemo.com
Username : standard_user
Password : secret_sauce
```

No signup or backend setup required.

---

## 📊 Sample Story Report Output

```
═══════════════════════════════════════════════════════════════
  VISUAL JOURNEY INTELLIGENCE — STORY MODE REPORT
  Author   : Saran Kumar
  Generated: 3/15/2026, 10:17:54 AM IST
═══════════════════════════════════════════════════════════════

🧑  Customer visits the e-commerce homepage
   ✅ PASSED  |  ⏱️ 0.85s  |  📍 /

🔐  Customer logs in with valid credentials
   ✅ PASSED  |  ⏱️ 1.20s  |  📍 /inventory.html

💳  Customer proceeds through checkout flow
   ❌ FAILED

   🤖 AI FAILURE ANALYSIS:
   ─────────────────────────────────────────────
   📋 Summary    : Checkout button not found within 10s timeout
   🔍 Root Cause : Race condition — cart footer bundle not mounted
   💼 Biz Impact : CRITICAL — direct cart abandonment, revenue loss
   🔧 Fix        : cy.get('[data-test="checkout"]', { timeout: 20000 })
   🎯 Better Sel.: [data-test='checkout'] | a[href='/checkout-step-one.html']
   🐛 Product Bug: Possible — verify with dev team
   📊 Confidence : 87%
```

---

## 🚀 Push to GitHub

```bash
# 1. Initialize git (first time only)
git init

# 2. Add remote
git remote add origin https://github.com/your-username/cypress-visual-journey-intelligence.git

# 3. Verify .env is ignored
git status   # .env should NOT be listed

# 4. Stage files
git add .

# 5. Commit
git commit -m "feat: initial Cypress Visual Journey Intelligence framework"

# 6. Push
git push -u origin main
```

---

## 🏗️ Utilizing in New Projects

Cypress Visual Journey Intelligence is designed to be highly adaptable. To utilize this framework in a new project, follow these simple steps:

1. **Define Your Steps:** Update `cypress/fixtures/workflowData.json` with your project's specific user journey steps. Make sure to assign a unique `action` string to each step.
2. **Create Page Objects:** Add your application's pages as class models within the `cypress/pages/` folder.
3. **Map Actions:** Open `cypress/support/workflowRunner.js` and map the `action` strings from your workflow JSON to your new page object functions inside the `stepActions` constant.
4. **Environment Config:** Update the `.env` file with the `BASE_URL` corresponding to your new target application. Ensure `OPENAI_API_KEY` is configured.
5. **Run & Export:** Run `npm run full:run` to execute your custom journey, and use the "Export PDF" button inside `report.html` to share results with stakeholders!

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Add new page objects, workflow steps, or AI analysis enhancements
4. Submit a Pull Request

---

## 📜 License

MIT © 2026 Saran Kumar

---

## 🏁 Project Tagline

> *"Visual AI-powered E2E workflow automation for modern web applications."*

---

## ⭐ Support This Project

If you find this repository useful for learning about AI-integrated testing frameworks, please consider dropping a **Star** ⭐️ on GitHub! It helps others discover the framework and motivates further development.

> ## 👤 Author

**Saran Kumar**
