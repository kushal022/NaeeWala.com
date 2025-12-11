import { z } from "zod";

export const registerUserSchema = z.object({
  name: z.string().min(3, "Name must be 3 characters long"),
  email: z.string().email(),
  phone: z.string().regex(/^(?:\+91|0)?[6-9]\d{9}$/, "Invalid phone number"),
  password: z.string().min(6).regex(/[A-Z]/).regex(/[0-9]/),
});
