import axios from "axios";
import {
  LOGIN_URL,
  REPORT_URL,
  API_CREDENTIALS,
} from "../config/api.config.js";

export async function fetchApiToken() {
  // Send as URLSearchParams (query/form encoding)
  const params = new URLSearchParams();
  params.append("email", API_CREDENTIALS.email);
  params.append("password", API_CREDENTIALS.password);

  const res = await axios.post(LOGIN_URL, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.data.success) {
    throw new Error("API authentication failed");
  }
  console.log(res.data.data.token);
  return res.data.data.token;
}

export async function fetchMemberReport(token, username, password) {
  // Again, send as URLSearchParams, not JSON
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  const res = await axios.post(REPORT_URL, params, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!res.data.success) {
    throw new Error("Failed to fetch member report");
  }
  return res.data.data;
}
