import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { message: "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local" },
        { status: 500 }
      );
    }

    const { phone, password } = await request.json();
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    const cleanPassword = String(password || "");

    if (cleanPhone.length !== 10) {
      return NextResponse.json({ message: "Valid mobile number is required" }, { status: 400 });
    }

    if (!cleanPassword) {
      return NextResponse.json({ message: "Password is required" }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email, phone, password, created_at")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ message: "Mobile number is not registered" }, { status: 404 });
    }

    if (!user.password || !verifyPassword(cleanPassword, user.password)) {
      return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
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
