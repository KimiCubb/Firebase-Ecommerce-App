import { migrateProductsToFirestore } from "./migrateProducts";

window.runProductMigration = async function () {
  try {
    console.log("🚀 Starting product migration...");
    await migrateProductsToFirestore();
    console.log("✅ Migration completed!");
    alert("Products migrated successfully! Check your Firestore console.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    alert("Migration failed. Check console for details.");
  }
};

console.log("Migration function loaded. Run: runProductMigration()");
