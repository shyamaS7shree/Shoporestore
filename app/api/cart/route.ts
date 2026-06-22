import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET cart items
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");

  const { data, error } = await supabase
    .from("cart")
    .select("*, products(*)")
    .eq("user_id", user_id);

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

// POST add to cart
export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase
    .from("cart")
    .insert([body])
    .select();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE remove from cart
export async function DELETE(request: Request) {
  const { id } = await request.json();
  const { error } = await supabase
    .from("cart")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ message: "Removed from cart" });
}