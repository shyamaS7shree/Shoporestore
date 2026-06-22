import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { getLoginOtpStore, hashLoginOtp } from "@/lib/loginOtp";

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ message: "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local" }, { status: 500 });
    }

    const { phone, otp } = await request.json();
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    const cleanOtp = String(otp || "").replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      return NextResponse.json({ message: "Valid mobile number is required" }, { status: 400 });
    }

    if (cleanOtp.length !== 6) {
      return NextResponse.json({ message: "Enter the 6 digit OTP" }, { status: 400 });
    }

    const store = getLoginOtpStore();
    const saved = store.get(cleanPhone);

    if (!saved) {
      return NextResponse.json({ message: "OTP expired. Please request a new OTP." }, { status: 400 });
    }

    if (Date.now() > saved.expiresAt) {
      store.delete(cleanPhone);
      return NextResponse.json({ message: "OTP expired. Please request a new OTP." }, { status: 400 });
    }

    if (saved.attempts >= 5) {
      store.delete(cleanPhone);
      return NextResponse.json({ message: "Too many wrong attempts. Please request a new OTP." }, { status: 429 });
    }

    const hash = hashLoginOtp(cleanPhone, cleanOtp);
    if (hash !== saved.hash) {
      saved.attempts += 1;
      return NextResponse.json({ message: "Incorrect OTP" }, { status: 401 });
    }

    store.delete(cleanPhone);

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email, phone, created_at")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ message: "Mobile number is not registered" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Login successful",
      accessToken: crypto.randomUUID(),
      refreshToken: crypto.randomUUID(),
      user: {
        id: user.id,
        fullName: user.name,
        name: user.name,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
      },
    });
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
