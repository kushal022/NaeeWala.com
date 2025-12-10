import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Name is too short"),

  email: z
    .string()
    .email("Invalid email format"),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),

  password: z
    .string()
    .min(6, "Password must be 6+ characters")
    .regex(/[A-Z]/, "Must include one uppercase letter")
    .regex(/[0-9]/, "Must include one number"),

  userType: z.enum(["customer", "barber", "admin"]),

  address: z.object({
    street: z.string().min(3),
    landmark: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().default("India"),
    pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
    coords: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),
});
