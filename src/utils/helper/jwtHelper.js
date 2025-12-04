import jwt from "jsonwebtoken";

export async function generateToken(data) {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "7d" });
}