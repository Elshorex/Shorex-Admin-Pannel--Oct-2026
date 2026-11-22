import Privacy from "../src/models/privacy-conditions.model/privacy-conditions.model.js";

const privacyItems = [
  {
         _id: 1,
        description: {
          en: "<h2>Privacy Policy</h2><p>This is a dummy English Privacy Policy for testing purposes.</p>",
          ar: "<h2>سياسة الخصوصية</h2><p>هذه سياسة خصوصية تجريبية باللغة العربية.</p>",
          es: "<h2>Política de Privacidad</h2><p>Esta es una política de privacidad de prueba en español.</p>",
        },
        type: "PRIVACY_POLICY",
        status: 1,
        deleted: false,
      },
      {
         _id: 2,
        description: {
          en: "<h2>Terms & Conditions</h2><p>These are dummy English Terms and Conditions for testing.</p>",
          ar: "<h2>الشروط والأحكام</h2><p>هذه شروط وأحكام تجريبية باللغة العربية.</p>",
          es: "<h2>Términos y Condiciones</h2><p>Estos son términos y condiciones de prueba en español.</p>",
        },
        type: "TERMS_CONDITION",
        status: 1,
        deleted: false,
      },
];

export default async function seedPrivacy() {
  for (const data of privacyItems) {
    const existing = await Privacy.findOne({ _id: data._id });

    if (existing) {
      console.log(`⚠️ Skipped: "${data.type}" already exists (id: ${data._id})`);
      continue;
    }

    const created = await Privacy.create(data);
    console.log(`✅ Created ${data.type}:`, created.toJSON());
  }
}
