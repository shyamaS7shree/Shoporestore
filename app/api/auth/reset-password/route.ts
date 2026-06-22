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

    const { phone, email, password, confirmPassword } = await request.json();
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    const cleanEmail = String(email || "").trim().toLowerCase();
    const nextPassword = String(password || "");
    const nextConfirmPassword = String(confirmPassword || "");

    if (cleanPhone.length !== 10 || !cleanEmail || !nextPassword || !nextConfirmPassword) {
      return NextResponse.json({ message: "Mobile number, email, and new password are required" }, { status: 400 });
    }

    if (nextPassword.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    if (nextPassword !== nextConfirmPassword) {
      return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("phone", cleanPhone)
      .eq("email", cleanEmail)
      .maybeSingle();

    if (userError) {
      return NextResponse.json({ message: userError.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ message: "No account found with this mobile number and email" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("users")
      .update({ password: createPasswordHash(nextPassword) })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Password reset successful" });
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
