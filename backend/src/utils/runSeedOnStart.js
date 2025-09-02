import { MongoClient } from "mongodb";

const USERS = [
  { email: process.env.ADMIN_EMAIL || "admin@dentistgoldcard.com", password: process.env.ADMIN_PASSWORD || "admin12345", role: "admin" },
];

export async function runSeedOnStart() {
  if (!process.env.MONGODB_URI) {
    console.warn("❌ MONGODB_URI not set; skipping seed");
    return;
  }
  const backendBaseURL = process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  const userCol = db.collection("user");

  for (const u of USERS) {
    try {
      const exists = await userCol.findOne({ email: u.email });
      if (exists) {
        console.log(`✅ [seed] Skipping existing ${u.email}`);
        continue;
      }
      const res = await fetch(`${backendBaseURL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: u.email, password: u.password, name: u.email.split("@")[0], role: u.role }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`❌ [seed] Failed creating ${u.email}: ${res.status} ${body}`);
      } else {
        console.log(`✅ [seed] Created ${u.email} (${u.role})`);
      }
    } catch (e) {
      console.error(`❌ [seed] Error for ${u.email}:`, e?.message || e);
    }
  }

  await client.close();
}


