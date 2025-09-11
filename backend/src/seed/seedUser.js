import dotenv from "dotenv";
import { auth } from "../config/betterAuth.js";

dotenv.config({ path: "./.env" });

export async function seedUser() {
  try {
    const response = await auth.api.signUpEmail({
      body: {
        email: "yesacij599@futurejs.com",
        password: "12345678",
        name: "Super Admin",
      },
      asResponse: true,
    });

    if (response.ok) {
      console.log("✅ User created via BetterAuth");
      console.log(await response.json());
    } else {
      console.error("❌ Error creating user:", await response.json());
    }
  } catch (err) {
    console.error("❌ Seed error:", err);
  }
}
