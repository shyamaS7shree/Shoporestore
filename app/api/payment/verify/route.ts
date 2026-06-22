import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { sendShoporeMail } from "@/lib/mailer";

function isUuid(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function buildOrderItems(orderId: string, items: any[], withDisplayDetails: boolean) {
  return items.map((item: any) => ({
    order_id: orderId,
    product_id: isUuid(item.product_id) ? item.product_id : null,
    quantity: Number(item.quantity) || 1,
    price: Number(item.price) || 0,
    ...(withDisplayDetails
      ? {
          product_name: item.name || "Product",
          product_brand: item.brand || "",
          product_image: item.image || "",
          product_size: item.size || "",
          product_color: item.color || "",
        }
      : {}),
  }));
}

async function insertOrderItems(orderId: string, items: any[]) {
  const detailedItems = buildOrderItems(orderId, items, true);
  const { error } = await supabaseAdmin!.from("order_items").insert(detailedItems);

  if (!error) return null;

  const fallbackItems = buildOrderItems(orderId, items, false);
  const { error: fallbackError } = await supabaseAdmin!.from("order_items").insert(fallbackItems);
  return fallbackError;
}

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id,
      user_email,
      user_name,
      amount,
      items,
      address_id,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Payment details are missing" }, { status: 400 });
    }

    if (!user_id || !Array.isArray(items) || items.length === 0 || !Number.isFinite(Number(amount))) {
      return NextResponse.json({ error: "Order details are missing" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const baseOrderPayload = {
      user_id,
      total: Number(amount),
      status: "paid",
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        ...baseOrderPayload,
        ...(address_id ? { address_id } : {}),
        payment_id: razorpay_payment_id,
      })
      .select()
      .single();

    if (orderError) {
      const { data: fallbackOrder, error: fallbackError } = await supabaseAdmin
        .from("orders")
        .insert(baseOrderPayload)
        .select()
        .single();

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 });
      }

      const fallbackItemsError = await insertOrderItems(fallbackOrder.id, items);
      if (fallbackItemsError) {
        return NextResponse.json({ error: fallbackItemsError.message }, { status: 500 });
      }

      await supabaseAdmin.from("cart").delete().eq("user_id", user_id);
      const emailError = await sendOrderEmail(user_email, user_name, Number(amount), fallbackOrder.id, razorpay_payment_id, items);

      return NextResponse.json({
        message: "Order placed successfully",
        order: fallbackOrder,
        ...(emailError ? { emailWarning: emailError } : {}),
      });
    }

    const itemsError = await insertOrderItems(order.id, items);
    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    await supabaseAdmin.from("cart").delete().eq("user_id", user_id);
    const emailError = await sendOrderEmail(user_email, user_name, Number(amount), order.id, razorpay_payment_id, items);

    return NextResponse.json({
      message: "Order placed successfully",
      order,
      ...(emailError ? { emailWarning: emailError } : {}),
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

async function sendOrderEmail(
  userEmail: string,
  userName: string,
  amount: number,
  orderId: string,
  paymentId: string,
  items: any[]
) {
  return sendShoporeMail({
    to: userEmail,
    subject: "Your Shopore order is confirmed",
    title: "Order Confirmed",
    userName,
    intro: "Your order has been placed successfully.",
    orderId,
    paymentId,
    amount,
    items,
  });
}
