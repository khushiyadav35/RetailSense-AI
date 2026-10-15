export interface KPIs {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_units: number;
  average_order_value: number;
  profit_margin: number;
  repeat_customer_rate: number;
  mom_revenue_growth: number;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface DailyTrend {
  date: string;
  revenue: number;
  units: number;
}

export interface CategoryData {
  category: string;
  revenue: number;
  share: number;
  orders: number;
  units: number;
  profit: number;
}

export interface TopProduct {
  product: string;
  category: string;
  revenue: number;
  units: number;
  orders: number;
}

export interface ChannelData {
  channel: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface RegionData {
  region: string;
  revenue: number;
  customers: number;
}

export interface OverviewData {
  kpis: KPIs;
  monthly_trends: MonthlyTrend[];
  recent_daily_trends: DailyTrend[];
  category_breakdown: CategoryData[];
  top_products: TopProduct[];
  channel_breakdown: ChannelData[];
  region_breakdown: RegionData[];
  date_range: {
    start: string;
    end: string;
  };
}

export interface ForecastPoint {
  date: string;
  forecast: number;
  simulated: number;
  upper_95: number;
  lower_95: number;
  upper_80: number;
  lower_80: number;
}

export interface HistoricalPoint {
  date: string;
  actual: number;
  quantity: number;
}

export interface CategoryForecast {
  category: string;
  projected_revenue: number;
  share_pct: number;
}

export interface ForecastSummary {
  horizon_days: number;
  granularity: string;
  baseline_projected_revenue: number;
  simulated_projected_revenue: number;
  revenue_delta: number;
  revenue_delta_pct: number;
  model_accuracy_pct: number;
  rmse: number;
}

export interface ForecastResponse {
  historical: HistoricalPoint[];
  forecast: ForecastPoint[];
  category_forecasts: CategoryForecast[];
  summary: ForecastSummary;
  scenario_params: {
    price_change_pct: number;
    marketing_boost_pct: number;
    implied_elasticity: number;
  };
}

export interface CustomerSegment {
  segment: string;
  customer_count: number;
  share_pct: number;
  total_revenue: number;
  revenue_share_pct: number;
  avg_spend: number;
  avg_recency_days: number;
  avg_frequency: number;
  avg_churn_risk_pct: number;
  playbook: {
    action: string;
    recommended_offer: string;
    goal: string;
  };
}

export interface CustomerRecord {
  customer_id: string;
  customer_name: string;
  region: string;
  segment: string;
  total_spend: number;
  orders_count: number;
  aov: number;
  recency_days: number;
  last_order: string;
  favorite_category: string;
  churn_risk_score: number;
  churn_tier: string;
}

export interface SegmentationResponse {
  summary: {
    total_customers: number;
    high_risk_customers_count: number;
    champions_count: number;
    vip_revenue_share_pct: number;
    avg_customer_ltv: number;
  };
  segments: CustomerSegment[];
  churn_distribution: Record<string, number>;
  customers: CustomerRecord[];
}

export interface AnomalyRecord {
  order_id: string;
  order_date: string;
  customer_name: string;
  customer_id: string;
  category: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total_amount: number;
  profit: number;
  channel: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  reason: string;
}

export interface DailyAnomalyPoint {
  date: string;
  revenue: number;
  baseline: number;
  is_anomaly: boolean;
  anomaly_type: "Spike" | "Dip" | "Normal";
}

export interface AnomalyResponse {
  summary: {
    total_anomalies: number;
    critical_alerts: number;
    high_priority_alerts: number;
    estimated_revenue_at_risk: number;
    daily_anomalous_days_count: number;
  };
  records: AnomalyRecord[];
  daily_timeline: DailyAnomalyPoint[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}
