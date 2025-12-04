import { connectDB } from "@/lib/db.js";
import OTP from "@/models/OTP.js";
import User from "@/models/User";
import { generateToken } from "@/utils/helper/jwtHelper";
import { resSend } from "@/utils/helper/resHelper.js";



//* POST /api/otp/verify —> body: { phoneOrEmail, code } → verify, then create/find user, return JWT or login session
export async function POST(req) {
  try {
    const { phoneOrEmail, code } = await req.json();
    await connectDB();
    const otp = await OTP.findOne({ phoneOrEmail, code, used: false });
    if (!otp || otp.expiresAt < new Date())
      return new Response(JSON.stringify({ success:false, message: "Invalid or expired" }), {
        status: 400,
      });

    otp.used = true;
    await otp.save();

    let user =
      (await User.findOne({ email: phoneOrEmail })) ||
      (await User.findOne({ phone: phoneOrEmail }));

    if (!user) {
      user = await User.create({ email: phoneOrEmail, role: "customer" }); // or phone
    }

    const token = await generateToken({ id: user._id, role: user.role });
    console.log(`✔️ ---- OTP Verified for ${phoneOrEmail}`);

    return resSend({ ok: true, success: true, message: "Verification Success!"}, 200);

  } catch (error) {
    console.error("⚠️ Error in /api/otp/verify :", error);
    return resSend({ success: false, message: "Internal Server Error", error }, 500);
  }
}
