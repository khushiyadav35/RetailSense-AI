"""
RetailSense AI - FastAPI Central Backend Service
Serves all REST endpoints for BI, demand forecasting, RFM customer segmentation,
anomaly radar, and conversational generative AI insights.
"""

import os
from typing import Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel

from data_processor import DataProcessor
from forecasting import DemandForecaster
from segmentation import CustomerSegmentationEngine
from anomaly_detection import AnomalyDetectionEngine
from ai_assistant import RetailAIAssistant
from sample_data_generator import generate_sample_retail_dataset

app = FastAPI(
    title="RetailSense AI API",
    description="Intelligent Sales, Customer & Demand Analytics Platform Backend",
    version="1.0.0"
)

# Enable CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State Stores
processor = DataProcessor()
ai_assistant = RetailAIAssistant()

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
SAMPLE_CSV_PATH = os.path.join(DATA_DIR, "sample_retail_data.csv")

def ensure_sample_data():
    """Generates sample data if not already present."""
    if not os.path.exists(SAMPLE_CSV_PATH):
        os.makedirs(DATA_DIR, exist_ok=True)
        generate_sample_retail_dataset(num_records=6000, output_path=SAMPLE_CSV_PATH)
    if processor.df is None or len(processor.df) == 0:
        with open(SAMPLE_CSV_PATH, "rb") as f:
            processor.load_csv_data(f.read())

# Startup event: ensure sample data loaded
@app.on_event("startup")
async def startup_event():
    ensure_sample_data()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RetailSense AI",
        "dataset_loaded": processor.df is not None and len(processor.df) > 0,
        "records_count": len(processor.df) if processor.df is not None else 0
    }

@app.post("/api/load-sample")
def load_sample():
    """Explicitly resets or loads the rich built-in sample retail dataset."""
    ensure_sample_data()
    metrics = processor.get_overview_metrics()
    return {
        "success": True,
        "message": "Sample retail dataset loaded successfully",
        "rows_count": len(processor.df),
        "metrics_summary": metrics.get("kpis", {})
    }

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload custom retail CSV or Excel file."""
    try:
        contents = await file.read()
        res = processor.load_csv_data(contents)
        if not res.get("success"):
            raise HTTPException(status_code=400, detail=res.get("error", "Failed to parse file"))
        metrics = processor.get_overview_metrics()
        return {
            "success": True,
            "filename": file.filename,
            "rows_loaded": res.get("rows_loaded"),
            "columns_mapped": res.get("columns_mapped"),
            "kpis": metrics.get("kpis", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/overview")
def get_overview():
    """Fetches high-level executive KPIs, time trends, category distributions."""
    if processor.df is None or len(processor.df) == 0:
        ensure_sample_data()
    return processor.get_overview_metrics()

class ForecastRequest(BaseModel):
    horizon_days: int = 30
    granularity: str = "daily"
    category: Optional[str] = "All Categories"
    price_change_pct: float = 0.0
    marketing_boost_pct: float = 0.0

@app.post("/api/forecast")
def get_forecast(req: ForecastRequest):
    """Generates demand forecasts and what-if simulation outputs."""
    if processor.df is None or len(processor.df) == 0:
        ensure_sample_data()

    forecaster = DemandForecaster(processor.df)
    results = forecaster.generate_forecast(
        horizon_days=req.horizon_days,
        granularity=req.granularity,
        category=req.category,
        price_change_pct=req.price_change_pct,
        marketing_boost_pct=req.marketing_boost_pct
    )
    if "error" in results:
        raise HTTPException(status_code=400, detail=results["error"])
    return results

@app.get("/api/customers")
def get_customers():
    """Runs RFM analysis, K-Means clustering, and churn probability scoring."""
    if processor.df is None or len(processor.df) == 0:
        ensure_sample_data()

    segmenter = CustomerSegmentationEngine(processor.df)
    results = segmenter.run_rfm_and_segmentation()
    if "error" in results:
        raise HTTPException(status_code=400, detail=results["error"])
    return results

@app.get("/api/anomalies")
def get_anomalies():
    """Runs Isolation Forest and time-series anomaly detection."""
    if processor.df is None or len(processor.df) == 0:
        ensure_sample_data()

    engine = AnomalyDetectionEngine(processor.df)
    results = engine.detect_anomalies()
    if "error" in results:
        raise HTTPException(status_code=400, detail=results["error"])
    return results

class ChatRequest(BaseModel):
    message: str
    context_type: Optional[str] = "general"

@app.post("/api/chat")
def chat_ai(req: ChatRequest):
    """Conversational AI Copilot endpoint."""
    if processor.df is None or len(processor.df) == 0:
        ensure_sample_data()

    # Assemble contextual state for the AI
    overview = processor.get_overview_metrics()
    forecaster = DemandForecaster(processor.df)
    forecast_res = forecaster.generate_forecast(horizon_days=30)
    segmenter = CustomerSegmentationEngine(processor.df)
    seg_res = segmenter.run_rfm_and_segmentation()
    anom_engine = AnomalyDetectionEngine(processor.df)
    anom_res = anom_engine.detect_anomalies()

    context = {
        "kpis": overview.get("kpis", {}),
        "category_breakdown": overview.get("category_breakdown", []),
        "top_products": overview.get("top_products", []),
        "segments": seg_res.get("segments", []),
        "forecast_summary": forecast_res.get("summary", {}),
        "anomalies_summary": anom_res.get("summary", {})
    }

    response_text = ai_assistant.generate_response(req.message, context)
    return {
        "reply": response_text,
        "context_snapshot": {
            "revenue": overview.get("kpis", {}).get("total_revenue"),
            "critical_anomalies": anom_res.get("summary", {}).get("critical_alerts"),
            "projected_revenue": forecast_res.get("summary", {}).get("baseline_projected_revenue")
        }
    }

@app.get("/api/download-sample-csv")
def download_sample():
    """Provides direct CSV download for user testing."""
    ensure_sample_data()
    return FileResponse(
        SAMPLE_CSV_PATH,
        media_type="text/csv",
        filename="retail_sample_sales_data.csv"
    )

# Static file serving for built production React frontend
from fastapi.staticfiles import StaticFiles

FRONTEND_DIST = os.path.join(BASE_DIR, "..", "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
