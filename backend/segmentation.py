"""
RetailSense AI - Customer Segmentation & Churn Risk Engine
Performs RFM (Recency, Frequency, Monetary) analytics, K-Means clustering,
CLV estimation, churn probability scoring, and automated retention playbook generation.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

class CustomerSegmentationEngine:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        if not pd.api.types.is_datetime64_any_dtype(self.df["order_date"]):
            self.df["order_date"] = pd.to_datetime(self.df["order_date"])

    def run_rfm_and_segmentation(self) -> Dict[str, Any]:
        """
        Runs RFM analysis, K-Means clustering, churn risk scoring, and returns segment aggregations.
        """
        df = self.df
        if len(df) == 0:
            return {"error": "Empty dataset"}

        snapshot_date = df["order_date"].max()

        # Group by customer
        cust_group = df.groupby("customer_id").agg(
            customer_name=("customer_name", "first"),
            customer_region=("customer_region", "first"),
            last_order_date=("order_date", "max"),
            first_order_date=("order_date", "min"),
            frequency=("order_id", "nunique"),
            monetary=("total_amount", "sum"),
            total_items=("quantity", "sum"),
            avg_discount=("discount_percent", "mean")
        ).reset_index()

        # Recency in days
        cust_group["recency"] = (snapshot_date - cust_group["last_order_date"]).dt.days
        cust_group["tenure_days"] = (snapshot_date - cust_group["first_order_date"]).dt.days
        cust_group["aov"] = (cust_group["monetary"] / cust_group["frequency"]).round(2)

        # Favorite category and channel
        fav_cat = df.groupby(["customer_id", "category"])["total_amount"].sum().reset_index()
        fav_cat = fav_cat.sort_values(by=["customer_id", "total_amount"], ascending=[True, False]).drop_duplicates(subset=["customer_id"])
        cat_map = dict(zip(fav_cat["customer_id"], fav_cat["category"]))
        cust_group["favorite_category"] = cust_group["customer_id"].map(cat_map).fillna("Various")

        # RFM Quintile Scoring (1 to 5)
        # Recency: lower is better -> invert ranks
        try:
            cust_group["r_score"] = pd.qcut(cust_group["recency"], 5, labels=[5, 4, 3, 2, 1]).astype(int)
        except Exception:
            cust_group["r_score"] = 3

        try:
            # Frequency has duplicates, use rank method
            cust_group["f_score"] = pd.qcut(cust_group["frequency"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)
        except Exception:
            cust_group["f_score"] = 3

        try:
            cust_group["m_score"] = pd.qcut(cust_group["monetary"], 5, labels=[1, 2, 3, 4, 5]).astype(int)
        except Exception:
            cust_group["m_score"] = 3

        cust_group["rfm_composite"] = cust_group["r_score"] * 100 + cust_group["f_score"] * 10 + cust_group["m_score"]

        # K-Means Clustering on log-transformed features
        features = cust_group[["recency", "frequency", "monetary"]].copy()
        features["recency_log"] = np.log1p(features["recency"])
        features["frequency_log"] = np.log1p(features["frequency"])
        features["monetary_log"] = np.log1p(features["monetary"])

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(features[["recency_log", "frequency_log", "monetary_log"]])

        n_clusters = 5
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cust_group["cluster"] = kmeans.fit_predict(X_scaled)

        # Map clusters to business personas using cluster centers
        centers = kmeans.cluster_centers_
        # Sort clusters by composite value: high frequency + high monetary - high recency
        score_by_cluster = {}
        for c_idx in range(n_clusters):
            # center columns: [recency_log, frequency_log, monetary_log]
            rec_z = centers[c_idx][0]
            freq_z = centers[c_idx][1]
            mon_z = centers[c_idx][2]
            score_by_cluster[c_idx] = (mon_z * 1.5 + freq_z * 1.2 - rec_z * 1.0)

        sorted_clusters = sorted(score_by_cluster.keys(), key=lambda c: score_by_cluster[c], reverse=True)

        segment_names = [
            "Champions (VIP Whales)",
            "Loyal Advocates",
            "Promising / Potential",
            "At Risk / Slipping",
            "Hibernating / Lost"
        ]

        cluster_to_segment = {cluster_id: segment_names[i] for i, cluster_id in enumerate(sorted_clusters)}
        cust_group["segment"] = cust_group["cluster"].map(cluster_to_segment)

        # Churn Risk Calculation (0 - 100%)
        # Factors: High recency vs tenure, infrequent ordering
        recency_factor = np.clip(cust_group["recency"] / 180.0, 0, 1.0) * 60.0
        frequency_factor = np.clip(1.0 / (cust_group["frequency"] + 0.1), 0, 1.0) * 25.0
        r_score_penalty = (5 - cust_group["r_score"]) * 3.0

        cust_group["churn_risk_score"] = np.clip(
            (recency_factor + frequency_factor + r_score_penalty).round(1),
            5.0,
            98.0
        )

        cust_group["churn_tier"] = pd.cut(
            cust_group["churn_risk_score"],
            bins=[-1, 35, 65, 100],
            labels=["Low Risk / Safe", "Moderate Risk", "High Risk / Churning"]
        ).astype(str)

        # Retention playbooks
        playbooks = {
            "Champions (VIP Whales)": {
                "action": "VIP Concierge & Loyalty Rewards",
                "recommended_offer": "Early access to new releases, personal thank you note, 0% fee express shipping.",
                "goal": "Maximize advocacy and lifetime referral value."
            },
            "Loyal Advocates": {
                "action": "Tiered Upsell & Cross-category Exploration",
                "recommended_offer": "Bundle recommendation with 10% complimentary gift on orders over $150.",
                "goal": "Increase basket variety and order frequency."
            },
            "Promising / Potential": {
                "action": "Habit Building & Category Discovery",
                "recommended_offer": "Welcome back 15% discount for their second/third purchase within 30 days.",
                "goal": "Convert into repeat loyalists."
            },
            "At Risk / Slipping": {
                "action": "Urgent Win-back Automated Campaign",
                "recommended_offer": "Targeted $25 credit or 20% discount expiring in 7 days.",
                "goal": "Re-engage before total lapse."
            },
            "Hibernating / Lost": {
                "action": "Aggressive Clearance & Feedback Survey",
                "recommended_offer": "30% off reactivation offer or short 1-question feedback survey.",
                "goal": "Identify reasons for attrition or clean CRM lists."
            }
        }

        # Segment level aggregations
        segment_stats = []
        total_customers = len(cust_group)
        total_m = cust_group["monetary"].sum()

        for seg_name in segment_names:
            seg_df = cust_group[cust_group["segment"] == seg_name]
            count = len(seg_df)
            if count == 0:
                continue

            seg_rev = float(seg_df["monetary"].sum())
            avg_m = float(seg_df["monetary"].mean())
            avg_r = float(seg_df["recency"].mean())
            avg_f = float(seg_df["frequency"].mean())
            avg_churn = float(seg_df["churn_risk_score"].mean())

            segment_stats.append({
                "segment": seg_name,
                "customer_count": count,
                "share_pct": round((count / total_customers) * 100, 1),
                "total_revenue": round(seg_rev, 2),
                "revenue_share_pct": round((seg_rev / max(total_m, 1)) * 100, 1),
                "avg_spend": round(avg_m, 2),
                "avg_recency_days": round(avg_r, 1),
                "avg_frequency": round(avg_f, 1),
                "avg_churn_risk_pct": round(avg_churn, 1),
                "playbook": playbooks.get(seg_name, {})
            })

        # Customer list (sample for fast frontend table)
        customers_table = []
        for _, row in cust_group.sort_values(by="monetary", ascending=False).iterrows():
            customers_table.append({
                "customer_id": row["customer_id"],
                "customer_name": row["customer_name"],
                "region": row["customer_region"],
                "segment": row["segment"],
                "total_spend": round(float(row["monetary"]), 2),
                "orders_count": int(row["frequency"]),
                "aov": round(float(row["aov"]), 2),
                "recency_days": int(row["recency"]),
                "last_order": row["last_order_date"].strftime("%Y-%m-%d"),
                "favorite_category": row["favorite_category"],
                "churn_risk_score": float(row["churn_risk_score"]),
                "churn_tier": row["churn_tier"]
            })

        # Churn tier breakdown
        churn_distribution = cust_group["churn_tier"].value_counts().to_dict()

        return {
            "summary": {
                "total_customers": total_customers,
                "high_risk_customers_count": int((cust_group["churn_tier"] == "High Risk / Churning").sum()),
                "champions_count": int((cust_group["segment"] == "Champions (VIP Whales)").sum()),
                "vip_revenue_share_pct": next((s["revenue_share_pct"] for s in segment_stats if "Champions" in s["segment"]), 0.0),
                "avg_customer_ltv": round(float(cust_group["monetary"].mean()), 2)
            },
            "segments": segment_stats,
            "churn_distribution": churn_distribution,
            "customers": customers_table[:300] # return top 300 for snappy UI rendering
        }
