export interface Product {
    id: number;
    name: string;
    sku: string;
    description: string | null;
    category: number;
    supplier: number;
    current_stock: number;
    minimum_stock: number;
    price: string;
}

export interface Supplier {
    id: number;
    name: string;
    contact: string;
    email: string;
    phone: string;
    address: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface StockMovement {
    id: number;
    product: number;
    type: 'IN' | 'OUT';
    quantity: number;
    timestamp: string;
    alert?: string;
}

export interface DashboardData {
    total_products?: number;
    low_stock_products?: number;
    inventory_value?: number | string;
    [key: string]: unknown;
}

export interface AlertProduct {
    id: number;
    name: string;
    sku: string | null;
    current_stock: number;
    minimum_stock: number;
    alert_level: 'CRITICAL' | 'HIGH' | 'LOW';
    category__name?: string;
}

export interface AlertsResponse {
    products_with_alerts: AlertProduct[];
    critical_stock_products: AlertProduct[];
    high_stock_products: AlertProduct[];
    low_stock_products: AlertProduct[];
    total_critical_stock_products: number;
    total_high_stock_products: number;
    total_low_stock_products: number;
}

export interface TotalProduct {
    id: number;
    total_products: number;
}
