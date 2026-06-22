import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendShoporeMail } from "@/lib/mailer";

function isUuid(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(value);
}

function isShipped(order: any) {
  const ageMs = Date.now() - new Date(order.created_at || Date.now()).getTime();
  return ageMs >= 24 * 60 * 60 * 1000 || order.status === "delivered";
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
  const { error } = await supabaseAdmin!.from("order_items").insert(buildOrderItems(orderId, items, true));
  if (!error) return null;

  const { error: fallbackError } = await supabaseAdmin!.from("order_items").insert(buildOrderItems(orderId, items, false));
  return fallbackError;
}

async function sendOrderEmail({
  userEmail,
  userName,
  amount,
  orderId,
  items,
  subject,
  intro,
}: {
  userEmail?: string;
  userName?: string;
  amount?: number;
  orderId: string;
  items?: any[];
  subject: string;
  intro: string;
}) {
  return sendShoporeMail({
    to: userEmail,
    subject,
    title: subject,
    userName,
    intro,
    orderId,
    amount,
    items,
  });
}

async function sendRefundSuccessEmail(order: any) {
  const { data: user } = await supabaseAdmin!
    .from("users")
    .select("name, email")
    .eq("id", order.user_id)
    .maybeSingle();

  const email = user?.email || order.user_email;
  if (!email) return "Customer email is missing";

  const items = Array.isArray(order.order_items)
    ? order.order_items.map((item: any) => ({
        name: [
          item.product_name || "Product",
          item.product_size ? `Size ${item.product_size}` : "",
          item.product_color || "",
        ].filter(Boolean).join(" - "),
        quantity: item.quantity,
        price: item.price,
      }))
    : [];

  return sendOrderEmail({
    userEmail: email,
    userName: user?.name || order.user_name,
    amount: Number(order.total),
    orderId: order.id,
    items,
    subject: "Shopore refund successful",
    intro: "Your refund has been processed successfully. The refunded amount should reflect according to your bank or payment provider timeline.",
  });
}

// GET orders
export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders = data || [];
  const addressIds = Array.from(new Set(orders.map((order: any) => order.address_id).filter(Boolean)));

  if (addressIds.length > 0) {
    const { data: addresses } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .in("id", addressIds);

    const addressMap = new Map((addresses || []).map((address: any) => [address.id, address]));
    orders.forEach((order: any) => {
      order.delivery_address = addressMap.get(order.address_id) || null;
    });
  }

  const deliveredOrders = orders.filter((order: any) => {
    const ageMs = Date.now() - new Date(order.created_at || Date.now()).getTime();
    const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
    return ageDays >= 2 && ["paid", "cod", "pay_later"].includes(order.status);
  });

  const refundedOrders = orders.filter((order: any) => {
    const ageMs = Date.now() - new Date(order.created_at || Date.now()).getTime();
    const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
    return ageDays >= 2 && order.status === "refund_processing";
  });

  if (deliveredOrders.length > 0) {
    const deliveredIds = deliveredOrders.map((order: any) => order.id);
    await supabaseAdmin.from("orders").update({ status: "delivered" }).in("id", deliveredIds);

    orders.forEach((order: any) => {
      if (deliveredIds.includes(order.id)) {
        order.status = "delivered";
      }
    });
  }

  if (refundedOrders.length > 0) {
    const refundedIds = refundedOrders.map((order: any) => order.id);
    await supabaseAdmin.from("orders").update({ status: "refunded" }).in("id", refundedIds);

    await Promise.all(
      refundedOrders.map(async (order: any) => {
        const emailWarning = await sendRefundSuccessEmail(order);
        if (emailWarning) {
          console.warn(`[orders GET] Refund success email warning for ${order.id}:`, emailWarning);
        }
      })
    );

    orders.forEach((order: any) => {
      if (refundedIds.includes(order.id)) {
        order.status = "refunded";
      }
    });
  }

  return NextResponse.json(orders);
}

// POST create order
export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const body = await request.json();
  const {
    user_id,
    total,
    items,
    address_id,
    payment_method,
    user_email,
    user_name,
  } = body;

  if (!user_id || !Number.isFinite(Number(total))) {
    return NextResponse.json({ error: "Order details are missing" }, { status: 400 });
  }

  const status = payment_method === "pay_later" ? "pay_later" : payment_method === "cod" ? "cod" : body.status || "placed";

  const basePayload = {
    user_id,
    total: Number(total),
    status,
  };

  const insertPayload = {
    ...basePayload,
    ...(address_id ? { address_id } : {}),
  };

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert(insertPayload)
    .select()
    .single();

  let order = data;

  if (error) {
    const { data: fallbackOrder, error: fallbackError } = await supabaseAdmin
      .from("orders")
      .insert(basePayload)
      .select()
      .single();

    if (fallbackError) return NextResponse.json({ error: fallbackError.message }, { status: 500 });
    order = fallbackOrder;
  }

  if (Array.isArray(items) && items.length > 0) {
    const itemsError = await insertOrderItems(order.id, items);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  await supabaseAdmin.from("cart").delete().eq("user_id", user_id);
  const emailWarning = await sendOrderEmail({
    userEmail: user_email,
    userName: user_name,
    amount: Number(total),
    orderId: order.id,
    items,
    subject: payment_method === "cod" ? "Your Shopore COD order is placed" : "Your Shopore Pay Later order is placed",
    intro:
      payment_method === "cod"
        ? "Your Cash on Delivery order has been placed successfully."
        : "Your Pay Later order has been placed successfully. Payment can be completed later from your account.",
  });

  return NextResponse.json({ message: "Order placed successfully", order, ...(emailWarning ? { emailWarning } : {}) });
}

export async function PATCH(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const { order_id, user_id, user_email, user_name } = await request.json();

  if (!order_id || !user_id) {
    return NextResponse.json({ error: "Order ID and user ID are required" }, { status: 400 });
  }

  const { data: order, error: loadError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .eq("user_id", user_id)
    .single();

  if (loadError || !order) {
    return NextResponse.json({ error: loadError?.message || "Order not found" }, { status: 404 });
  }

  if (["cancelled", "refund_processing", "refunded"].includes(order.status)) {
    return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 });
  }

  if (isShipped(order)) {
    return NextResponse.json(
      { error: "This order has shipped, so it cannot be cancelled. You can request a return after delivery if the item is eligible." },
      { status: 400 }
    );
  }

  const nextStatus = order.status === "paid" ? "refund_processing" : "cancelled";
  const { data: updatedOrder, error } = await supabaseAdmin
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", order_id)
    .eq("user_id", user_id)
    .select("*, order_items(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const emailWarning = await sendOrderEmail({
    userEmail: user_email,
    userName: user_name,
    amount: Number(order.total),
    orderId: order.id,
    subject: nextStatus === "refund_processing" ? "Shopore cancellation received" : "Shopore order cancelled",
    intro:
      nextStatus === "refund_processing"
        ? "Your paid order has been cancelled. Refund processing has started and will be confirmed shortly."
        : "Your order has been cancelled successfully.",
  });

  return NextResponse.json({
    message: nextStatus === "refund_processing" ? "Order cancelled. Refund processing started." : "Order cancelled.",
    order: updatedOrder,
    ...(emailWarning ? { emailWarning } : {}),
  });
}
