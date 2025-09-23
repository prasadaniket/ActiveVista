import jwt from "jsonwebtoken";

/**
 * Generate JWT token for user authentication
 * @param {string} userId - User ID to encode in token
 * @param {string} expiresIn - Token expiration time (default: 7d)
 * @returns {string} JWT token
 */
export const generateToken = (userId, expiresIn = "7d") => {
  try {
    if (!process.env.JWT) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign(
      { id: userId },
      process.env.JWT,
      { 
        expiresIn,
        issuer: "ActiveVista",
        audience: "ActiveVista-Users"
      }
    );

    return token;
  } catch (error) {
    console.error("❌ Token generation error:", error.message);
    throw new Error("Failed to generate authentication token");
  }
};

/**
 * Generate refresh token for user authentication
 * @param {string} userId - User ID to encode in token
 * @returns {string} Refresh JWT token
 */
export const generateRefreshToken = (userId) => {
  try {
    if (!process.env.JWT_REFRESH) {
      throw new Error("JWT_REFRESH_SECRET is not defined in environment variables");
    }

    const refreshToken = jwt.sign(
      { id: userId, type: "refresh" },
      process.env.JWT_REFRESH,
      { 
        expiresIn: "30d",
        issuer: "ActiveVista",
        audience: "ActiveVista-Users"
      }
    );

    return refreshToken;
  } catch (error) {
    console.error("❌ Refresh token generation error:", error.message);
    throw new Error("Failed to generate refresh token");
  }
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    if (!process.env.JWT) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, process.env.JWT);
    return decoded;
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    throw new Error("Invalid or expired token");
  }
};
