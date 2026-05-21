export interface Product {
    id: number;
    name: string;
    // sku: string;
    current_stock: number;
    min_stock: number;
    max_stock: number;
    supplier_id: number;
    category_id: number;
    // price: number;
    // created_at: string;
    // updated_at: string;
}

// export interface Supplier {
//     id: number;
//     name: string;
//     contact_name: string;
//     email: string;
//     phone: string;
//     address: string;
//     created_at: string;
//     updated_at: string;
// }

// export interface Category {
//     id: number;
//     name: string;
//     description: string;
//     created_at: string;
//     updated_at: string;
// }

// export interface StockMovement {
//     id: number;
//     product_id: number;
//     movement_type: "in" | "out";
//     quantity: number;
//     reference: string;
//     notes: string;
//     created_at: string;
//     user_id?: number;
// }
