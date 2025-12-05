import type { Product } from "./product";

export interface OrderItem {
  product: Product;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
  };
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
}