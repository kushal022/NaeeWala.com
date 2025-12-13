// src/app/api/auth/logout/route.ts
import prisma from "@/lib/prisma";
import { resSend } from "@/utils/helper/resHelper";
import { clearCookie, getAccessToken, getRefreshToken } from "@/utils/helper/cookieHelper";

// Logout: api:
export async function POST(req) {
  try {
      
    //   const cookieHeader = req.headers.get("cookie") ?? "";
    //   const cookies = Object.fromEntries(cookieHeader.split(";").filter(Boolean).map(s => {
    //     const [k, v] = s.split("=").map(x => x.trim());
    //     return [k, v];
    //   }));
    //   console.log("cookies:", cookies)
    // const incomingRefresh = cookies["refresh_token"];

    // const a = await getAccessToken()
    // const r = await getRefreshToken()
    const incomingRefresh = await getRefreshToken();
    if (incomingRefresh) {
      await prisma.session.deleteMany({ where: { refreshToken: incomingRefresh } });
    }

    const res = resSend({success:true,ok:true, message: "Logout success!"}, 200);
    clearCookie(res, "access_token");
    clearCookie(res, "refresh_token");
    console.log(`✔️ User logout success!`)
    return res;
  } catch (err) {
    console.error("❌LOGOUT ERROR:", err);
    return resSend({success:false, error: "Server error" }, 500 );
  }
}
