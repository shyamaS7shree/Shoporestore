import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createPasswordHash } from "@/lib/password";

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { message: "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local" },
        { status: 500 }
      );
    }

    const { email, password, name, fullName, phone } = await request.json();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanName = String(name || fullName || "").trim();
    const cleanPhone = String(phone || "").replace(/\D/g, "");

    if (!cleanName || !cleanEmail || !password || !cleanPhone) {
      return NextResponse.json({ message: "Name, email, phone, and password are required" }, { status: 400 });
    }

    if (String(password).length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const { data: existingUser, error: existingError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ message: existingError.message }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const { data: existingPhone, error: phoneError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (phoneError) {
      return NextResponse.json({ message: phoneError.message }, { status: 500 });
    }

    if (existingPhone) {
      return NextResponse.json({ message: "Mobile number already registered" }, { status: 409 });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: createPasswordHash(String(password)),
      })
      .select("id, name, email, phone, created_at")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Registration successful",
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
