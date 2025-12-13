import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/registerSchema";

/**
 * POST /api/auth/register
 * Body: { name, email, phone, password, userType, adminKey?, address?, shopName? }
 */
export async function POST(req) {
  try {
    const body = await req.json();

    // validate input
    const { success, data, error } = registerSchema.safeParse(body);
    if (!success) {
      const firstErr = error.errors[0];
      return NextResponse.json({success:false , error: firstErr.message }, { status: 400 });
    }
    const { name, email, phone, password, role, adminKey, address, shopName } = data;

    // admin creation guard
    if (role === "admin") {
      if (adminKey !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({success: false, error: "Invalid admin key" }, { status: 401 });
      }
    }

    // check duplicates (email/phone)
    const already = await prisma.user.findFirst({
      where: { OR: [{ email }, phone ? { phone } : undefined ].filter(Boolean)}
    });
    if (already) {
      return NextResponse.json({success: false, error: "Email or phone already registered" }, { status: 409 });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // Transaction: create user -> (address) -> (barber)
    const created = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone: phone ?? null,
          password: hashed,
          role: role
        }
      });

      // If barber, we require address in request (validated above)
      if (userType === "barber") {
        if (!address) throw new Error("Address required for barber registration");

        const newAddress = await tx.address.create({
          data: {
            street: address.street,
            landmark: address.landmark ?? null,
            city: address.city,
            state: address.state,
            country: address.country ?? "India",
            pincode: address.pincode,
            lat: address.coords.lat,
            lng: address.coords.lng
          }
        });

        const newBarber = await tx.barber.create({
          data: {
            userId: newUser.id, // barber.userId is unique (one-to-one)
            shopName: shopName ?? `${name}'s Barber Shop`,
            description: "",
            addressId: newAddress.id,
            status: "pending" // admin will approve later
          }
        });

        return { user: newUser, barber: newBarber, address: newAddress };
      }

      return { user: newUser };
    });

    // generate jwt
    const token = jwt.sign(
      { id: created.user.id, role: created.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // send minimal user back (no password)
    return NextResponse.json({
      message: "Registration successful",
      token,
      user: {
        id: created.user.id,
        name: created.user.name,
        email: created.user.email,
        role: created.user.role
      }
    }, { status: 201 });

  } catch (err) {
    // handle unique constraint (Prisma P2002)
    if (err && err.code === "P2002") {
      // find which field
      const meta = err.meta || {};
      const target = meta.target ? meta.target.join(", ") : "unique field";
      return NextResponse.json({ error: `${target} already exists` }, { status: 409 });
    }

    console.error("Register error:", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}





// import { connectDB } from "@/lib/db.js";
// import User from "@/models/User";
// import Barber from "@/models/Barber";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { generateRefreshToken } from "@/utils/helper/jwtHelper";
// import { resSend } from "@/utils/helper/resHelper";

// export async function POST(req) {
//   try {
//     await connectDB();
//     const body = await req.json();

//     let {
//       name,
//       email,
//       phone,
//       password,
//       role = "customer",   // "customer" | "barber" | "admin"
//       adminKey,
//       shopName,
//       city,
//       address,
//       lat,
//       lng
//     } = body;

//     const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     const passwordReg = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//     const indiaMobileReg = /^(?:\+91|0)?[6-9]\d{9}$/;


//     // Validation
//     if (!email || email.trim() === "") return resSend({success:false, message: "Email required" }, 400);
//     if (!emailReg.test(email)) return resSend({success:false, message: "Invalid email format" }, 400);
//     if (!password) return resSend({success:false, message: "Password required" }, 400);
//     if (!passwordReg.test(password)) return resSend({success:false, message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character." }, 400);
//     if (!phone) return resSend({success:false, message: "Phone number required" }, 400);
//     if (!indiaMobileReg.test(phone)) return resSend({success:false, message: "Invalid phone number" }, 400);

//     // Admin creation allowed?
//     if (role === "admin") {
//       if (adminKey !== process.env.ADMIN_SECRET_KEY) {
//         return Response.json(
//           { success:false, message: "Invalid admin key" },
//           { status: 401 }
//         );
//       }
//     }

//     // Check existing user
//     const exist = await User.findOne({ email });
//     if (exist)
//       return Response.json(
//         { success:false, message: "Email already used" },
//         { status: 409 }
//       );

//     // Hash password
//     const hashed = await bcrypt.hash(password, 10);

//     // Create User
//     const user = await User.create({
//       name,
//       email,
//       phone,
//       password: hashed,
//       role
//     });

//     // If role is barber → create barber profile
//     if (role === "barber") {
//       await Barber.create({
//         user: user._id,
//         shopName,
//         description: "",
//         location: {
//           address,
//           city,
//           coords: {
//             type: "Point",
//             coordinates: [lng, lat] // [lng, lat]
//           }
//         },
//         workingHours: {},
//         services: []
//       });
//     }

//     // JWT create
//     const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

//     return Response.json({
//       success: true,
//       message: "User registered",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       },
//       token: refreshToken
//     });
//   } catch (err) {
//     return Response.json(
//       { error: err.message },
//       { status: 500 }
//     );
//   }
// }






// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// import connectDB from "@/lib/db";
// import User from "@/models/User";
// import Address from "@/models/Address";
// import Barber from "@/models/Barber";

// import { registerSchema } from "@/lib/validation/registerSchema";

// export async function POST(req) {
//   try {
//     await connectDB();

//     const body = await req.json();

//     // 🔍 Validate input
//     const { success, data, error } = registerSchema.safeParse(body);

//     if (!success) {
//       return NextResponse.json(
//         { error: error.errors[0].message },
//         { status: 400 }
//       );
//     }

//     const { name, email, phone, password, userType, address } = data;

//     // 🛑 Check duplicate email/phone
//     const existing = await User.findOne({ $or: [{ email }, { phone }] });
//     if (existing) {
//       return NextResponse.json(
//         { error: "Email or Phone already registered" },
//         { status: 409 }
//       );
//     }

//     // 🔐 Hash password
//     const hashed = await bcrypt.hash(password, 10);

//     // ➕ Create user
//     const newUser = await User.create({
//       name,
//       email,
//       phone,
//       password: hashed,
//       role: userType,
//     });

//     // 🏠 Create Address
//     const newAddress = await Address.create({
//       street: address.street,
//       landmark: address.landmark,
//       city: address.city,
//       state: address.state,
//       country: address.country,
//       pincode: address.pincode,
//       coords: {
//         type: "Point",
//         coordinates: [address.coords.lng, address.coords.lat],
//       },
//     });

//     // If user is BARBER → create Barber profile
//     if (userType === "barber") {
//       await Barber.create({
//         user: newUser._id,
//         shopName: `${name}'s Barber Shop`,
//         address: newAddress._id,
//         status: "pending",
//       });
//     }

//     // 🔑 Generate JWT token
//     const token = jwt.sign(
//       {
//         id: newUser._id,
//         role: newUser.role,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return NextResponse.json(
//       {
//         message: "Registration successful",
//         token,
//         user: {
//           id: newUser._id,
//           name: newUser.name,
//           email: newUser.email,
//           role: newUser.role,
//         },
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.log("Register error:", error);
//     return NextResponse.json(
//       { error: "Server error occurred" },
//       { status: 500 }
//     );
//   }
// }
