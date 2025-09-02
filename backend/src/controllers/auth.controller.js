// controllers/authController.js
import {
  serverSignInEmail,
  createAndSendResetCode,
  verifyResetCode,
  resetPassword,
} from "../services/auth.service.js";
import { auth } from "../config/betterAuth.js";

export async function loginHandler(req, res) {
  try {
    const { email, password } = req.body;
    console.log("Data", req.body);
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    // Call Better Auth server sign-in endpoint so it issues cookie set-cookie header
    // Pass incoming headers so better-auth can use them for cookie domain/path if needed
    const response = await serverSignInEmail({
      email,
      password,
      headers: req.headers,
    });

    // If response.ok is true, we need to forward Set-Cookie header to client
    if (response.ok) {
      // get set-cookie header
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        // set cookie on express response (this is the session cookie)
        res.setHeader("set-cookie", setCookie);
      }
      const data = await response.json();
      return res.status(200).json({ ok: true, data });
    } else {
      // forward error payload
      const payload = await response.json();
      return res
        .status(response.status)
        .json({
          ok: false,
          message: payload?.message || "Invalid credentials",
        });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, message: err.message || "Server error" });
  }
}

export async function requestResetHandler(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    await createAndSendResetCode({ email });
    return res.json({
      ok: true,
      message: "Reset code sent to email (if account exists)",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, message: err.message || "Server error" });
  }
}

export async function verifyCodeHandler(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "Email and code required" });

    const ok = await verifyResetCode({ email, code });
    return res.json({ ok });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ ok: false, message: err.message || "Server error" });
  }
}

export async function resetPasswordHandler(req, res) {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword)
      return res.status(400).json({ message: "Missing fields" });

    const updated = await resetPassword({ email, code, newPassword });
    console.log("Update: ", email, code, newPassword)
    console.log("Looking for account:", {
      userId: user._id,
      type: typeof user._id,
    });

    if (!updated)
      return res
        .status(400)
        .json({
          ok: false,
          message: "Unable to update password (user not found)",
        });

    // Optionally auto-sign-in after password reset: call auth.api.signInEmail
    const response = await auth.api.signInEmail({
      body: { email, password: newPassword },
      asResponse: true,
    });
    console.log("Password: ", newPassword)
    if (response.ok) {
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) res.setHeader("set-cookie", setCookie);
    }

    return res.json({ ok: true, message: "Password updated" });

  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ ok: false, message: err.message || "Server error" });
  }
}

export async function meHandler(req, res) {
  try {
    // get current user from BetterAuth session
    const session = await auth.api.getSession({
      headers: req.headers, // includes cookie
      asResponse: true,
    });

    if (session.ok) {
      const data = await session.json();
      return res.json({ ok: true, user: data.user });
    }

    return res.status(401).json({ ok: false, message: "Not authenticated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}
