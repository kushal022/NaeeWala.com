import { connectDB } from "@/lib/db.js";
import OTP from "@/lib/models/OTP.js";
import crypto from "crypto";
import { otpText } from "@/utils/emailText/emailText";
import { sendEmail } from "@/utils/helper/sendEmailHelper";

//^ POST /api/otp- send —> body: { phoneOrEmail } → generate 6-digit code, save in OTP model, send via SMTP or Twilio
export async function POST(req) {
  try {
    const { phoneOrEmail } = await req.json();
    await connectDB();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await OTP.create({ phoneOrEmail, code, expiresAt });

    const mailData = otpText(code);
    await sendEmail(phoneOrEmail, mailData.subject, mailData.text);
    console.log(`✔️ ---- Sent OTP ${code} to ${phoneOrEmail}`);
    return new Response(
      JSON.stringify({ ok: true, success: true, message: "Your OTP sent" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("⚠️ Error in /api/otp-send:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
