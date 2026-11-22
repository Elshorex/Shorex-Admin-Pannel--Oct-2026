import mongoose from "mongoose";

export const clearDatabase = async () => {
  try {
    const db = mongoose.connection;
    const collections = await db.db.listCollections().toArray();

    if (collections.length === 0) {
      console.log("📭 No collections found to delete — database already empty.");
      return;
    }

    console.log(`🧨 Clearing ${collections.length} collections...\n`);

    for (const collection of collections) {
      await db.dropCollection(collection.name);
      console.log(`✅ Dropped: ${collection.name}`);
    }

    console.log("\n🚀 Database fully cleared!\n");
  } catch (err) {
    console.error("❌ Error while clearing database:", err);
  }
};