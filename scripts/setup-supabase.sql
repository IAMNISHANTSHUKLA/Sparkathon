-- Add the new tables for the integrated Walmart-inspired features

-- Shelf scan results table
CREATE TABLE IF NOT EXISTS shelf_scan_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id TEXT NOT NULL,
  sku_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_stock', 'out_of_stock', 'misplaced', 'low_stock')),
  confidence DECIMAL(3,2) NOT NULL,
  location JSONB NOT NULL,
  planogram_compliance BOOLEAN NOT NULL DEFAULT false,
  detected_quantity INTEGER NOT NULL DEFAULT 0,
  expected_quantity INTEGER NOT NULL DEFAULT 0,
  store_id TEXT,
  section TEXT,
  scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Route optimization table
CREATE TABLE IF NOT EXISTS route_optimization (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_name TEXT NOT NULL,
  origin_location TEXT NOT NULL,
  destination_locations TEXT[] NOT NULL,
  optimized_sequence INTEGER[] NOT NULL,
  total_distance_miles DECIMAL(8,2) NOT NULL,
  estimated_time_hours DECIMAL(4,2) NOT NULL,
  fuel_cost_estimate DECIMAL(8,2) NOT NULL,
  driver_assignments TEXT[] NOT NULL,
  vehicle_requirements JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food traceability scans table
CREATE TABLE IF NOT EXISTS food_traceability_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code TEXT NOT NULL,
  product_id TEXT NOT NULL,
  batch_id TEXT NOT NULL,
  scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blockchain_verified BOOLEAN NOT NULL DEFAULT false,
  quality_score INTEGER NOT NULL,
  origin_location TEXT NOT NULL,
  sustainability_score TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML models performance tracking
CREATE TABLE IF NOT EXISTS ml_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('demand_forecast', 'inventory_optimization', 'anomaly_detection', 'route_optimization')),
  version TEXT NOT NULL,
  accuracy_metrics JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'testing')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample ML models
INSERT INTO ml_models (model_name, model_type, version, accuracy_metrics, status) VALUES
('XGBoost Inventory Optimizer', 'demand_forecast', 'v2.1.0', '{"mape": 0.085, "rmse": 12.4, "mae": 8.7}', 'active'),
('LSTM Time Series Predictor', 'demand_forecast', 'v1.8.2', '{"mape": 0.092, "rmse": 14.1, "mae": 9.2}', 'active'),
('Prophet Seasonal Forecaster', 'demand_forecast', 'v1.5.1', '{"mape": 0.098, "rmse": 15.8, "mae": 10.1}', 'active'),
('Transformer Demand Model', 'demand_forecast', 'v3.0.0', '{"mape": 0.078, "rmse": 11.2, "mae": 7.9}', 'testing'),
('Isolation Forest Anomaly Detector', 'anomaly_detection', 'v1.2.0', '{"precision": 0.94, "recall": 0.89, "f1_score": 0.91}', 'active'),
('Google OR-Tools Route Optimizer', 'route_optimization', 'v2.3.1', '{"distance_savings": 0.187, "time_savings": 0.223, "cost_reduction": 0.158}', 'active')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shelf_scan_results_sku_id ON shelf_scan_results(sku_id);
CREATE INDEX IF NOT EXISTS idx_shelf_scan_results_store_id ON shelf_scan_results(store_id);
CREATE INDEX IF NOT EXISTS idx_shelf_scan_results_scan_timestamp ON shelf_scan_results(scan_timestamp);

CREATE INDEX IF NOT EXISTS idx_route_optimization_status ON route_optimization(status);
CREATE INDEX IF NOT EXISTS idx_route_optimization_created_at ON route_optimization(created_at);

CREATE INDEX IF NOT EXISTS idx_food_traceability_scans_product_id ON food_traceability_scans(product_id);
CREATE INDEX IF NOT EXISTS idx_food_traceability_scans_batch_id ON food_traceability_scans(batch_id);
CREATE INDEX IF NOT EXISTS idx_food_traceability_scans_qr_code ON food_traceability_scans(qr_code);

CREATE INDEX IF NOT EXISTS idx_ml_models_model_type ON ml_models(model_type);
CREATE INDEX IF NOT EXISTS idx_ml_models_status ON ml_models(status);

-- Update the navbar to include new features
-- This will be handled in the navbar component update
