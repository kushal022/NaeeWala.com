import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { resSend } from "@/utils/helper/resHelper";
import { generateUniqueUsername } from "@/utils/helper/usernameHelper";
import { generateAccessToken, generateRefreshToken } from "@/utils/helper/jwtHelper";
import { setCookie } from "@/utils/helper/cookieHelper";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("BARBER REGISTER BODY:", body);

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      otp,
      address, // address obj
      shop, // obj
      bank  // obj
    } = body;

    // ---------------------------
    // 1) VALIDATE OTP
    // ---------------------------
    const otpRecord = await prisma.otp.findFirst({
      where: {
        to: email,
        code: otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    // if (!otpRecord) {
    //   return resSend({success:false, error: "Invalid or expired OTP" }, 400);
    // }

    // Mark OTP used
    // await prisma.otp.update({
    //   where: { id: otpRecord.id },
    //   data: { used: true },
    // });

    // ---------------------------
    // 2) CHECK USER EXISTS
    // ---------------------------
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (exists) {
      return resSend({success:false, error: "User already exists" }, 409);
    }

    // 3) HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ---------------------------
    // 4) GENERATE UNIQUE USERNAME
    // ---------------------------
    const fullName = `${firstName} ${lastName}`
    const username = await generateUniqueUsername(fullName, email);

    // ---------------------------
    // 5) CREATE USER + ADDRESS + BARBER
    // ---------------------------
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        phone,
        password: hashedPassword,
        role: "barber",
        isEmailVerified: true,
        isPhoneVerified: true,
        address: {
          create: {
            street: address.street,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            country: address.country ?? "India",
            pincode: address.pincode,
            lat: address.lat,
            lng: address.lng,
          },
        },
        barber: {
          create: {
            status: "pending", // admin approval later
          },
        },
      },
      include: {
        barber: true,
        address: true,
      },
    });

    const barberId = newUser.barber?.id;

    // ---------------------------
    // 6) CREATE SHOP DETAILS (optional)
    // ---------------------------
    if (shop) {
      await prisma.barberShop.create({
        data: {
          barberId: barberId,
          shopName: shop.shopName,
          description: shop.description,
          shopType: shop.shopType,
        },
      });
    }

    // ---------------------------
    // 7) CREATE BANK DETAILS (optional)
    // ---------------------------
    if (bank) {
      await prisma.bank.create({
        data: {
          barberId: barberId,
          accountHolderName: bank.accountHolderName,
          accountNumber: bank.accountNumber,
          ifsc: bank.ifsc,
          bankName: bank.bankName,
          upiId: bank.upiId,
          gstNumber: bank.gstNumber,
          aadhaarNumber: bank.aadhaarNumber,
          panNumber: bank.panNumber,
        },
      });
    }

    // ---------------------------
    // 8) ISSUE TOKENS
    // ---------------------------
    const accessToken = generateAccessToken({
      id: newUser.id,
      role: "barber",
      username,
    });
    const refreshToken = generateRefreshToken({ id: newUser.id });

    // ---------------------------
    // 9) SAVE REFRESH TOKEN SESSION
    // ---------------------------
    await prisma.session.create({
      data: {
        userId: newUser.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    // ---------------------------
    // 10) RESPONSE
    // ---------------------------
    const res = resSend(
      {
        message: "Barber registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          role: "barber",
        },
      }, 201 );

       // set cookies
        setCookie(res,{name:"access_token", value: accessToken, maxAgeSec: Number(process.env.ACCESS_TOKEN_EXPIRES_IN ?? 900)});
        setCookie(res,{name:"refresh_token", value: refreshToken, maxAgeSec: Number(process.env.REFRESH_TOKEN_EXPIRES_IN ?? 7 * 24 * 3600)});
        console.log(`✔️ Barber registration successful for ${newUser.email} `)
        return res;
  } catch (err) {
    console.error("❌ BARBER REGISTER ERROR:", err);
    return resSend({success:false, error: "Server error" }, 500);
  }
}
