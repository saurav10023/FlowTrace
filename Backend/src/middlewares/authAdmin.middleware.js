import { ApiError } from "../utils/ApiError.js";

export const verifyAdmin = (req, res, next) => {
  if (req.user?.userType !== "admin") {
    return next(new ApiError(403, "Access denied. Admins only."));
  }
  next();
};