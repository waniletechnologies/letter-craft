// auth-config.js
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { compare, hash } from "bcryptjs";
import connectDB from "./database.js";
import dotenv from "dotenv";
dotenv.config();

await connectDB();
const { db } = await connectDB();

if (!process.env.BACKEND_BASE_URL)
  throw new Error("BACKEND_BASE_URL is not set");
if (!process.env.FRONTEND_ORIGIN) throw new Error("FRONTEND_ORIGIN is not set");
if (!process.env.BETTER_AUTH_SECRET)
  throw new Error("BETTER_AUTH_SECRET is not set");

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: `${process.env.BACKEND_BASE_URL.replace(/\/$/, "")}/api/auth`,
  trustedOrigins: [process.env.FRONTEND_ORIGIN.replace(/\/$/, "")],
  cookies: {
    sameSite: "lax",
  },
  database: mongodbAdapter(db, {
    collections: {
      User: "user", // collection names
      Account: "account",
      Session: "session",
      Verification: "verification",
    },
  }),
  user: {
    additionalFields: {
      // role: { type: "string", defaultValue: "patient" },
      firstName: { type: "string" },
      lastName: { type: "string" },
      image: { type: "string", required: false },
      // active: { type: "boolean", defaultValue: true },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    password: {
      hash: async (plain) => {
        return await hash(plain, 12);
      },
      verify: async (password, hashed) => {
        // use bcrypt compare logic (same as example you provided)
        let actualPassword;
        let actualHash;

        if (typeof password === "string" && typeof hashed === "string") {
          actualPassword = password;
          actualHash = hashed;
        } else if (typeof password === "object" && password !== null) {
          actualPassword =
            password.password || password.plaintext || password.input;
          actualHash = password.hash || password.hashed || password.stored;
        } else if (typeof hashed === "object" && hashed !== null) {
          actualPassword = hashed.password || hashed.plaintext || hashed.input;
          actualHash = hashed.hash || hashed.hashed || hashed.stored;
        }

        if (!actualPassword || !actualHash) return false;

        try {
          return await compare(actualPassword, actualHash);
        } catch (err) {
          return false;
        }
      },
    },
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
});
