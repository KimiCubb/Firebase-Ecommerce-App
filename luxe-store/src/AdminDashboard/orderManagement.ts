import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { Order } from "../types/product";

export const createOrder = async (
  order: Omit<Order, "id">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "orders"), order);
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};
