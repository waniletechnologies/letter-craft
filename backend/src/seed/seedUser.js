// seedUser.js
import dotenv from "dotenv";
import { auth } from "../config/betterAuth.js";

dotenv.config({ path: "./.env" });

async function seedUser() {
  try {
    const response = await auth.api.signUpEmail({
      body: {
        email: "javaidadil835@gmail.com",
        password: "adil123!",
        name: "Adil Javaid",
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

seedUser();
