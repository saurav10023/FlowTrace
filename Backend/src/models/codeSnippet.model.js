import mongoose from "mongoose";

const codeSnippetSchema = new mongoose.Schema(
  {
    flowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flow",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    snippetType: {
      type: String,
      enum: [
        "frontend",
        "backend",
        "webhook",
        "verification",
        "full_flow",
        "configuration",
      ],
      required: true,
    },

    language: {
      type: String,
      enum: [
        "javascript",
        "typescript",
        "python",
        "java",
        "php",
        "go",
        "cpp",
        "csharp",
      ],
      default: "javascript",
    },

    framework: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "configuration",
        "create_order",
        "checkout",
        "payment",
        "verification",
        "webhook",
        "refund",
        "complete_flow",
      ],
      default: "complete_flow",
    },

    code: {
      type: String,
      required: true,
    },

    explanation: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

codeSnippetSchema.index({
  flowId: 1,
  snippetType: 1,
});

const CodeSnippet = mongoose.model(
  "CodeSnippet",
  codeSnippetSchema
);

export default CodeSnippet;