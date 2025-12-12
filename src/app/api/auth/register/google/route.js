import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import prisma from "@/lib/prisma";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req) {
  try {
    const { idToken } = await req.json();

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error("Invalid Google token");

    const { email, name, picture, sub: googleId } = payload;

    if (!email)
      return NextResponse.json({ success: false, message: "Email not found from Google" }, { status: 400 });

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // new user signup
      user = await prisma.user.create({
        data: {
          name: name || "User",
          email,
          password: "", // No password for OAuth users
          avatar: picture,
          isEmailVerified: true,
        },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    return NextResponse.json({ success: false, message: "Google auth failed" }, { status: 500 });
  }
}
