import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resSend } from "@/utils/helper/resHelper";
import { clearCookie, getRefreshToken, setCookie } from "@/utils/helper/cookieHelper";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "@/utils/helper/jwtHelper";

export async function POST(req) {
  try {
    // const cookieHeader = req.headers.get("cookie") ?? "";
    // const cookies = Object.fromEntries(cookieHeader.split(";").filter(Boolean).map(s => {
    //   const [k, v] = s.split("=").map(x => x.trim());
    //   return [k, v];
    // }));

    // const incomingRefresh = cookies["refresh_token"];
    
    const incomingRefresh = await getRefreshToken();
    
    if (!incomingRefresh) {
      // clear any access cookie
      const res = resSend({success:false, error: "No refresh token"}, 401);
      clearCookie(res, "access_token");
      return res;
    }

    // verify token signature
    let payload;
    try {
      payload =  verifyRefreshToken(incomingRefresh);
    } catch (e) {
      // invalid token - clear cookies
      const res = resSend({success:false, error: "Invalid refresh token" }, 401);
      clearCookie(res, "access_token")
      clearCookie(res, "refresh_token")
      return res;
    }

    // check session in DB
    const session = await prisma.session.findUnique({ where: { refreshToken: incomingRefresh } });
    if (!session || session.expiresAt < new Date()) {
        const res = resSend({success:false, error: "Refresh token not found or expired" }, 401);
        clearCookie(res, "access_token")
        clearCookie(res, "refresh_token")
        return res;
    }

    // New Refresh Token: rotate refresh token: create new refresh token and delete old session
    const newRefresh = generateRefreshToken({ id: session.userId });
    const expiresIn = Number(process.env.REFRESH_TOKEN_EXPIRES_IN ?? 60 * 60 * 24 * 7);
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // delete old session and create new one (atomic)
    await prisma.$transaction([
      prisma.session.delete({ where: { id: session.id } }),
      prisma.session.create({
        data: {
          userId: session.userId,
          refreshToken: newRefresh,
          expiresAt,
          userAgent: req.headers.get("user-agent") ?? undefined,
          ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined
        }
      })
    ]);

    const accessToken = generateAccessToken({ id: session.userId });

    const res = resSend({success:true, ok: true, message:"Refresh token rotate success"}, 200);
    setCookie(res,{name:"access_token", value: accessToken, maxAgeSec: Number(process.env.ACCESS_TOKEN_EXPIRES_IN ?? 900)});
    setCookie(res,{name:"refresh_token", value: newRefresh, maxAgeSec: expiresIn});
    console.log(`✔️ Refresh token reload success! `)
    return res;

  } catch (err) {
    console.error("❌ REFRESH ERROR:", err);
    return resSend({success:false, error: "Server error" }, 500 );
  }
}
