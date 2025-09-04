// services/authService.js
import { auth } from "../config/betterAuth.js";
import connectDB from "../config/database.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { hash as bcryptHash, compare as bcryptCompare } from "bcryptjs";
dotenv.config();

const RESET_COLLECTION = "password_resets"; // stores reset codes

// nodemailer transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASS,
  },
});

// create 4-digit numeric code
function generate4DigitCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Server-side sign-in
 */
export async function serverSignInEmail({ email, password, headers }) {
  return await auth.api.signInEmail({
    body: { email, password },
    asResponse: true,
    headers,
  });
}

/**
 * Create & send reset code
 */
export async function createAndSendResetCode({ email }) {
  const { db } = await connectDB(); // 👈 FIX: await here
  const code = generate4DigitCode();
  const hashed = await bcryptHash(code, 10);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 min expiry

  await db
    .collection(RESET_COLLECTION)
    .updateOne(
      { email: email.toLowerCase() },
      { $set: { codeHash: hashed, expiresAt, createdAt: new Date() } },
      { upsert: true }
    );

  // send email
  const mail = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Your password reset code",
    text: `Your password reset code is ${code}. It will expire in 10 minutes.`,
    html: `<p>Your password reset code is <strong>${code}</strong>. It will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mail);

  return true;
}

/**
 * Verify code
 */
export async function verifyResetCode({ email, code }) {
  const { db } = await connectDB(); // 👈 FIX
  const record = await db
    .collection(RESET_COLLECTION)
    .findOne({ email: email.toLowerCase() });

  if (!record) return false;
  if (record.expiresAt && new Date() > new Date(record.expiresAt)) return false;

  return await bcryptCompare(code, record.codeHash);
}

/**
 * Reset password
 */
// services/authService.js
export async function resetPassword({ email, code, newPassword }) {
  const { db } = await connectDB();

  // 1. Verify code
  const isValid = await verifyResetCode({ email, code });
  if (!isValid) throw new Error("Invalid or expired code");

  // 2. Validate new password
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (!/\d/.test(newPassword)) {
    throw new Error("Password must include at least one number");
  }

  // 3. Hash password
  const hashed = await bcryptHash(newPassword, 12);

  // 4. Find user first
  const user = await db.collection("user").findOne({
    email: email.toLowerCase(),
  });
  if (!user) throw new Error("User not found");

  console.log("User found:", user._id);

  // 5. Find linked account
  const accountDoc = await db.collection("account").findOne({
    userId: new ObjectId(user._id),
    providerId: "credential",
  });

  if (!accountDoc) throw new Error("Account not found (initial lookup)");

  // 6. Update by account _id
  const accountRes = await db
    .collection("account")
    .findOneAndUpdate(
      { _id: accountDoc._id },
      { $set: { password: hashed, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

  if (!accountRes.value) throw new Error("Account not found after update");

  // 7. Consume reset code
  await db.collection(RESET_COLLECTION).deleteOne({
    email: email.toLowerCase(),
  });

  return true;
}


