"""
RetailSense AI - Risk & Anomaly Radar Engine
Employs Isolation Forest unsupervised learning and rolling statistical Z-score algorithms
to surface suspicious transactions, discount abuse, stockouts, and demand shocks.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import RobustScaler

class AnomalyDetectionEngine:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        if not pd.api.types.is_datetime64_any_dtype(self.df["order_date"]):
            self.df["order_date"] = pd.to_datetime(self.df["order_date"])

    def detect_anomalies(self) -> Dict[str, Any]:
        """
        Runs dual-layer detection:
        1. Isolation Forest on multi-dimensional transaction space
        2. Rolling time-series macro anomaly detection on daily revenues
        """
        df = self.df.copy()
        if len(df) < 20:
            return {"error": "Need at least 20 records for anomaly modeling."}

        # --- 1. Transaction-level Isolation Forest ---
        feat_cols = ["quantity", "total_amount", "discount_percent", "profit", "unit_price"]
        X = df[feat_cols].fillna(0).values

        scaler = RobustScaler()
        X_scaled = scaler.fit_transform(X)

        # Contamination ~2.5%
        iso = IsolationForest(contamination=0.025, random_state=42)
        preds = iso.fit_predict(X_scaled)
        scores = iso.decision_function(X_scaled)

        df["iso_anomaly"] = preds == -1
        df["anomaly_score"] = scores

        # Calculate category medians for diagnostic context
        cat_medians = df.groupby("category")["quantity"].median().to_dict()
        cat_avg_amount = df.groupby("category")["total_amount"].median().to_dict()

        # Identify anomalous rows
        anomaly_records = []
        financial_risk_sum = 0.0

        for idx, row in df.iterrows():
            is_anom = row["iso_anomaly"] or row.get("is_anomaly", False)
            reason = row.get("anomaly_reason", "")
            severity = "Low"

            # Check rule-based flags to enrich reason and assign severity
            qty = row["quantity"]
            tot = row["total_amount"]
            disc = row["discount_percent"]
            prof = row["profit"]
            cat = row["category"]
            med_qty = cat_medians.get(cat, 2)
            med_amt = cat_avg_amount.get(cat, 50)

            # Heuristics for human-readable reasons and severity
            reasons_list = []
            if is_anom:
                if prof < -100:
                    reasons_list.append(f"Severe negative profit (${prof:,.2f}) caused by high discount ({disc:.0f}%)")
                    severity = "Critical"
                    financial_risk_sum += abs(prof)
                elif qty > med_qty * 10 or qty >= 50:
                    reasons_list.append(f"Excessive bulk quantity ({qty} units vs category median {med_qty:.0f})")
                    severity = "Critical" if tot > 5000 else "High"
                    financial_risk_sum += tot * 0.20
                elif disc >= 70:
                    reasons_list.append(f"Abnormally high discount ({disc:.0f}%) - potential coupon stacking or leak")
                    severity = "High"
                    financial_risk_sum += tot * 0.35
                elif tot > med_amt * 15 and tot > 2000:
                    reasons_list.append(f"Outlier transaction value (${tot:,.2f} vs typical ${med_amt:,.2f})")
                    severity = "Medium"
                else:
                    if not reason:
                        reasons_list.append("Multi-factor isolation outlier (unusual price-to-quantity ratio)")
                    severity = "Medium"

                final_reason = reason if reason else "; ".join(reasons_list)

                anomaly_records.append({
                    "order_id": row["order_id"],
                    "order_date": row["order_date"].strftime("%Y-%m-%d"),
                    "customer_name": row["customer_name"],
                    "customer_id": row["customer_id"],
                    "category": row["category"],
                    "product_name": row["product_name"],
                    "quantity": int(qty),
                    "unit_price": round(float(row["unit_price"]), 2),
                    "discount_percent": round(float(disc), 1),
                    "total_amount": round(float(tot), 2),
                    "profit": round(float(prof), 2),
                    "channel": row["channel"],
                    "severity": severity,
                    "reason": final_reason
                })

        def safe_float(v, default=0.0):
            if v is None or pd.isna(v) or np.isinf(v):
                return default
            return float(v)

        # --- 2. Macro Daily Revenue Anomaly Detection (Time-series) ---
        daily = df.groupby(df["order_date"].dt.date)["total_amount"].sum().reset_index()
        daily.columns = ["date", "revenue"]
        daily["date"] = pd.to_datetime(daily["date"])
        daily = daily.sort_values(by="date").reset_index(drop=True)

        daily["rolling_mean"] = daily["revenue"].rolling(window=7, min_periods=1).mean()
        daily["rolling_std"] = daily["revenue"].rolling(window=7, min_periods=1).std().fillna(1.0).replace(0, 1.0)
        daily["z_score"] = ((daily["revenue"] - daily["rolling_mean"]) / daily["rolling_std"]).fillna(0.0)

        daily_anomalies = []
        for _, r in daily.iterrows():
            z = safe_float(r["z_score"])
            is_daily_anom = abs(z) >= 2.3
            baseline_val = safe_float(r["rolling_mean"], safe_float(r["revenue"]))
            daily_anomalies.append({
                "date": r["date"].strftime("%Y-%m-%d"),
                "revenue": round(safe_float(r["revenue"]), 2),
                "baseline": round(baseline_val, 2),
                "is_anomaly": bool(is_daily_anom),
                "anomaly_type": "Spike" if z > 2.3 else ("Dip" if z < -2.3 else "Normal")
            })

        # Sort anomaly records: Critical first, then High, then Medium
        severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
        sorted_records = sorted(
            anomaly_records,
            key=lambda x: (severity_order.get(x["severity"], 4), -safe_float(x["total_amount"]))
        )

        # Sanitize all anomaly records
        cleaned_records = []
        for rec in sorted_records[:100]:
            cleaned_records.append({
                "order_id": str(rec["order_id"]),
                "order_date": str(rec["order_date"]),
                "customer_name": str(rec["customer_name"]),
                "customer_id": str(rec["customer_id"]),
                "category": str(rec["category"]),
                "product_name": str(rec["product_name"]),
                "quantity": int(rec["quantity"]),
                "unit_price": round(safe_float(rec["unit_price"]), 2),
                "discount_percent": round(safe_float(rec["discount_percent"]), 1),
                "total_amount": round(safe_float(rec["total_amount"]), 2),
                "profit": round(safe_float(rec["profit"]), 2),
                "channel": str(rec["channel"]),
                "severity": rec["severity"],
                "reason": str(rec["reason"])
            })

        critical_count = sum(1 for r in cleaned_records if r["severity"] == "Critical")
        high_count = sum(1 for r in cleaned_records if r["severity"] == "High")

        return {
            "summary": {
                "total_anomalies": len(cleaned_records),
                "critical_alerts": critical_count,
                "high_priority_alerts": high_count,
                "estimated_revenue_at_risk": round(safe_float(financial_risk_sum), 2),
                "daily_anomalous_days_count": sum(1 for d in daily_anomalies if d["is_anomaly"])
            },
            "records": cleaned_records,
            "daily_timeline": daily_anomalies[-90:]
        }
