import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET; 
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

//^ Generate JWT Token
export async function generateToken(data) {
    return jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });
}

export const generateAccessToken = (data) => {
  return jwt.sign(data , ACCESS_TOKEN_SECRET, {
    expiresIn: '1d', 
  });
};

export const generateRefreshToken = (data) => {
  return jwt.sign(data, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d', 
  });
};

//^ Verify Tokens
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return decoded; 
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};


export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    return decoded; // If valid, return decoded payload (user data)
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

//^ Regenerate Access Token using Refresh Token
export const refreshAccessToken = (refreshToken) => {
  const { id, role } = verifyRefreshToken(refreshToken); // Decode refresh token to get userId
  const newAccessToken = generateAccessToken({ id, role }); // Generate a new access token
  return newAccessToken;
};
  
