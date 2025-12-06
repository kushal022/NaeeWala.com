import { connectDB } from "@/lib/db.js";
import User from "@/models/User";
import Barber from "@/models/Barber";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateRefreshToken } from "@/utils/helper/jwtHelper";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    let {
      name,
      email,
      phone,
      password,
      role = "customer",   // "customer" | "barber" | "admin"
      adminKey,
      shopName,
      city,
      address,
      lat,
      lng
    } = body;

    // Validation
    if (!email)
      return Response.json({success:false, message: "Email required" }, { status: 400 });
    
    if (!password)
      return Response.json({success:false, message: "Password required" }, { status: 400 });

    // Admin creation allowed?
    if (role === "admin") {
      if (adminKey !== process.env.ADMIN_SECRET_KEY) {
        return Response.json(
          { success:false, message: "Invalid admin key" },
          { status: 401 }
        );
      }
    }

    // Check existing user
    const exist = await User.findOne({ email });
    if (exist)
      return Response.json(
        { success:false, message: "Email already used" },
        { status: 409 }
      );

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role
    });

    // If role is barber → create barber profile
    if (role === "barber") {
      await Barber.create({
        user: user._id,
        shopName,
        description: "",
        location: {
          address,
          city,
          coords: {
            type: "Point",
            coordinates: [lng, lat] // [lng, lat]
          }
        },
        workingHours: {},
        services: []
      });
    }

    // JWT create
    const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

    return Response.json({
      success: true,
      message: "User registered",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: refreshToken
    });
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
