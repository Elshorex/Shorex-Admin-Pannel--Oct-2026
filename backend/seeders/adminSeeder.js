import User from "../src/models/user.model/user.model.js";
import Country from "../src/models/country.model/country.model.js";

/**
 * 🚀 Seed Super Admin User
 */
export const seedAdmin = async () => {
  console.log("🚀 Seeding Admin...");

  // ✅ Check if Admin already exists
  const existingAdmin = await User.findOne({
    email: "shorexgroup@gmail.com",
    deleted: false,
  });

  if (existingAdmin) {
    existingAdmin.password = "Shorex_2026@01";
    await existingAdmin.save();
    console.log(`✅ Admin password updated: ${existingAdmin.email}`);
    return;
  }

  // ✅ Find country (optional)
  const country = await Country.findOne({ "name.en": "Pakistan", deleted: false });

  // ✅ Create Admin
  const admin = await User.create({
    name: "Super Admin",
    email: "shorexgroup@gmail.com",
    password: "Shorex_2026@01", // will be auto-hashed by pre-save hook
    phone: "03001234567",
    type: "ADMIN",
    status: 1,
    role: 1, // you can adjust this later if your roles are stored separately
    country: country ? country._id : 1,
    countryCode: "+92",
    countryKey: "PK",
    language: "en",
    deleted: false,
  });

  console.log("✅ Admin created successfully:", admin.toJSON());
};
