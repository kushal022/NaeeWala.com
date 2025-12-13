import prisma from "@/lib/prisma.ts";
import bcrypt from "bcryptjs";
import { registerUserSchema } from "@/lib/validation/registerUserSchema";
import { resSend } from "@/utils/helper/resHelper";
import { generateAccessToken, generateRefreshToken } from "@/utils/helper/jwtHelper";
import { generateUniqueUsername } from "@/utils/helper/usernameHelper";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('body: ', body)
    const {success, data, error} = registerUserSchema.safeParse(body);
    console.log('data: ', data)
    if (!success) {
      return resSend({success:false, error: error.errors[0].message }, 400);
    }

    const { firstName, lastName, email, phone, password } = data;
    const fullName = `${firstName} ${lastName}`;
    const username = await generateUniqueUsername(fullName, email);
    console.log("username: ", username)

    const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] }
      });
  
      if (existing) {
        return resSend({success:false, error: "User already exists" }, 409);
      }

    // // check otp verified
    // const emailOtp = await prisma.otp.findFirst({
    //   where: { to: email, used: true },
    //   orderBy: { createdAt: "desc" }
    // });

    // if (!emailOtp) {
    //   return resSend({success:false, error: "Email not verified via OTP" }, 400);
    // }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        phone,
        password: hash,
        role: "customer",
        isEmailVerified: true
      }
    });

    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });
    const accessToken = generateAccessToken({ id: user.id, role: user.role });

    console.log(`✔️ ---- Registration successful for ${user.email}`);

    return resSend({
      message: "User registered successfully",
      user
    },200);

  } catch (e) {
    console.log("❌-- User registration fail : ", e);
    return resSend({success: false, error: "Server error" },500);
  }
}
