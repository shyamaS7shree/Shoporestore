import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { sendShoporeMail } from "@/lib/mailer";
import { getLoginOtpStore, hashLoginOtp } from "@/lib/loginOtp";

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ message: "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local" }, { status: 500 });
    }

    const { phone } = await request.json();
    const cleanPhone = String(phone || "").replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      return NextResponse.json({ message: "Valid mobile number is required" }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email, phone")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!user?.email) {
      return NextResponse.json({ message: "Mobile number is not registered" }, { status: 404 });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    getLoginOtpStore().set(cleanPhone, {
      hash: hashLoginOtp(cleanPhone, otp),
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    const emailError = await sendShoporeMail({
      to: user.email,
      subject: "Your Shopore login OTP",
      title: "Login OTP",
      userName: user.name,
      intro: `Your Shopore login OTP is ${otp}. This code expires in 5 minutes.`,
    });

    if (emailError) {
      return NextResponse.json({ message: emailError }, { status: 500 });
    }

    const [name, domain] = String(user.email).split("@");
    const maskedEmail = `${name.slice(0, 2)}***@${domain}`;
    return NextResponse.json({ message: "OTP sent", email: maskedEmail });
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
