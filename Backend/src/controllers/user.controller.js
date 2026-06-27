import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Login / Auto-register
 * Public
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
    let { username } = req.body;
    username = username?.trim().toLowerCase();

    if (!username) throw new ApiError(400, "Username is required");

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
        throw new ApiError(
            400,
            "Username must be 3-30 characters and contain only lowercase letters, numbers, and underscores."
        );
    }

    let user = await User.findOne({ username });

    if (!user) {
        user = await User.create({ username });
    } else {
        user.lastSeenAt = new Date();
        await user.save({ validateBeforeSave: false });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, user, "Logged in successfully"));
});

/**
 * Logout
 * Auth required
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─── User (self) ──────────────────────────────────────────────────────────────

/**
 * Get current user
 * Auth required
 * GET /api/users/me
 */
const getMe = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

/**
 * Complete Profile
 * Auth required
 * POST /api/users/me/complete-profile
 */
const completeProfile = asyncHandler(async (req, res) => {
    const { name = "", email = "", role = "other", college = "" } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    user.name = name;
    user.email = email;
    user.role = role;
    user.college = college;
    user.profileCompleted = true;
    user.lastSeenAt = new Date();

    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile updated successfully"));
});

/**
 * Skip Profile
 * Auth required
 * POST /api/users/me/skip-profile
 */
const skipProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    user.profileCompleted = false;
    user.lastSeenAt = new Date();

    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile skipped successfully"));
});

/**
 * Update own profile
 * Auth required
 * PATCH /api/users/me
 */
const updateMe = asyncHandler(async (req, res) => {
    const { name, email, role, college } = req.body;
    // userType intentionally excluded — admin only

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (college !== undefined) updateData.college = college;
    updateData.lastSeenAt = new Date();

    const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!user) throw new ApiError(404, "User not found");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile updated successfully"));
});

/**
 * Get own transactions
 * Auth required
 * GET /api/users/me/transactions
 */
const getMyTransactions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;

    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const [transactions, total] = await Promise.all([
        Transaction.find(filter)
            .populate("integrationId", "name slug logoUrl")
            .populate("flowId", "name slug type")
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit)),
        Transaction.countDocuments(filter),
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { transactions, total, page: Number(page), limit: Number(limit) },
                "Transactions fetched successfully"
            )
        );
});

/**
 * Get own stats
 * Auth required
 * GET /api/users/me/stats
 */
const getMyStats = asyncHandler(async (req, res) => {
    const { totalRuns, successfulRuns, failedRuns, profileCompleted } = req.user;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { totalRuns, successfulRuns, failedRuns, profileCompleted },
                "Stats fetched successfully"
            )
        );
});

/* ----------------------------------------------------- */
/* REFRESH ACCESS TOKEN */
/* ----------------------------------------------------- */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken._id);

  if (!user) throw new ApiError(401, "Invalid refresh token");

  if (user.refreshToken !== incomingRefreshToken)
    throw new ApiError(401, "Refresh token is expired or already used");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const options = {
  httpOnly: true,
  secure: true,
  sameSite: "none"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access token refreshed successfully"
      )
    );
});

export {
    login,
    logout,
    getMe,
    completeProfile,
    skipProfile,
    updateMe,
    getMyTransactions,
    getMyStats,
    refreshAccessToken
};