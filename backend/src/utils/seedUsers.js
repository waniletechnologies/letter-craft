import "dotenv/config";
import { MongoClient } from "mongodb";
import { auth } from "../config/betterAuth.js";

async function ensureUser({ email, password, role }) {
  const existing = await auth.api.getUserByEmail({ email });
  if (existing) {
    return existing;
  }
  const created = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: email.split("@")[0],
      role,
      emailVerified: new Date().toISOString(),
    },
  });
  return created?.user ?? created;
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  // touch DB to ensure connection before Better Auth adapter operations
  await client.db().command({ ping: 1 });

  const users = [
    { email: process.env.ADMIN_EMAIL || "admin@dentistgoldcard.com", password: process.env.ADMIN_PASSWORD || "admin12345", role: "admin" },
    { email: "drspencer@mail.com", password: "12345678", role: "dentist" },
    { email: "madisonfaulkner@hotmail.com", password: "fabfab-jatmeS-qamva1", role: "patient" },
    { email: "maddy@thedentaldoctors.co.uk", password: "12345678", role: "partner" },
  ];

  for (const u of users) {
    try {
      const user = await ensureUser(u);
      console.log(`Ensured user ${u.email} (${u.role}) -> ${user?.id || "ok"}`);
    } catch (e) {
      console.error(`Failed ensuring ${u.email}:`, e?.message || e);
    }
  }

  await client.close();
}

main().then(() => process.exit(0));


