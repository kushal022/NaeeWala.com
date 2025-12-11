import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerUserSchema } from "@/lib/validation/registerUserSchema";
import { resSend } from "@/utils/helper/resHelper";
import { generateAccessToken, generateRefreshToken } from "@/utils/helper/jwtHelper";

export async function POST(req) {
  try {
    const body = await req.json();

    const {success, data, error} = registerUserSchema.safeParse(body);
    if (!success) {
      return resSend({success:false, error: error.errors[0].message }, 400);
    }

    const { name, email, phone, password } = data;

    const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] }
      });
  
      if (existing) {
        return resSend({success:false, error: "User already exists" }, 409);
      }

    // check otp verified
    const emailOtp = await prisma.otp.findFirst({
      where: { to: email, used: true },
      orderBy: { createdAt: "desc" }
    });

    if (!emailOtp) {
      return resSend({success:false, error: "Email not verified via OTP" }, 400);
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hash,
        role: "customer",
        isEmailVerified: true
      }
    });

    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });
    const accessToken = generateAccessToken({ id: user.id, role: user.role });

    console.log(`✔️ ---- Registration successful for ${user.name}`);

    return resSend({
      message: "User registered",
      token,
      user
    },200);

  } catch (e) {
    console.log("-- User registration fail : ", e);
    return resSend({success: false, error: "Server error" },500);
  }
}
