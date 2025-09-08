// middleware/authMiddleware.js
import { auth } from "../config/betterAuth.js";

/**
 * Express middleware to protect routes — checks Better Auth session
 * Usage: app.get('/private', requireAuth, (req, res) => { ... })
 */
export async function requireAuth(req, res, next) {
  try {
    // auth.api.getSession can read from headers to locate cookie-driven session
    // pass headers to method
    const result = await auth.api.getSession({
      headers: {
        cookie: req.headers.cookie ?? "",
      },
      asResponse: false,
    });

    // result could be null if no session
    if (!result || !result.user) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    // attach user/session to req for route handlers
    req.user = result.user;
    req.session = result;
    next();
  } catch (err) {
    console.error("requireAuth error:", err);
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
}
