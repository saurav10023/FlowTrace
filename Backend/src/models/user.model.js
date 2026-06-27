import mongoose from "mongoose";
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            index: true,
            trim: true,
            lowercase: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username cannot exceed 30 characters"],
            match: [
                /^[a-z0-9_]+$/,
                "Username can only contain lowercase letters, numbers, and underscores",
            ],
        },

        name: {
            type: String,
            default: "",
            trim: true,
        },

        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },

        // Descriptive role: what the user does
        role: {
            type: String,
            enum: ["student", "developer", "educator", "other"],
            default: "other",
        },

        // System role: access level
        userType: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },

        college: {
            type: String,
            default: "",
            trim: true,
        },

        profileCompleted: {
            type: Boolean,
            default: false,
        },

        totalRuns: {
            type: Number,
            default: 0,
        },

        successfulRuns: {
            type: Number,
            default: 0,
        },

        failedRuns: {
            type: Number,
            default: 0,
        },

        lastSeenAt: {
            type: Date,
            default: Date.now,
        },
        refreshToken: {
            type: String,
            default:""
        }
    },
    {
        timestamps: true,
    }
);

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,  // <-- fixed
            userType: this.userType
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
}

// Generate JWT refresh token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
}

const User = mongoose.model("User", userSchema);

export default User;