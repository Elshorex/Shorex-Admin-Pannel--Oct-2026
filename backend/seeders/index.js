import { connectDB, disconnectDB } from "./db.js";
import seedLanguages from "./languageSeeder.js";
import seedCurrencies from "./currenciesSeeder.js";
import { seedAdmin } from "./adminSeeder.js";
import seedPrivacy from "./policyTerms.js";
import { clearDatabase } from "./cleanDB.js";

const runAllSeeders = async () => {
  console.log("🌱 Starting database seed process...\n");

  await connectDB();

  try {
    
    await clearDatabase()
    await seedLanguages();
    await seedCurrencies();
    await seedAdmin();
    await seedPrivacy();

    console.log("\n✅ All seeders executed successfully!");
  } catch (err) {
    console.error("❌ Seeder error:", err);
  } finally {
    await disconnectDB();
    // process.exit(0);
  }
};

runAllSeeders();
