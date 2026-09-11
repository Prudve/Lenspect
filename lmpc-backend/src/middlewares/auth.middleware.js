import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request: Missing access token");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid or expired access token");
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid access token: User not found");
    }

    req.user = user;
    next();
});