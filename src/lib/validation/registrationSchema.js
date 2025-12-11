import { z } from "zod";

export const coordsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const addressSchema = z.object({
  street: z.string().min(3, "Street is required"),
  landmark: z.string().optional(),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  country: z.string().default("India"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  coords: coordsSchema,
});

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be 3+ characters"),
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .regex(/^(?:\+91|0)?[6-9]\d{9}$/, "Invalid phone number")
    .optional(),
  password: z
    .string()
    .min(6, "Password must be 6+ chars")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number"),
  role: z.enum(["customer", "barber", "admin"]).default("customer"),
  adminKey: z.string().optional(), // validated only server-side for admin creation
  // barber-specific fields (address required for barber)
  address: addressSchema.optional(),
  shopName: z.string().min(2).optional(),
});
