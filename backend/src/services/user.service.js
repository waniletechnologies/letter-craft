// services/userService.js
import connectDB  from "../config/database.js";
import { ObjectId } from "mongodb";

const USERS = "user"; // same as in better-auth config

export async function findUserByEmail(email) {
  const db = connectDB();
  return db.collection(USERS).findOne({ email: email.toLowerCase() });
}

export async function findUserById(id) {
  const db = connectDB();
  return db
    .collection(USERS)
    .findOne({ _id: typeof id === "string" ? new ObjectId(id) : id });
}

export async function updateUserPassword(userId, hashedPassword) {
  const db = connectDB();
  const res = await db.collection(USERS).updateOne(
    { _id: typeof userId === "string" ? new ObjectId(userId) : userId },
    { $set: { password: hashedPassword } } // better-auth stores password field in user collection
  );
  return res.modifiedCount > 0;
}
