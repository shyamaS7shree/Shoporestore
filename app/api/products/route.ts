import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET all products
export async function GET() {
  const { data, error } = await supabase
    .from("products")
    .select("*");

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

// POST add product
export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase
    .from("products")
    .insert([body])
    .select();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE product
export async function DELETE(request: Request) {
  const { id } = await request.json();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ message: "Deleted" });
}