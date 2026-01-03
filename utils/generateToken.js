import { SignJWT } from "jose";
import { JWT_SECRET } from "./getJwtSecret.js";

// Generete a JWT
// @param {Object} payload - Data to embed in the token.
// @param {String} expireIn - Expiration time (eg '15m', '7d', '30d')

export const generateToken = async (payload, expireIn = "15m") => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expireIn)
    .sign(JWT_SECRET);
};
