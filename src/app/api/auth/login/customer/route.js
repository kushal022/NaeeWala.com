import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { resSend } from "@/utils/helper/resHelper";
import { generateAccessToken, generateRefreshToken } from "@/utils/helper/jwtHelper";
import { setCookie } from "@/utils/helper/cookieHelper";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return resSend({ error: "Email and password required" }, 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return resSend({success: false, error: "Invalid credentials" }, 401);

    const okPass = await bcrypt.compare(password, user.password);
    if (!okPass) return resSend({success:false, error: "Invalid credentials" }, 401);

    // Create tokens
    const accessToken = generateAccessToken({ id: user.id, role: user.role, username: user.username });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Save refresh token in DB (rotation-friendly)
    const expiresIn = Number(process.env.REFRESH_TOKEN_EXPIRES_IN ?? 60 * 60 * 24 * 7);
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Track userAgent / ip
    const userAgent = req.headers.get("user-agent") ?? undefined;
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined;

    // store session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent,
        ip,
        expiresAt,
      },
    });
    if (!session) resSend({success: false, error: "Session is not created!"})

    const res = resSend({ ok: true, user: { id: user.id, email: user.email, username: user.username }, message: "User login successfully!" }, 200 );
    // set cookies
    setCookie(res,{name:"access_token", value: accessToken, maxAgeSec: Number(process.env.ACCESS_TOKEN_EXPIRES_IN ?? 900)});
    setCookie(res,{name:"refresh_token", value: refreshToken, maxAgeSec: expiresIn});
    console.log(`✔️ User login success for ${user.email} `)
    return res;

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    return resSend({success: false, error: "Server error" }, 500 );
  }
}
