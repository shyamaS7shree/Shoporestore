import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const body = await request.json();
  const address = {
    user_id: body.user_id,
    full_name: body.full_name,
    phone: body.phone,
    pin_code: body.pin_code,
    address_line: body.address_line,
    city: body.city,
    state: body.state,
    is_default: Boolean(body.is_default),
  };

  if (!address.user_id || !address.full_name || !address.phone || !address.pin_code || !address.address_line || !address.city || !address.state) {
    return NextResponse.json({ error: "All address fields are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("addresses")
    .insert(address)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const { id, user_id } = await request.json();

  if (!id || !user_id) {
    return NextResponse.json({ error: "id and user_id are required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Address deleted" });
}
