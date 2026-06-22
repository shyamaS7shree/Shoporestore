import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase';
import { sendShoporeMail } from '@/lib/mailer';

export const runtime = 'nodejs';

type KnowledgeChunk = {
  file: string;
  text: string;
};

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const KNOWLEDGE_DIR = path.join(process.cwd(), 'data', 'knowledge');
const MAX_CONTEXT_CHUNKS = 5;
const TERM_ALIASES: Record<string, string[]> = {
  order: ['oder', 'orded', 'ordred', 'ordered'],
  orders: ['oders', 'ordeds'],
  status: ['sttsu', 'sttsus', 'statsu', 'sstts'],
  cancel: ['cancle', 'cncel', 'cancellation', 'cancelled'],
  refund: ['refnd', 'refunds', 'moneyback'],
  money: ['mony', 'amount', 'cash'],
  when: ['whn'],
  processing: ['procesing', 'proccessing', 'process'],
  return: ['retrun', 'retun', 'exchange'],
  delivery: ['delivey', 'delvey', 'delivry'],
  cod: ['cash', 'cashondelivery'],
  upi: ['online', 'prepaid'],
  paid: ['piad', 'payed'],
  details: ['detils', 'detail'],
  all: ['every'],
  size: ['sixw', 'siz', 'fit'],
  tight: ['tite'],
  loose: ['loss', 'lose'],
  support: ['contact', 'help'],
};

type OrderRecord = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  payment_id?: string;
  order_items?: Array<{
    quantity?: number;
    price?: number;
    product_name?: string;
    product_size?: string;
    product_color?: string;
  }>;
};

type ChatUserLookup = {
  userId?: string;
  email?: string;
  phone?: string;
};

const normalize = (value: string) => {
  const terms = value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);

  return terms.flatMap(term => [
    term,
    ...Object.entries(TERM_ALIASES)
      .filter(([, aliases]) => aliases.includes(term))
      .map(([canonical]) => canonical),
  ]);
};

const readKnowledgeBase = async (): Promise<KnowledgeChunk[]> => {
  const files = await fs.readdir(KNOWLEDGE_DIR);
  const markdownFiles = files.filter(file => file.endsWith('.md'));
  const chunks = await Promise.all(
    markdownFiles.map(async file => {
      const content = await fs.readFile(path.join(KNOWLEDGE_DIR, file), 'utf8');

      return content
        .split(/\n{2,}/)
        .map(text => text.trim())
        .filter(Boolean)
        .map(text => ({ file, text }));
    })
  );

  return chunks.flat();
};

const findRelevantContext = (message: string, chunks: KnowledgeChunk[]) => {
  const queryTerms = new Set(normalize(message));

  return chunks
    .map(chunk => {
      const chunkTerms = normalize(chunk.text);
      const score = chunkTerms.reduce((total, term) => total + (queryTerms.has(term) ? 1 : 0), 0);

      return { ...chunk, score };
    })
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CONTEXT_CHUNKS)
    .map(chunk => `Source: ${chunk.file}\n${chunk.text}`)
    .join('\n\n');
};

const hasAny = (terms: string[], values: string[]) => values.some(value => terms.includes(value));

function parseOrderDate(value?: string) {
  if (!value) return new Date();
  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

function formatPrice(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}.00`;
}

function formatDateTime(value?: string) {
  if (!value) return 'recently';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(parseOrderDate(value));
}

function getOrderStatusLabel(status?: string) {
  if (status === 'cod') return 'Cash on Delivery';
  if (status === 'pay_later') return 'Pay Later';
  if (status === 'refund_processing') return 'Refund Processing';
  if (status === 'refunded') return 'Refunded';
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'delivered') return 'Delivered';
  if (status === 'paid') return 'Paid';
  return status || 'Placed';
}

function describeRemaining(targetTime: number) {
  const remainingMs = targetTime - Date.now();
  if (remainingMs <= 0) return 'any time now';

  const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
  if (remainingHours <= 24) return `${remainingHours} hour${remainingHours === 1 ? '' : 's'} more`;

  const remainingDays = Math.ceil(remainingHours / 24);
  return `${remainingDays} day${remainingDays === 1 ? '' : 's'} more`;
}

function shortOrderId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function extractOrderHint(message: string) {
  const uuid = message.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}/i)?.[0];
  if (uuid) return uuid.toLowerCase();

  const shortId = message.match(/\b[0-9a-f]{8}\b/i)?.[0];
  return shortId?.toLowerCase() || '';
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(value);
}

async function refreshOrderStatus(order: OrderRecord) {
  if (!supabaseAdmin) return order;

  const ageMs = Date.now() - parseOrderDate(order.created_at).getTime();
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
  let nextStatus = order.status;

  if (ageDays >= 2 && ['paid', 'cod', 'pay_later'].includes(order.status)) {
    nextStatus = 'delivered';
  }

  if (ageDays >= 2 && order.status === 'refund_processing') {
    nextStatus = 'refunded';
  }

  if (nextStatus === order.status) return order;

  const { data } = await supabaseAdmin
    .from('orders')
    .update({ status: nextStatus })
    .eq('id', order.id)
    .select('*, order_items(*)')
    .single();

  const updatedOrder = (data as OrderRecord | null) || { ...order, status: nextStatus };

  if (order.status === 'refund_processing' && nextStatus === 'refunded') {
    const emailWarning = await sendChatRefundSuccessEmail(updatedOrder);
    if (emailWarning) {
      console.warn(`[chat] Refund success email warning for ${order.id}:`, emailWarning);
    }
  }

  return updatedOrder;
}

async function sendChatRefundSuccessEmail(order: OrderRecord) {
  if (!supabaseAdmin) return null;

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('name, email')
    .eq('id', (order as any).user_id)
    .maybeSingle();

  if (!user?.email) return 'Customer email is missing';

  const items = (order.order_items || []).map((item) => ({
    name: [
      item.product_name || 'Product',
      item.product_size ? `Size ${item.product_size}` : '',
      item.product_color || '',
    ].filter(Boolean).join(' - '),
    quantity: item.quantity,
    price: item.price,
  }));

  return sendShoporeMail({
    to: user.email,
    subject: 'Shopore refund successful',
    title: 'Shopore refund successful',
    userName: user.name,
    intro: 'Your refund has been processed successfully. The refunded amount should reflect according to your bank or payment provider timeline.',
    orderId: order.id,
    amount: Number(order.total),
    items,
  });
}

async function resolveChatUser({ userId, email, phone }: ChatUserLookup) {
  if (!supabaseAdmin) return '';
  if (userId && isUuid(userId)) return userId;

  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').replace(/\D/g, '');

  if (!cleanEmail && cleanPhone.length !== 10) return '';

  let query = supabaseAdmin.from('users').select('id').limit(1);

  if (cleanEmail) {
    query = query.eq('email', cleanEmail);
  } else {
    query = query.eq('phone', cleanPhone);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error('[chat user lookup] Supabase error:', error);
    return '';
  }

  return typeof data?.id === 'string' ? data.id : '';
}

function buildOrderAnswer(order: OrderRecord) {
  const createdTime = parseOrderDate(order.created_at).getTime();
  const statusLabel = getOrderStatusLabel(order.status);
  const items = order.order_items || [];
  const firstItem = items[0];
  const itemText = firstItem?.product_name
    ? `${firstItem.product_name}${firstItem.product_size ? `, size ${firstItem.product_size}` : ''}${items.length > 1 ? ` + ${items.length - 1} more item${items.length - 1 === 1 ? '' : 's'}` : ''}`
    : items.length > 0
      ? `${items.length} item${items.length === 1 ? '' : 's'}`
      : 'item details not available';

  let nextText = '';

  if (order.status === 'refund_processing') {
    nextText = `Refund request is received and processing. Expected completion is within ${describeRemaining(createdTime + 48 * 60 * 60 * 1000)}.`;
  } else if (order.status === 'refunded') {
    nextText = 'Refund is marked successful and the order is closed.';
  } else if (order.status === 'cancelled') {
    nextText = 'This order is cancelled. No shipment will happen. If this was a paid order and refund is not showing, contact support with this order ID.';
  } else if (order.status === 'delivered') {
    nextText = 'This order is delivered. If you clicked return/refund for size or fit, the return request is handled from My Orders. Refund starts after return pickup/check if eligible.';
  } else {
    nextText = `Current delivery progress is active. Expected delivery/update is within ${describeRemaining(createdTime + 48 * 60 * 60 * 1000)}. Refund is not active yet unless the order is cancelled/returned.`;
  }

  return `Order #${shortOrderId(order.id)} is ${statusLabel}. Placed on ${formatDateTime(order.created_at)}. Amount: ${formatPrice(order.total)}. Product: ${itemText}. ${nextText}`;
}

function getOrderItemText(order: OrderRecord) {
  const items = order.order_items || [];
  if (items.length === 0) return 'item details not available';

  return items
    .slice(0, 2)
    .map((item) => {
      const details = [
        item.product_name || 'Product',
        item.product_size ? `size ${item.product_size}` : '',
        item.product_color ? item.product_color : '',
        item.quantity ? `qty ${item.quantity}` : '',
      ].filter(Boolean);

      return details.join(', ');
    })
    .join('; ');
}

function buildOrderLine(order: OrderRecord) {
  return `#${shortOrderId(order.id)} - ${getOrderStatusLabel(order.status)} - ${formatPrice(order.total)} - ${getOrderItemText(order)}`;
}

function isPaidOrder(order: OrderRecord) {
  return ['paid', 'refund_processing', 'refunded'].includes(order.status) || Boolean(order.payment_id);
}

function isMoneyQuestion(terms: string[]) {
  return hasAny(terms, ['money', 'refund']) && hasAny(terms, ['when', 'get', 'receive', 'back']);
}

function buildMoneyAnswer(orders: OrderRecord[], orderHint?: string) {
  const candidates = orderHint
    ? orders.filter((order) => order.id.toLowerCase() === orderHint || order.id.toLowerCase().startsWith(orderHint))
    : orders.filter((order) => ['cancelled', 'refund_processing', 'refunded'].includes(order.status));

  if (candidates.length === 0) {
    return 'I do not see any cancelled or refund-processing order in your account right now. If you paid online and money was deducted, contact support with your order ID and payment reference.';
  }

  const paidOrders = candidates.filter(isPaidOrder);
  const codOrders = candidates.filter((order) => !isPaidOrder(order));
  const lines: string[] = [];

  if (paidOrders.length > 0) {
    lines.push(
      ...paidOrders.slice(0, 4).map((order) => {
        if (order.status === 'refunded') {
          return `#${shortOrderId(order.id)} (${getOrderItemText(order)}): refund is already successful.`;
        }

        return `#${shortOrderId(order.id)} (${getOrderItemText(order)}): paid/UPI refund should come within 24 hours.`;
      })
    );
  }

  if (codOrders.length > 0) {
    lines.push(
      ...codOrders.slice(0, 4).map((order) =>
        `#${shortOrderId(order.id)} (${getOrderItemText(order)}): this was Cash on Delivery/cancelled, so no online refund is needed. Your money is still with you.`
      )
    );
  }

  return lines.join('\n');
}

function canCancelOrder(order: OrderRecord) {
  const ageMs = Date.now() - parseOrderDate(order.created_at).getTime();

  return !['cancelled', 'refund_processing', 'refunded', 'delivered'].includes(order.status) && ageMs < 24 * 60 * 60 * 1000;
}

function buildCancelEligibilityAnswer(order: OrderRecord, isLatest: boolean) {
  const subject = isLatest ? `your latest order #${shortOrderId(order.id)}` : `order #${shortOrderId(order.id)}`;
  const status = getOrderStatusLabel(order.status);

  if (canCancelOrder(order)) {
    const refundText = order.status === 'paid'
      ? 'Since it is paid, refund processing will start after cancellation.'
      : 'No OTP is required to cancel. For Cash on Delivery, no refund is needed because no online payment was collected.';

    return `Yes, you can cancel ${subject}. Current status is ${status}. Product: ${getOrderItemText(order)}. Open Profile > My Orders, open this order, and click Cancel. ${refundText}`;
  }

  if (order.status === 'cancelled') {
    return `No, ${subject} is already cancelled. Product: ${getOrderItemText(order)}.`;
  }

  if (order.status === 'refund_processing') {
    return `No, ${subject} is already cancelled and refund processing is active. Expected refund completion is within ${describeRemaining(parseOrderDate(order.created_at).getTime() + 48 * 60 * 60 * 1000)}.`;
  }

  if (order.status === 'refunded') {
    return `No, ${subject} is already refunded and closed.`;
  }

  if (order.status === 'delivered') {
    return `No, ${subject} is already delivered. If the product has a size or quality issue, use Return from My Orders if eligible.`;
  }

  const ageMs = Date.now() - parseOrderDate(order.created_at).getTime();
  if (ageMs >= 24 * 60 * 60 * 1000) {
    return `No, ${subject} has already shipped, so it cannot be cancelled now. Product: ${getOrderItemText(order)}. After delivery, you can request a return from My Orders if the item is eligible. Refund applies only to paid/prepaid orders; COD orders do not need an online refund before delivery.`;
  }

  return `No, ${subject} cannot be cancelled from its current status: ${status}. Please contact support if you still need help.`;
}

function isCancelEligibilityQuestion(terms: string[]) {
  return hasAny(terms, ['cancel']) && hasAny(terms, ['can', 'possible', 'allow', 'eligible', 'latest']);
}

function getRequestedStatuses(terms: string[]) {
  const statuses: string[] = [];

  if (hasAny(terms, ['refund']) && hasAny(terms, ['processing'])) {
    statuses.push('refund_processing');
  } else if (hasAny(terms, ['refund'])) {
    statuses.push('refund_processing', 'refunded');
  }
  if (hasAny(terms, ['processing'])) statuses.push('refund_processing');
  if (hasAny(terms, ['cancel'])) statuses.push('cancelled');
  if (hasAny(terms, ['paid'])) statuses.push('paid');
  if (hasAny(terms, ['cod'])) statuses.push('cod');
  if (hasAny(terms, ['delivered', 'delivery'])) statuses.push('delivered');

  return Array.from(new Set(statuses));
}

function isOrderLookupQuestion(terms: string[], hasOrderHint: boolean) {
  if (hasOrderHint) return true;
  if (!hasAny(terms, ['order', 'orders'])) return false;

  return hasAny(terms, [
    'status',
    'track',
    'tracking',
    'refund',
    'money',
    'when',
    'processing',
    'cancel',
    'paid',
    'cod',
    'delivered',
    'delivery',
    'details',
    'all',
  ]);
}

function buildOrderListAnswer(orders: OrderRecord[], terms: string[]) {
  const requestedStatuses = getRequestedStatuses(terms);
  const filteredOrders = requestedStatuses.length
    ? orders.filter((order) => requestedStatuses.includes(order.status))
    : orders;

  if (filteredOrders.length === 0) {
    const statusText = requestedStatuses.map(getOrderStatusLabel).join(', ');
    return statusText
      ? `I did not find any ${statusText} orders in your account right now.`
      : 'I did not find any orders in your account right now.';
  }

  const heading = requestedStatuses.length
    ? `I found ${filteredOrders.length} matching order${filteredOrders.length === 1 ? '' : 's'}:`
    : `Here are your latest ${filteredOrders.length} order${filteredOrders.length === 1 ? '' : 's'}:`;

  const lines = filteredOrders.slice(0, 6).map(buildOrderLine);
  const extra = filteredOrders.length > 6 ? `\n+ ${filteredOrders.length - 6} more orders. Open Profile > My Orders for the full list.` : '';

  return `${heading}\n${lines.join('\n')}${extra}`;
}

async function getOrderAnswer(message: string, userLookup: ChatUserLookup) {
  const orderHint = extractOrderHint(message);
  const terms = normalize(message);

  if (!isOrderLookupQuestion(terms, Boolean(orderHint))) return '';

  const userId = await resolveChatUser(userLookup);

  if (!userId) {
    return orderHint
      ? 'I can see you are trying to check an order, but I could not verify your account for private order lookup. Please open Profile > My Orders, or contact support with this order ID.'
      : 'I could not verify your account for private order lookup. Please open Profile > My Orders, or contact support.';
  }

  if (!supabaseAdmin) {
    return 'Order lookup is not configured right now. Please contact support with your order number.';
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[chat order lookup] Supabase error:', error);
    return 'I could not check this order right now. Please try again or contact support with your order number.';
  }

  const orders = await Promise.all(((data || []) as OrderRecord[]).map(refreshOrderStatus));
  const order = orderHint
    ? orders.find(item => item.id.toLowerCase() === orderHint || item.id.toLowerCase().startsWith(orderHint))
    : orders[0];

  if (!order) {
    return orderHint
      ? 'I could not find that order in your account. Please check the order ID in Profile > My Orders, or contact support with your order number, registered phone number, and email.'
      : 'I could not find any orders in your account yet. If you placed an order, please check Profile > My Orders or contact support.';
  }

  if (isCancelEligibilityQuestion(terms)) {
    return buildCancelEligibilityAnswer(order, !orderHint);
  }

  if (isMoneyQuestion(terms)) {
    return buildMoneyAnswer(orders, orderHint);
  }

  if (!orderHint && (hasAny(terms, ['all', 'details', 'refund', 'processing', 'cancel', 'paid', 'cod', 'delivered', 'delivery']))) {
    return buildOrderListAnswer(orders, terms);
  }

  const prefix = orderHint ? '' : 'Latest order: ';
  return `${prefix}${buildOrderAnswer(order)}`;
}

const getDirectAnswer = (message: string) => {
  const terms = normalize(message);

  if (hasAny(terms, ['status', 'track', 'tracking']) && hasAny(terms, ['order', 'orders'])) {
    return 'You can track your order from Profile > My Orders after login. I cannot see private live order status here, so for exact status please open My Orders or contact support with your order number.';
  }

  if (hasAny(terms, ['cancel']) && hasAny(terms, ['order', 'orders'])) {
    return 'You can cancel an order from Profile > My Orders before it is shipped. Open the order, choose Cancel, select a reason if asked, and confirm. No OTP is required for cancellation. Paid orders start refund processing after cancellation.';
  }

  if (hasAny(terms, ['cod'])) {
    return 'For Cash on Delivery orders, no online refund is needed before delivery because no online payment was collected. If you paid cash after delivery and later return an eligible item, contact support through the Contact page for refund help.';
  }

  if (hasAny(terms, ['refund'])) {
    return 'For paid/UPI orders, refund should come within 24 hours after cancellation/refund processing starts. For Cash on Delivery orders, no online refund is needed because no online money was collected. If paid money is still not back after 24 hours, contact support with order ID and payment reference.';
  }

  if (hasAny(terms, ['return', 'size', 'tight', 'loose', 'fit'])) {
    return 'If the size does not fit, feels tight or loose, or you received the wrong size, request a return from Profile > My Orders if the item is eligible. Keep it unused, unworn, undamaged, and with original tags and packaging. If exchange is not shown, contact support with your order number and size needed.';
  }

  return '';
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const userId = typeof body.user_id === 'string' ? body.user_id.trim() : '';
    const userEmail = typeof body.user_email === 'string' ? body.user_email.trim() : '';
    const userPhone = typeof body.user_phone === 'string' ? body.user_phone.trim() : '';

    if (!message) {
      return NextResponse.json({ error: 'Please enter a question.' }, { status: 400 });
    }

    const orderAnswer = await getOrderAnswer(message, {
      userId,
      email: userEmail,
      phone: userPhone,
    });
    if (orderAnswer) {
      return NextResponse.json({ answer: orderAnswer });
    }

    const directAnswer = getDirectAnswer(message);
    if (directAnswer) {
      return NextResponse.json({ answer: directAnswer });
    }

    const groqApiKey = process.env.GROQ_API_KEY?.trim();

    if (!groqApiKey || groqApiKey === 'your_groq_api_key_here') {
      return NextResponse.json(
        { error: 'Chatbot is not configured. Add your real GROQ_API_KEY in .env.local.' },
        { status: 500 }
      );
    }

    const knowledgeChunks = await readKnowledgeBase();
    const context = findRelevantContext(message, knowledgeChunks) || 'No matching policy text was found.';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content:
              'You are Shopore Shopping Assistant. Answer only using the provided Shopore context. Be short, clear, and helpful. For live order status, explain that customers must check Profile > My Orders or contact support with their order number. Never invent policies, prices, stock, refund confirmation, or private order status.',
          },
          {
            role: 'user',
            content: `Shopore context:\n${context}\n\nCustomer question:\n${message}`,
          },
        ],
        max_tokens: 220,
      }),
    });

    if (!response.ok) {
      return handleGroqError(response.status);
    }

    const result = (await response.json()) as GroqChatResponse;
    const answer = result.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Chat API error:', error);
    const apiError = error as { status?: number; code?: string; message?: string };

    if (apiError.status === 401 || apiError.status === 429) {
      return handleGroqError(apiError.status);
    }

    return NextResponse.json(
      { error: 'Sorry, the chatbot could not answer right now. Please try again.' },
      { status: 500 }
    );
  }
}

function handleGroqError(status: number) {
  if (status === 401) {
    return NextResponse.json(
      { error: 'Groq API key is invalid. Please add a valid key in .env.local and restart the dev server.' },
      { status: 401 }
    );
  }

  if (status === 429) {
    return NextResponse.json(
      { error: 'Groq is rate limiting this chatbot. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

  return NextResponse.json(
    { error: 'Sorry, the chatbot could not answer right now. Please try again.' },
    { status }
  );
}
