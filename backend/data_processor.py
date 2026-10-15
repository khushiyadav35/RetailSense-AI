"""
RetailSense AI - Data Processor & Analytics Engine
Handles data ingestion, intelligent column mapping, schema validation,
KPI calculations, and multi-dimensional aggregations.
"""

import io
import re
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd

class DataProcessor:
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.column_mapping: Dict[str, str] = {}
        self.summary_cache: Optional[Dict[str, Any]] = None

    @staticmethod
    def infer_columns(df: pd.DataFrame) -> Dict[str, str]:
        """Auto-detects semantic column roles from messy CSV headers."""
        cols = {c.lower().strip().replace(" ", "_").replace("-", "_"): c for c in df.columns}
        mapping = {}

        patterns = {
            "order_id": [r"order.*id", r"invoice.*id", r"transaction.*id", r"order_no", r"invoice_no", r"^id$"],
            "order_date": [r"order.*date", r"invoice.*date", r"trans.*date", r"^date$", r"timestamp", r"created_at"],
            "customer_id": [r"cust.*id", r"client.*id", r"user.*id", r"account.*id", r"buyer.*id"],
            "customer_name": [r"cust.*name", r"client.*name", r"buyer.*name", r"^customer$", r"^client$"],
            "customer_region": [r"region", r"country", r"city", r"state", r"location", r"territory", r"market"],
            "category": [r"category", r"department", r"dept", r"cat", r"product.*line"],
            "sub_category": [r"sub.*cat", r"sub_category", r"sub_dept", r"type"],
            "product_name": [r"product.*name", r"item.*name", r"item.*title", r"product", r"item", r"description", r"sku"],
            "quantity": [r"quant.*", r"qty", r"units", r"volume", r"count", r"pieces"],
            "unit_price": [r"unit.*price", r"price", r"rate", r"item.*cost", r"retail.*price"],
            "total_amount": [r"total.*amount", r"sales", r"total", r"revenue", r"net.*amount", r"grand.*total", r"spend"],
            "cost_amount": [r"cost.*amount", r"cost", r"cogs", r"wholesale.*price", r"unit.*cost"],
            "profit": [r"profit", r"margin", r"net.*profit", r"earnings"],
            "discount_percent": [r"discount.*pct", r"discount.*percent", r"discount", r"promo.*pct", r"disc"],
            "channel": [r"channel", r"sales.*channel", r"store.*type", r"platform", r"store"]
        }

        matched_original = set()

        for standard_key, pattern_list in patterns.items():
            for p in pattern_list:
                regex = re.compile(p, re.IGNORECASE)
                for clean_col, orig_col in cols.items():
                    if orig_col not in matched_original and regex.search(clean_col):
                        mapping[standard_key] = orig_col
                        matched_original.add(orig_col)
                        break
                if standard_key in mapping:
                    break

        return mapping

    def clean_and_normalize(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardizes types, fills missing values, and synthesizes missing core fields."""
        mapping = self.infer_columns(df)
        self.column_mapping = mapping
        clean_df = pd.DataFrame()

        # 1. Date processing
        if "order_date" in mapping:
            clean_df["order_date"] = pd.to_datetime(df[mapping["order_date"]], errors="coerce")
        else:
            # Fallback: create arbitrary sequential dates
            print("Warning: order_date not found, creating synthetic timeline.")
            clean_df["order_date"] = pd.date_range(end=pd.Timestamp.now(), periods=len(df), freq="h")

        # Drop rows with invalid dates
        valid_date_mask = clean_df["order_date"].notnull()
        clean_df = clean_df[valid_date_mask].copy()
        raw_filtered = df[valid_date_mask].copy()

        # 2. Identifiers
        if "order_id" in mapping:
            clean_df["order_id"] = raw_filtered[mapping["order_id"]].astype(str)
        else:
            clean_df["order_id"] = [f"ORD-{i+1:05d}" for i in range(len(clean_df))]

        if "customer_id" in mapping:
            clean_df["customer_id"] = raw_filtered[mapping["customer_id"]].astype(str)
        else:
            clean_df["customer_id"] = [f"CUST-{((i % 400) + 1):04d}" for i in range(len(clean_df))]

        if "customer_name" in mapping:
            clean_df["customer_name"] = raw_filtered[mapping["customer_name"]].astype(str)
        else:
            clean_df["customer_name"] = clean_df["customer_id"].apply(lambda cid: f"Customer {cid}")

        # 3. Product & Categories
        if "category" in mapping:
            clean_df["category"] = raw_filtered[mapping["category"]].fillna("General Retail").astype(str)
        else:
            clean_df["category"] = "General Retail"

        if "sub_category" in mapping:
            clean_df["sub_category"] = raw_filtered[mapping["sub_category"]].fillna("Standard").astype(str)
        else:
            clean_df["sub_category"] = "Standard"

        if "product_name" in mapping:
            clean_df["product_name"] = raw_filtered[mapping["product_name"]].fillna("Retail Item").astype(str)
        else:
            clean_df["product_name"] = clean_df["category"].apply(lambda c: f"{c} Item")

        # 4. Numerics: Quantity, Unit Price, Total Amount, Profit, Discount
        if "quantity" in mapping:
            clean_df["quantity"] = pd.to_numeric(raw_filtered[mapping["quantity"]], errors="coerce").fillna(1).clip(lower=1)
        else:
            clean_df["quantity"] = 1

        if "unit_price" in mapping:
            clean_df["unit_price"] = pd.to_numeric(raw_filtered[mapping["unit_price"]], errors="coerce").fillna(25.0)
        elif "total_amount" in mapping and "quantity" in mapping:
            tot = pd.to_numeric(raw_filtered[mapping["total_amount"]], errors="coerce").fillna(0)
            clean_df["unit_price"] = (tot / clean_df["quantity"]).round(2).replace([np.inf, -np.inf], 25.0)
        else:
            clean_df["unit_price"] = 49.99

        if "discount_percent" in mapping:
            clean_df["discount_percent"] = pd.to_numeric(raw_filtered[mapping["discount_percent"]], errors="coerce").fillna(0.0)
            # If values > 1.0 (e.g. 15 for 15%), keep as is; if 0.15, convert to 15.0
            if clean_df["discount_percent"].max() <= 1.0 and clean_df["discount_percent"].max() > 0:
                clean_df["discount_percent"] *= 100.0
        else:
            clean_df["discount_percent"] = 0.0

        if "total_amount" in mapping:
            clean_df["total_amount"] = pd.to_numeric(raw_filtered[mapping["total_amount"]], errors="coerce").fillna(
                clean_df["quantity"] * clean_df["unit_price"] * (1 - clean_df["discount_percent"] / 100.0)
            )
        else:
            clean_df["total_amount"] = (
                clean_df["quantity"] * clean_df["unit_price"] * (1 - clean_df["discount_percent"] / 100.0)
            ).round(2)

        # Cost and Profit
        if "cost_amount" in mapping:
            clean_df["cost_amount"] = pd.to_numeric(raw_filtered[mapping["cost_amount"]], errors="coerce").fillna(
                clean_df["total_amount"] * 0.60
            )
        else:
            clean_df["cost_amount"] = (clean_df["total_amount"] * 0.60).round(2)

        if "profit" in mapping:
            clean_df["profit"] = pd.to_numeric(raw_filtered[mapping["profit"]], errors="coerce").fillna(
                clean_df["total_amount"] - clean_df["cost_amount"]
            )
        else:
            clean_df["profit"] = (clean_df["total_amount"] - clean_df["cost_amount"]).round(2)

        # 5. Metadata: Channel, Region
        if "customer_region" in mapping:
            clean_df["customer_region"] = raw_filtered[mapping["customer_region"]].fillna("National").astype(str)
        else:
            clean_df["customer_region"] = "National"

        if "channel" in mapping:
            clean_df["channel"] = raw_filtered[mapping["channel"]].fillna("Omnichannel").astype(str)
        else:
            clean_df["channel"] = "Omnichannel"

        # Check for anomaly flag if already in data
        if "is_anomaly" in df.columns:
            clean_df["is_anomaly"] = raw_filtered["is_anomaly"].fillna(False).astype(bool)
            clean_df["anomaly_reason"] = raw_filtered.get("anomaly_reason", "")
        else:
            clean_df["is_anomaly"] = False
            clean_df["anomaly_reason"] = ""

        # Sort by date
        clean_df = clean_df.sort_values(by="order_date").reset_index(drop=True)
        self.df = clean_df
        self.summary_cache = None
        return clean_df

    def load_csv_data(self, file_content: bytes) -> Dict[str, Any]:
        """Loads CSV bytes, parses, normalizes and caches summary."""
        try:
            df = pd.read_csv(io.BytesIO(file_content))
            self.clean_and_normalize(df)
            return {
                "success": True,
                "rows_loaded": len(self.df),
                "columns_mapped": self.column_mapping,
                "date_range": {
                    "start": self.df["order_date"].min().strftime("%Y-%m-%d"),
                    "end": self.df["order_date"].max().strftime("%Y-%m-%d")
                }
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_overview_metrics(self) -> Dict[str, Any]:
        """Computes executive-level KPIs, trends, category distribution, and top items."""
        if self.df is None or len(self.df) == 0:
            return {}

        df = self.df

        total_revenue = float(df["total_amount"].sum())
        total_orders = int(df["order_id"].nunique())
        total_customers = int(df["customer_id"].nunique())
        total_units = int(df["quantity"].sum())
        total_profit = float(df["profit"].sum())

        aov = round(total_revenue / max(total_orders, 1), 2)
        profit_margin = round((total_profit / max(total_revenue, 1)) * 100.0, 1)

        # Repeat customer calculation
        cust_order_counts = df.groupby("customer_id")["order_id"].nunique()
        repeat_customers = int((cust_order_counts > 1).sum())
        repeat_rate = round((repeat_customers / max(total_customers, 1)) * 100.0, 1)

        # Time series aggregations (Monthly and Daily)
        df_ts = df.copy()
        df_ts["month"] = df_ts["order_date"].dt.strftime("%Y-%m")
        df_ts["date_str"] = df_ts["order_date"].dt.strftime("%Y-%m-%d")

        monthly = df_ts.groupby("month").agg(
            revenue=("total_amount", "sum"),
            orders=("order_id", "nunique"),
            profit=("profit", "sum")
        ).reset_index()

        monthly_data = [
            {
                "month": r["month"],
                "revenue": round(float(r["revenue"]), 2),
                "orders": int(r["orders"]),
                "profit": round(float(r["profit"]), 2)
            }
            for _, r in monthly.iterrows()
        ]

        # Recent daily trend (last 60 days)
        max_date = df_ts["order_date"].max()
        cutoff_date = max_date - pd.Timedelta(days=60)
        recent_daily = df_ts[df_ts["order_date"] >= cutoff_date].groupby("date_str").agg(
            revenue=("total_amount", "sum"),
            units=("quantity", "sum")
        ).reset_index()

        daily_data = [
            {
                "date": r["date_str"],
                "revenue": round(float(r["revenue"]), 2),
                "units": int(r["units"])
            }
            for _, r in recent_daily.iterrows()
        ]

        # Category Breakdown
        cat_group = df.groupby("category").agg(
            revenue=("total_amount", "sum"),
            orders=("order_id", "nunique"),
            units=("quantity", "sum"),
            profit=("profit", "sum")
        ).reset_index().sort_values(by="revenue", ascending=False)

        category_data = [
            {
                "category": r["category"],
                "revenue": round(float(r["revenue"]), 2),
                "share": round(float(r["revenue"]) / max(total_revenue, 1) * 100, 1),
                "orders": int(r["orders"]),
                "units": int(r["units"]),
                "profit": round(float(r["profit"]), 2)
            }
            for _, r in cat_group.iterrows()
        ]

        # Top 10 Products
        prod_group = df.groupby(["product_name", "category"]).agg(
            revenue=("total_amount", "sum"),
            units=("quantity", "sum"),
            orders=("order_id", "nunique")
        ).reset_index().sort_values(by="revenue", ascending=False).head(10)

        top_products = [
            {
                "product": r["product_name"],
                "category": r["category"],
                "revenue": round(float(r["revenue"]), 2),
                "units": int(r["units"]),
                "orders": int(r["orders"])
            }
            for _, r in prod_group.iterrows()
        ]

        # Channel Breakdown
        channel_group = df.groupby("channel").agg(
            revenue=("total_amount", "sum"),
            orders=("order_id", "nunique")
        ).reset_index().sort_values(by="revenue", ascending=False)

        channels = [
            {
                "channel": r["channel"],
                "revenue": round(float(r["revenue"]), 2),
                "orders": int(r["orders"]),
                "percentage": round(float(r["revenue"]) / max(total_revenue, 1) * 100, 1)
            }
            for _, r in channel_group.iterrows()
        ]

        # Regional Breakdown
        region_group = df.groupby("customer_region").agg(
            revenue=("total_amount", "sum"),
            customers=("customer_id", "nunique")
        ).reset_index().sort_values(by="revenue", ascending=False)

        regions = [
            {
                "region": r["customer_region"],
                "revenue": round(float(r["revenue"]), 2),
                "customers": int(r["customers"])
            }
            for _, r in region_group.iterrows()
        ]

        # Compute Month-over-Month Growth (for most recent full month)
        mom_growth = 0.0
        if len(monthly_data) >= 2:
            last_rev = monthly_data[-1]["revenue"]
            prev_rev = monthly_data[-2]["revenue"]
            if prev_rev > 0:
                mom_growth = round(((last_rev - prev_rev) / prev_rev) * 100.0, 1)

        result = {
            "kpis": {
                "total_revenue": round(total_revenue, 2),
                "total_orders": total_orders,
                "total_customers": total_customers,
                "total_units": total_units,
                "average_order_value": aov,
                "profit_margin": profit_margin,
                "repeat_customer_rate": repeat_rate,
                "mom_revenue_growth": mom_growth
            },
            "monthly_trends": monthly_data,
            "recent_daily_trends": daily_data,
            "category_breakdown": category_data,
            "top_products": top_products,
            "channel_breakdown": channels,
            "region_breakdown": regions,
            "date_range": {
                "start": df["order_date"].min().strftime("%Y-%m-%d"),
                "end": df["order_date"].max().strftime("%Y-%m-%d")
            }
        }

        self.summary_cache = result
        return result
