import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "@/utils/helper/jwtHelper";
import { setCookie } from "@/utils/helper/cookieHelper";
import { resSend } from "@/utils/helper/resHelper";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("BARBER LOGIN BODY:", body);

    const { email, phone, password } = body;

    if ((!email && !phone) || !password) {
      return resSend({success:false, error: "Email/Phone and password required" },400);
    }

    // ------------------------------
    // 1) FIND USER (email OR phone)
    // ------------------------------
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ],
      },
      include: {
        barber: true,
      },
    });

    if (!user) {
      return resSend({success:false, error: "User not found" }, 404);
    }

    // -------------------------------------
    // 2) CHECK ROLE → must be BARBER
    // -------------------------------------
    if (user.role !== "barber") {
      return resSend(
        {success:false, error: "This login is only for barbers" },
        403
      );
    }

    // -------------------------------------
    // 3) CHECK PASSWORD
    // -------------------------------------
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return resSend({success:false, error: "Invalid password" }, 401);
    }

    // -------------------------------------
    // 4) CHECK BARBER STATUS (optional but recommended)
    // -------------------------------------
    // if (user.barber && user.barber.status === "pending") {
    //   return resSend(
    //     {success:false, error: "Your account is not approved yet" },
    //     403
    //   );
    // }

    // if (user.barber && user.barber.status === "rejected") {
    //   return resSend(
    //     {success:false, error: "Your barber account is rejected" },
    //     403
    //   );
    // }

    // -------------------------------------
    // 5) GENERATE TOKENS
    // -------------------------------------
    const accessToken = generateAccessToken({
      id: user.id,
      role: "barber",
      username: user.username,
    });

    const refreshToken = generateRefreshToken({ id: user.id });

    // -------------------------------------
    // 6) SAVE SESSION (refresh token)
    // -------------------------------------
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
        userAgent: req.headers.get("user-agent") || undefined,
        ip:
          req.headers.get("x-forwarded-for") ??
          req.headers.get("x-real-ip") ??
          undefined,
      },
    });

    // -------------------------------------
    // 7) SUCCESS RESPONSE
    // -------------------------------------
    const res = resSend({
        success:true, 
        message: "You are login successfully!!",
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
    }, 200);
    // set cookies
    setCookie(res,{name:"access_token", value: accessToken, maxAgeSec: Number(process.env.ACCESS_TOKEN_EXPIRES_IN ?? 900)});
    setCookie(res,{name:"refresh_token", value: refreshToken, maxAgeSec: Number(process.env.REFRESH_TOKEN_EXPIRES_IN ?? 7 * 24 * 3600)});
    console.log(`✔️ Barber login success for ${user.email} `)
    return res;
  } catch (err) {
    console.error("BARBER LOGIN ERROR:", err);
    return resSend({success:false, error: "Server error" }, 500);
  }
}
