import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET; 
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN ?? 900;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN ?? 60*60*24*7;


//^ Generate JWT Token
export async function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export const generateAccessToken = (payload) => {
  return jwt.sign(payload , ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN, 
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN, 
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
    return decoded; // If valid, return decoded payload (user payload)
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
  
