import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const contactEmail = process.env.CONTACT_TO_EMAIL || 'shyamashreedas5@gmail.com';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: Request) {
  try {
    if (!resend) {
      return NextResponse.json({ message: 'Missing RESEND_API_KEY in .env.local' }, { status: 500 });
    }

    const body = await request.json();
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const orderNo = String(body.orderNo || '').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();

    if (!firstName || !lastName || !email || !phone || !subject || !message) {
      return NextResponse.json({ message: 'Please fill all required fields' }, { status: 400 });
    }

    const fullName = `${firstName} ${lastName}`.trim();

    const { data, error } = await resend.emails.send({
      from: 'Shopore Contact <onboarding@resend.dev>',
      to: contactEmail,
      replyTo: email,
      subject: `Shopore Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #071225; padding: 20px;">
          <h2 style="margin: 0 0 16px;">New Contact Us Message</h2>
          <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Order No:</strong> ${escapeHtml(orderNo || 'Not provided')}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 18px 0;" />
          <p style="white-space: pre-line; line-height: 1.6;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    if (error) {
      console.error('[contact POST] Resend error:', error);
      return NextResponse.json(
        { message: error.message || 'Email provider rejected the message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Message sent successfully', id: data?.id });
  } catch (error) {
    console.error('[contact POST] Failed:', error);
    return NextResponse.json({ message: 'Failed to send message' }, { status: 500 });
  }
}
