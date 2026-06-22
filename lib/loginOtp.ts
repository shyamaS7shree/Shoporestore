import crypto from "crypto";

const otpStore = globalThis as typeof globalThis & {
  shoporeLoginOtps?: Map<string, { hash: string; expiresAt: number; attempts: number }>;
};

export function getLoginOtpStore() {
  if (!otpStore.shoporeLoginOtps) {
    otpStore.shoporeLoginOtps = new Map();
  }
  return otpStore.shoporeLoginOtps;
}

export function hashLoginOtp(phone: string, otp: string) {
  return crypto
    .createHash("sha256")
    .update(`${phone}:${otp}:${process.env.SUPABASE_SERVICE_ROLE_KEY || "shopore"}`)
    .digest("hex");
}
