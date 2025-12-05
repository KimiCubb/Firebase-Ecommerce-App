import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import type { Product } from "./types/product";

const isProductsCollectionEmpty = async (): Promise<boolean> => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.empty;
  } catch (error) {
    console.error("Error checking products collection:", error);
    return false;
  }
};

export const migrateProductsToFirestore = async (
  products: Omit<Product, "id">[]
): Promise<void> => {
  try {
    console.log("🔍 Checking if products collection is empty...");
    const isEmpty = await isProductsCollectionEmpty();
    if (!isEmpty) {
      console.log(
        "✅ Products collection already has data. Skipping migration."
      );
      return;
    }
    console.log(`📦 Found ${products.length} products to migrate`);
    console.log("🔄 Starting migration to Firestore...");
    const promises = products.map(async (product) => {
      return addDoc(collection(db, "products"), {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    await Promise.all(promises);
    console.log("✅ Migration completed successfully!");
    console.log(`🎉 ${products.length} products added to Firestore`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};

export const runMigration = (products: Omit<Product, "id">[]) => {
  console.log("🚀 Starting product migration...");
  migrateProductsToFirestore(products)
    .then(() => {
      console.log("🎯 Migration process completed!");
    })
    .catch((error) => {
      console.error("💥 Migration process failed:", error);
    });
};
