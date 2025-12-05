export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  email: string;
}

export interface Order {
  id?: string;
  userId: string;
  products: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod?: "credit-card" | "debit-card" | "paypal" | "other";
  notes?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  status?:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
}
