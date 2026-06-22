import { NextResponse } from "next/server";
import { sendShoporeMail } from "@/lib/mailer";

export async function POST(request: Request) {
  const { email } = await request.json();

  const error = await sendShoporeMail({
    to: email,
    subject: "Shopore test email",
    title: "Shopore Email Test",
    userName: "Shopore customer",
    intro: "Brevo SMTP is connected successfully. Order updates will be sent to customer emails.",
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ message: "Test email sent" });
}
