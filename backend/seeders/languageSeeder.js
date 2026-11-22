import Language from "../src/models/language.model/language.model.js";

const languages = [
  { _id: 1, key: "ar", direction: "rtl", name: { ar: "عربي", en: "Arabic", es: "árabe" } },
  { _id: 2, key: "en", direction: "ltr", name: { ar: "إنجليزي", en: "English", es: "Inglés" } },
  { _id: 3, key: "es", direction: "ltr", name: { ar: "إسباني", en: "Spanish", es: "Español" } },
];

export default async function seedLanguages() {
  console.log("🌐 Seeding Languages...");

  for (const lang of languages) {
    await Language.updateOne({ key: lang.key }, { $set: lang }, { upsert: true });
  }

  console.log("✅ Languages seeded successfully (with fixed IDs).");
}
