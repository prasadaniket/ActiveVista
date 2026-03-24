/*
  middleware/auth.js
  Purpose: Authentication/authorization middlewares: verifyToken, verifyAdmin, verifyUser.
  Notes: Reads Bearer token, validates JWT, attaches req.user for controllers.
*/
import jwt from "jsonwebtoken";
import { createError } from "./errorMiddleware.js";

export const verifyToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return next(createError(401, "You are not authenticated!"));
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return next(createError(401, "You are not authenticated"));
    }

    const decode = jwt.verify(token, process.env.JWT, {
      issuer: "ActiveVista",
      audience: "ActiveVista-Users",
    });
    req.user = decode;
    return next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(createError(401, "Invalid token"));
    } else if (err.name === "TokenExpiredError") {
      return next(createError(401, "Token expired"));
    }
    next(err);
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return next(createError(403, "You are not authorized!"));
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    if (!req.user || (req.user.id !== req.params.id && req.user.role !== "admin")) {
      return next(createError(403, "You are not authorized!"));
    }
    next();
  } catch (err) {
    next(err);
  }
};
