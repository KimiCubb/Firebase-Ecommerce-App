import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { Product } from "../types/product";

export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setData(products);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return { data, isLoading, error };
}

export function useProductsByCategory(category: string) {
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!category) {
      setData([]);
      setIsLoading(false);
      return;
    }
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "products"),
          where("category", "==", category)
        );
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setData(products);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  return { data, isLoading, error };
}
