import { NextResponse } from "next/server";
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

    const { email, password } = await request.json();
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email, password, created_at")
      .eq("email", cleanEmail)
      .single();

    if (error || !user || !verifyPassword(String(password), user.password)) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
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
        created_at: user.created_at,
      },
    });
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
