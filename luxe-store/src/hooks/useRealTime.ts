import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { Product } from "../types/product";

/**
 * Custom hook for real-time product updates using Firestore listeners
 * Replaces getDocs with onSnapshot for live synchronization
 * @returns Object containing products, loading state, and error state
 */
export const useRealTimeProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    let isSubscribed = true;

    try {
      // Create query with optional ordering
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

      // Set up real-time listener
      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          if (isSubscribed) {
            const productsData: Product[] = [];

            querySnapshot.forEach((doc) => {
              productsData.push({
                id: doc.id,
                ...doc.data(),
              } as Product);
            });

            setProducts(productsData);
            setLoading(false);
            setError(null);
          }
        },
        (err) => {
          if (isSubscribed) {
            console.error("Error in real-time products listener:", err);
            setError(
              "Failed to load products in real-time. Falling back to manual refresh."
            );
            setLoading(false);
          }
        }
      );
    } catch (err) {
      if (isSubscribed) {
        console.error("Error setting up products listener:", err);
        // Errors from listener will be handled in error callback
      }
    }

    // Cleanup subscription on unmount
    return () => {
      isSubscribed = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { products, loading, error };
};

interface UserProfileData {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  phone?: string;
  role?: "user" | "admin";
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Custom hook for real-time user profile data
 * @param userId - The user ID to listen to
 * @returns Object containing user profile, loading state, and error state
 */
export const useRealTimeUserProfile = (userId: string | null) => {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    let isSubscribed = true;

    const setupListener = () => {
      if (!userId) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = collection(db, "users");
        const q = query(userRef);

        unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            if (isSubscribed) {
              let found = false;
              querySnapshot.forEach((doc) => {
                if (doc.id === userId) {
                  setUserProfile(doc.data() as UserProfileData);
                  found = true;
                }
              });

              if (!found) {
                setUserProfile(null);
              }
              setLoading(false);
              setError(null);
            }
          },
          (err) => {
            if (isSubscribed) {
              console.error("Error in real-time user profile listener:", err);
              setError("Failed to load user profile in real-time");
              setLoading(false);
            }
          }
        );
      } catch (err) {
        if (isSubscribed) {
          console.error("Error setting up user profile listener:", err);
        }
      }
    };

    setupListener();

    return () => {
      isSubscribed = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  return { userProfile, loading, error };
};
