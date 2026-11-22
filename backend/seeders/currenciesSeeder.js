import Currency from "../src/models/currency.model/currency.model.js";

const currencies = [
  {
    name: { ar: "الدولار الأمريكي", en: "US Dollar", es: "Dólar estadounidense" },
    symbol: "$",
    precision: 2,
  },
  {
    name: { ar: "اليورو", en: "Euro", es: "Euro" },
    symbol: "€",
    precision: 2,
  },
  {
    name: { ar: "الجنيه المصري", en: "Egyptian Pound", es: "Libra egipcia" },
    symbol: "E£",
    precision: 2,
  },
];

export default async function seedCurrencies() {
  for (const data of currencies) {
      const existing = await Currency.findOne({
        "name.en": data.name.en,
        deleted: false,
      });

      if (existing) {
        console.log(`⚠️ Skipped: "${data.name.en}" already exists (id: ${existing._id})`);
        continue;
      }

      const created = await Currency.create(data);
      console.log("✅ Created:", created.toJSON());
    }
}
