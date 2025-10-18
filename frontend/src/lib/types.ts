export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  cost: number;
  price?: number; // Precio calculado, opcional
  stockQuantity: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cuitDni: string;
  address: string;
  priceListId?: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  pricePerUnit: number;
  product: Product;
}

export interface Order {
  id: string;
  status: 'pending' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
}

export interface PriceList {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  marginPercentage: number;
}

// --- AÑADIR ESTA INTERFAZ ---
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  cuit: string;
  address: string;
}

export interface PurchaseOrderItem {
    id: string;
    quantity: number;
    costPerUnit: number;
    product: Product;
}
  
export interface PurchaseOrder {
    id: string;
    status: 'pending' | 'partially_received' | 'fully_received' | 'cancelled';
    createdAt: string;
    supplier: Supplier;
    items: PurchaseOrderItem[];
}

// --- AÑADIR ESTOS TIPOS ---
export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  expenseDate: string;
  category: ExpenseCategory;
  categoryId?: number; // <-- AÑADIR ESTA LÍNEA
}

export interface PurchaseOrder {
    id: string;
    status: 'pending' | 'partially_received' | 'fully_received' | 'cancelled';
    createdAt: string;
    supplier: Supplier;
    items: PurchaseOrderItem[];
}

// --- AÑADIR ESTA INTERFAZ ---
export interface DeliveryRoute {
    id: string;
    driverName: string;
    routeDate: string;
    status: string;
    orders: Order[];
}