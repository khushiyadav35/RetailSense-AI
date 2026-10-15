"""
RetailSense AI - Synthetic Retail Data Generator
Generates realistic multi-channel retail sales data with customer cohorts,
seasonal demand shifts, product hierarchies, and natural anomalies.
"""

import os
import random
from datetime import datetime, timedelta
import numpy as np
import pandas as pd

def generate_sample_retail_dataset(num_records: int = 6000, output_path: str = None) -> pd.DataFrame:
    np.random.seed(42)
    random.seed(42)

    categories = {
        "Electronics": {
            "subcategories": ["Laptops", "Smartphones", "Audio", "Accessories", "Smart Home"],
            "products": [
                ("ProBook 15 Gen 4", 899.99, 650.00),
                ("UltraSlim OLED 13", 1199.99, 850.00),
                ("Apex Phone 14", 799.99, 520.00),
                ("Apex Phone 14 Pro", 999.99, 680.00),
                ("Noise-Cancel Wireless Headphones", 199.99, 95.00),
                ("Hi-Fi Soundbar 3.1", 249.99, 130.00),
                ("Fast Charging Pad 65W", 39.99, 14.00),
                ("4K USB-C Web Camera", 79.99, 32.00),
                ("Smart Home Hub Mini", 49.99, 22.00),
                ("Smart Wi-Fi Bulb Pack", 29.99, 11.00)
            ]
        },
        "Fashion & Apparel": {
            "subcategories": ["Men's Wear", "Women's Wear", "Footwear", "Athletic", "Outerwear"],
            "products": [
                ("Classic Cotton Oxford Shirt", 49.99, 18.00),
                ("Slim Denim Jeans", 59.99, 22.00),
                ("Merino Wool Knit Sweater", 89.99, 34.00),
                ("Waterproof Trail Jacket", 129.99, 55.00),
                ("Everyday Comfort Sneakers", 79.99, 30.00),
                ("Performance Running Shoes", 119.99, 48.00),
                ("Breathable Gym Tee", 29.99, 9.50),
                ("Floral Summer Wrap Dress", 69.99, 24.00),
                ("Leather Dress Boots", 149.99, 62.00),
                ("Cashmere Blend Scarf", 39.99, 12.00)
            ]
        },
        "Home & Kitchen": {
            "subcategories": ["Cookware", "Small Appliances", "Bedding", "Furniture", "Organization"],
            "products": [
                ("Precision Air Fryer 5.8Qt", 119.99, 58.00),
                ("Espresso & Latte Machine", 229.99, 110.00),
                ("Tri-Ply Stainless Steel Pan", 69.99, 28.00),
                ("Chef's Damascus Knife 8in", 89.99, 35.00),
                ("Organic Bamboo Sheet Set", 79.99, 32.00),
                ("Memory Foam Ergonomic Pillow", 45.99, 16.00),
                ("Modular Storage Bins (4pk)", 34.99, 12.50),
                ("Mid-Century Velvet Accent Chair", 199.99, 85.00),
                ("Dimmable LED Desk Lamp", 39.99, 14.00),
                ("Aromatherapy Diffuser 500ml", 29.99, 9.00)
            ]
        },
        "Beauty & Health": {
            "subcategories": ["Skincare", "Haircare", "Wellness", "Fragrance", "Personal Care"],
            "products": [
                ("Hyaluronic Acid Serum 50ml", 38.00, 11.00),
                ("Vitamin C Glow Cream", 42.00, 13.50),
                ("Botanical Restorative Shampoo", 24.00, 7.00),
                ("Deep Conditioning Hair Mask", 28.00, 8.50),
                ("Mineral UV Sunscreen SPF 50", 26.00, 8.00),
                ("Eau de Parfum Citrus & Amber", 85.00, 29.00),
                ("Organic Sleep Herbal Tea", 16.00, 4.20),
                ("Electric Sonic Toothbrush", 69.99, 24.00),
                ("Collagen Peptide Powder 300g", 34.99, 12.00),
                ("Rechargeable Facial Cleanser", 49.99, 16.00)
            ]
        }
    }

    channels = ["Online Store", "Mobile App", "Flagship Retail", "Marketplace Partner"]
    channel_weights = [0.45, 0.25, 0.20, 0.10]

    regions = ["North America - East", "North America - West", "Europe - West", "Asia Pacific", "Latin America"]
    payment_methods = ["Credit Card", "Apple Pay / Google Pay", "PayPal", "Buy Now Pay Later (BNPL)", "Store Credit"]

    # Customer base (pool of ~800 customers for realistic repeat rates)
    num_customers = 850
    first_names = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Riley", "Casey", "Avery",
                   "Dakota", "Jamie", "Logan", "Reese", "Rowan", "Quinn", "Skyler", "Cameron", "Jesse", "Eden",
                   "Kai", "Harper", "Finley", "Hayden", "Emerson", "River", "Adrian", "Elliot", "Peyton", "Kendall"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
                  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"]

    customers = []
    for cid in range(1, num_customers + 1):
        c_id = f"CUST-{cid:04d}"
        c_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        c_region = random.choice(regions)
        # RFM skew: ~15% VIP whales, 35% regular buyers, 30% occasional, 20% one-off
        cohort_type = np.random.choice(["VIP", "Regular", "Occasional", "One-off"], p=[0.15, 0.35, 0.30, 0.20])
        customers.append({
            "id": c_id,
            "name": c_name,
            "region": c_region,
            "cohort": cohort_type
        })

    # Timeline: Last 24 months up to recent date
    end_date = datetime(2026, 3, 31)
    start_date = end_date - timedelta(days=730)

    rows = []
    order_counter = 10001

    # Probability of customer buying depends on cohort
    cohort_order_counts = {
        "VIP": (12, 28),
        "Regular": (4, 11),
        "Occasional": (2, 4),
        "One-off": (1, 1)
    }

    # Generate customer orders
    for cust in customers:
        min_ord, max_ord = cohort_order_counts[cust["cohort"]]
        num_cust_orders = random.randint(min_ord, max_ord)

        # Distribute orders over time
        for _ in range(num_cust_orders):
            # Pick a date
            random_days = random.randint(0, 730)
            order_dt = start_date + timedelta(days=random_days)

            # Seasonal demand modifier (Q4 holiday surge, Black Friday boost)
            month = order_dt.month
            day = order_dt.day
            multiplier = 1.0
            if month == 11 and day >= 20: # Black Friday / Cyber Week
                multiplier = 2.4
            elif month == 12: # Christmas / Holiday
                multiplier = 1.9
            elif month in [7, 8]: # Summer sale
                multiplier = 1.3
            elif month in [1, 2]: # Post-holiday dip
                multiplier = 0.85

            # Select category with weighted preference
            cat_name = np.random.choice(list(categories.keys()), p=[0.38, 0.28, 0.20, 0.14])
            cat_info = categories[cat_name]
            prod_tuple = random.choice(cat_info["products"])
            prod_name, unit_price, unit_cost = prod_tuple
            subcat = random.choice(cat_info["subcategories"])

            # Quantity: mostly 1 to 3, occasionally more
            if random.random() < 0.75:
                qty = 1
            elif random.random() < 0.93:
                qty = 2
            elif random.random() < 0.98:
                qty = random.randint(3, 5)
            else:
                qty = random.randint(6, 10)

            # Discount percent: mostly 0, 10%, 15%, 20%
            disc_prob = random.random()
            if disc_prob < 0.50:
                discount_pct = 0.0
            elif disc_prob < 0.75:
                discount_pct = 10.0
            elif disc_prob < 0.90:
                discount_pct = 15.0
            elif disc_prob < 0.97:
                discount_pct = 20.0
            else:
                discount_pct = 30.0

            channel = np.random.choice(channels, p=channel_weights)
            payment = random.choice(payment_methods)

            # Totals
            gross_amount = round(qty * unit_price, 2)
            discount_amount = round(gross_amount * (discount_pct / 100.0), 2)
            net_amount = round(gross_amount - discount_amount, 2)
            total_cost = round(qty * unit_cost, 2)
            profit = round(net_amount - total_cost, 2)

            rows.append({
                "order_id": f"ORD-{order_counter}",
                "order_date": order_dt.strftime("%Y-%m-%d"),
                "customer_id": cust["id"],
                "customer_name": cust["name"],
                "customer_region": cust["region"],
                "category": cat_name,
                "sub_category": subcat,
                "product_name": prod_name,
                "quantity": qty,
                "unit_price": unit_price,
                "discount_percent": discount_pct,
                "total_amount": net_amount,
                "cost_amount": total_cost,
                "profit": profit,
                "channel": channel,
                "payment_method": payment,
                "is_anomaly": False
            })
            order_counter += 1

    # Inject deliberate anomalies for Anomaly Radar
    # Anomaly 1: Severe bulk orders (e.g. quantity 150-300 on high-value electronics)
    anomaly_dates = [
        datetime(2025, 4, 12),
        datetime(2025, 8, 23),
        datetime(2025, 11, 28),
        datetime(2026, 1, 15),
        datetime(2026, 2, 28)
    ]

    for adt in anomaly_dates:
        cust = random.choice(customers)
        bulk_qty = random.randint(120, 250)
        u_price = 199.99
        u_cost = 95.00
        disc = 35.0
        gross = round(bulk_qty * u_price, 2)
        net = round(gross * (1 - disc / 100.0), 2)
        cost = round(bulk_qty * u_cost, 2)
        profit = round(net - cost, 2)

        rows.append({
            "order_id": f"ORD-{order_counter}",
            "order_date": adt.strftime("%Y-%m-%d"),
            "customer_id": cust["id"],
            "customer_name": cust["name"],
            "customer_region": cust["region"],
            "category": "Electronics",
            "sub_category": "Audio",
            "product_name": "Noise-Cancel Wireless Headphones",
            "quantity": bulk_qty,
            "unit_price": u_price,
            "discount_percent": disc,
            "total_amount": net,
            "cost_amount": cost,
            "profit": profit,
            "channel": "Wholesale Partner",
            "payment_method": "Wire Transfer",
            "is_anomaly": True,
            "anomaly_reason": "High-volume bulk quantity (150x standard consumer order)"
        })
        order_counter += 1

    # Anomaly 2: Erroneous discount rate (e.g. 95% discount leading to negative margin)
    for _ in range(4):
        cust = random.choice(customers)
        adt = start_date + timedelta(days=random.randint(50, 680))
        qty = 3
        u_price = 899.99
        u_cost = 650.00
        disc = 90.0 # Accidental coupon stacking
        gross = round(qty * u_price, 2)
        net = round(gross * (1 - disc / 100.0), 2)
        cost = round(qty * u_cost, 2)
        profit = round(net - cost, 2)

        rows.append({
            "order_id": f"ORD-{order_counter}",
            "order_date": adt.strftime("%Y-%m-%d"),
            "customer_id": cust["id"],
            "customer_name": cust["name"],
            "customer_region": cust["region"],
            "category": "Electronics",
            "sub_category": "Laptops",
            "product_name": "ProBook 15 Gen 4",
            "quantity": qty,
            "unit_price": u_price,
            "discount_percent": disc,
            "total_amount": net,
            "cost_amount": cost,
            "profit": profit,
            "channel": "Online Store",
            "payment_method": "Credit Card",
            "is_anomaly": True,
            "anomaly_reason": "Excessive stacked discount (90%) resulting in negative margin (-$1,680)"
        })
        order_counter += 1

    df = pd.DataFrame(rows)
    # Sort chronologically
    df["order_date"] = pd.to_datetime(df["order_date"])
    df = df.sort_values(by="order_date").reset_index(drop=True)
    df["order_date"] = df["order_date"].dt.strftime("%Y-%m-%d")

    # If output path is specified, save CSV
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"Sample retail dataset saved to {output_path} with {len(df)} records.")

    return df

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
    out_file = os.path.join(out_dir, "sample_retail_data.csv")
    generate_sample_retail_dataset(output_path=out_file)
