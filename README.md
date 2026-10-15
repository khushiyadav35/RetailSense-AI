# 🛍️ RetailSense AI — Intelligent Sales, Customer & Demand Analytics Platform

> **A unified end-to-end enterprise platform combining Data Science + Machine Learning + Generative AI + Business Analytics.**

RetailSense AI empowers e-commerce brands, retail chains, and distributors to upload historical sales data and instantly obtain **predictive demand forecasting**, **RFM customer segmentation**, **churn risk detection**, **unsupervised anomaly radars**, and **conversational AI strategic consultation**.

---

## 🌟 Key Capabilities & Architectural Pillars

### 1. 📊 Descriptive Analytics & Executive BI Dashboard
* **Real-time KPI Tracking:** Gross Sales, Total Orders, Average Order Value (AOV), Profit Margin %, and Repeat Customer Rate.
* **Trajectory Tracking:** Multi-year monthly trajectory and high-resolution 60-day daily velocity views.
* **Category & SKU Pareto Analysis:** Category revenue share rankings and top 10 high-velocity products.
* **Omnichannel & Regional Breakdown:** Sales channel split (Online, Flagship, Mobile App, Wholesale) and geographic demand performance.

### 2. 📈 Machine Learning Demand Forecasting & "What-If" Scenario Simulator
* **Ensemble Time-Series Models:** Combines Holt-Winters seasonal trend decomposition with Autoregressive Lag Regression (Ridge / Random Forest).
* **Uncertainty Quantification:** Computes 80% and 95% confidence interval bands to forecast inventory requirements.
* **Multi-Horizon & Granularity:** Toggle 7, 14, 30, or 60 days across Daily or Weekly resolutions, filtered by department.
* **Interactive Scenario Simulator:** Live slider controls for **Catalog Price Adjustments (-20% to +20%)** and **Marketing Promotion Boosts (+0% to +50%)** calculating projected demand volume and net revenue impact via empirical price elasticity (-1.35).

### 3. 👥 Customer RFM Intelligence & Churn Radar
* **RFM Mathematical Modeling:** Quintile scoring (1–5) on **Recency** (days since last order), **Frequency** (order cadence), and **Monetary** (cumulative spend).
* **K-Means Unsupervised Clustering:** Automatically identifies 5 customer personas:
  * **Champions (VIP Whales):** High spenders driving ~40% of sales.
  * **Loyal Advocates:** Consistent recurring order cadence.
  * **Promising / Potential:** Recent trial buyers with upsell potential.
  * **At Risk / Slipping:** High historical spenders entering dormancy (>90 days without an order).
  * **Hibernating / Lost:** Inactive accounts requiring re-activation or clearance campaigns.
* **Predictive Churn Risk Engine:** Generates probability scores (0–100%) and categorizes accounts into High Risk, Moderate Risk, and Safe.
* **Actionable Playbooks:** Targeted retention strategies, promo incentives, and loyalty playbooks per segment.
* **Interactive Account Directory:** Search individual buyers, review purchase frequency, AOV, favorite categories, and churn scores.

### 4. 🛡️ Risk & Anomaly Radar
* **Dual-Layer Anomaly Scanner:**
  1. **Isolation Forest Unsupervised Outlier Detection:** Evaluates 5-dimensional transaction spaces (Quantity, Total Amount, Discount %, Margin, Unit Price) to detect bulk draining, unauthorized reselling, and coupon stacking leaks.
  2. **Macro Rolling Z-Score Time-Series Scanner:** Flags days where daily sales deviate by > 2.5 standard deviations from baseline (blackout days or flash surges).
* **Diagnostic Root-Cause Explanations:** Explains why each anomaly was flagged (e.g., *"Negative profit (-$1,680) caused by 90% coupon stacking"* or *"Excessive bulk quantity (150 units vs category median 2)"*).
* **Financial Risk Sum:** Quantifies total revenue exposed to leakage.

### 5. 🤖 RetailSense AI Copilot & Executive Brief Generator
* **Conversational AI Consultant:** Answers natural language questions directly grounded in real dataset metrics.
* **One-Click Executive Actions:**
  * 📋 *Generate C-Suite Executive Summary*
  * 👥 *Explain At-Risk Customer Churn & Recovery Plan*
  * 📈 *What is our 30-Day Demand Forecast & Pricing Strategy?*
  * 🛡️ *Audit Critical Anomalies & Negative Margin Orders*
* **Dual Execution Modes:**
  * **Built-in Grounded Analytical Engine:** Deterministic, statistical rule-and-heuristic retail consultant that runs completely offline with zero API key requirement.
  * **Google Gemini AI Integration:** Set `GEMINI_API_KEY` to unlock live Gemini 1.5 Flash generative reasoning.
* **Global Slide-Out Copilot Drawer:** Summon the AI assistant from any tab without losing context.
* **1-Click Report Export:** Download consultations and executive briefs as formatted Markdown reports.

### 6. 📁 Smart Data Ingestion & Sample Dataset
* **Intelligent Schema Detection:** Automatically infers column names from diverse CSV formats (Order Date, Customer ID, Product, Category, Quantity, Unit Price, Total Sales, Discount %, Channel, Region).
* **Preloaded Demo Dataset:** Includes 5,800+ realistic multi-year retail transactions with authentic cohorts, seasonal holiday spikes, and injected anomalies.
* **Direct Sample Export:** Download the sample CSV directly from the header navigation.

---

## 🚀 Quickstart Guide

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & npm

### Running the Application

1. **Option A: 1-Click Launch (Windows)**
   Double-click `run.bat` or run:
   ```cmd
   .\run.bat
   ```
   This automatically launches the FastAPI server and opens your browser at `http://localhost:8000`.

2. **Option B: Run Backend & Frontend Separately (Development Mode)**

   **Start Backend:**
   ```bash
   cd backend
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

   **Start Frontend (Hot Reload):**
   ```bash
   cd frontend
   npm run dev
   ```
   Navigate to `http://localhost:5173`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend API** | FastAPI, Uvicorn, Pydantic, Python-Multipart |
| **Data Science & ML** | Pandas, NumPy, Scikit-Learn (K-Means, Isolation Forest, Ridge Regression, RobustScaler), SciPy |
| **Generative AI** | Google Gemini API integration + Grounded Deterministic Retail Reasoning Engine |
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons |
| **Data Visualization** | Recharts (Responsive Area Charts, Composed Dual-Axis Charts, Scatter Plots, Category Gauges) |

---

## 📂 Project Directory Structure

```
retailsense-ai/
├── run.bat                          # 1-click Windows launcher
├── README.md                        # Documentation & Architecture
├── data/
│   └── sample_retail_data.csv       # Preloaded 5,800+ transaction dataset
├── backend/
│   ├── main.py                      # FastAPI REST server & SPA static distributor
│   ├── data_processor.py            # CSV parser, column mapping, BI KPIs
│   ├── forecasting.py               # Time-series ML & What-If scenario engine
│   ├── segmentation.py              # RFM quintiles, K-Means clustering, churn scores
│   ├── anomaly_detection.py         # Isolation Forest & Z-score time-series radar
│   ├── ai_assistant.py              # Grounded reasoning engine + Gemini API
│   └── sample_data_generator.py     # Realistic retail cohort data generator
└── frontend/
    ├── package.json                 # React + Recharts + Lucide dependencies
    ├── vite.config.ts               # Vite configuration with React & Tailwind plugins
    ├── tsconfig.json                # TypeScript compiler configuration
    └── src/
        ├── App.tsx                  # Tab router & state coordinator
        ├── types.ts                 # TypeScript interfaces
        ├── api.ts                   # Backend HTTP client
        └── components/
            ├── Navbar.tsx           # Navigation, dataset pills, quick actions
            ├── UploadModal.tsx      # Drag-and-drop CSV upload & mapping preview
            ├── OverviewTab.tsx      # BI dashboard, KPIs, revenue trends, top SKUs
            ├── ForecastTab.tsx      # Demand forecast & What-If simulator
            ├── CustomerTab.tsx      # RFM segmentation cards & churn directory
            ├── AnomalyTab.tsx       # Isolation Forest anomaly radar & diagnostics
            ├── AiCopilotTab.tsx     # Fullscreen conversational AI consultant
            └── AiCopilotDrawer.tsx  # Global slide-out quick copilot
```
