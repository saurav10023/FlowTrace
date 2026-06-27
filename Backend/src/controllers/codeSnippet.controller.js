import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import CodeSnippet from "../models/codeSnippet.model.js";
import Flow from "../models/flow.model.js";

// ─── Core CRUD ────────────────────────────────────────────────────────────────

const createSnippet = asyncHandler(async (req, res) => {
  const { flowId } = req.body;

  const flow = await Flow.findById(flowId);
  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  // If this snippet is marked as default, unset all others in the same flow
  if (req.body.isDefault) {
    await CodeSnippet.updateMany(
      { flowId },
      { $set: { isDefault: false } }
    );
  }

  const snippet = await CodeSnippet.create(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, snippet, "Snippet created successfully"));
});

const getSnippetById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const snippet = await CodeSnippet.findById(id).populate(
    "flowId",
    "name slug type flowType"
  );

  if (!snippet) {
    throw new ApiError(404, "Snippet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, snippet, "Snippet fetched successfully"));
});

const updateSnippet = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // If setting as default, unset all others in same flow first
  if (req.body.isDefault) {
    const snippet = await CodeSnippet.findById(id);
    if (!snippet) {
      throw new ApiError(404, "Snippet not found");
    }

    await CodeSnippet.updateMany(
      { flowId: snippet.flowId, _id: { $ne: id } },
      { $set: { isDefault: false } }
    );
  }

  const snippet = await CodeSnippet.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!snippet) {
    throw new ApiError(404, "Snippet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, snippet, "Snippet updated successfully"));
});

const deleteSnippet = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const snippet = await CodeSnippet.findByIdAndDelete(id);

  if (!snippet) {
    throw new ApiError(404, "Snippet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Snippet deleted successfully"));
});

// ─── Read & Discovery ─────────────────────────────────────────────────────────

const getSnippetsByFlow = asyncHandler(async (req, res) => {
  const { flowId } = req.params;
  const { snippetType, language, category, framework } = req.query;

  const flow = await Flow.findById(flowId);
  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  const filter = { flowId, isActive: true };

  if (snippetType) filter.snippetType = snippetType;
  if (language) filter.language = language;
  if (category) filter.category = category;
  if (framework) filter.framework = new RegExp(framework, "i");

  const snippets = await CodeSnippet.find(filter).sort({ order: 1, createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, snippets, "Snippets fetched successfully"));
});

const getSnippetsByType = asyncHandler(async (req, res) => {
  const { snippetType } = req.params;
  const { flowId } = req.query;

  const filter = { snippetType, isActive: true };
  if (flowId) filter.flowId = flowId;

  const snippets = await CodeSnippet.find(filter)
    .populate("flowId", "name slug type")
    .sort({ order: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, snippets, "Snippets fetched by type successfully"));
});

const getSnippetsByLanguage = asyncHandler(async (req, res) => {
  const { language } = req.params;
  const { flowId } = req.query;

  const filter = { language, isActive: true };
  if (flowId) filter.flowId = flowId;

  const snippets = await CodeSnippet.find(filter)
    .populate("flowId", "name slug type")
    .sort({ order: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, snippets, "Snippets fetched by language successfully"));
});

const getSnippetsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { flowId } = req.query;

  const filter = { category, isActive: true };
  if (flowId) filter.flowId = flowId;

  const snippets = await CodeSnippet.find(filter)
    .populate("flowId", "name slug type")
    .sort({ order: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, snippets, "Snippets fetched by category successfully"));
});

const getSnippetsByFramework = asyncHandler(async (req, res) => {
  const { framework } = req.params;
  const { flowId } = req.query;

  const filter = {
    framework: new RegExp(framework, "i"),
    isActive: true,
  };
  if (flowId) filter.flowId = flowId;

  const snippets = await CodeSnippet.find(filter)
    .populate("flowId", "name slug type")
    .sort({ order: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, snippets, "Snippets fetched by framework successfully"));
});

const getDefaultSnippet = asyncHandler(async (req, res) => {
  const { flowId } = req.params;

  const flow = await Flow.findById(flowId);
  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  const snippet = await CodeSnippet.findOne({
    flowId,
    isDefault: true,
    isActive: true,
  }).populate("flowId", "name slug type flowType");

  if (!snippet) {
    throw new ApiError(404, "No default snippet found for this flow");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, snippet, "Default snippet fetched successfully"));
});

const getAllSnippets = asyncHandler(async (req, res) => {
  const { flowId, snippetType, language, category } = req.query;

  const filter = {};
  if (flowId) filter.flowId = flowId;
  if (snippetType) filter.snippetType = snippetType;
  if (language) filter.language = language;
  if (category) filter.category = category;

  const snippets = await CodeSnippet.find(filter)
    .populate("flowId", "name slug type flowType")
    .sort({ order: 1, createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, snippets, "All snippets fetched successfully"));
});

// ─── Admin Controls ───────────────────────────────────────────────────────────

const toggleSnippetStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const snippet = await CodeSnippet.findById(id);
  if (!snippet) {
    throw new ApiError(404, "Snippet not found");
  }

  snippet.isActive = !snippet.isActive;
  await snippet.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        snippet,
        `Snippet ${snippet.isActive ? "activated" : "deactivated"} successfully`
      )
    );
});

const setDefaultSnippet = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const snippet = await CodeSnippet.findById(id);
  if (!snippet) {
    throw new ApiError(404, "Snippet not found");
  }

  if (!snippet.isActive) {
    throw new ApiError(400, "Cannot set an inactive snippet as default");
  }

  // Unset all others in the same flow
  await CodeSnippet.updateMany(
    { flowId: snippet.flowId, _id: { $ne: id } },
    { $set: { isDefault: false } }
  );

  snippet.isDefault = true;
  await snippet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, snippet, "Default snippet set successfully"));
});

const bulkUpdateOrder = asyncHandler(async (req, res) => {
  const updates = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new ApiError(400, "Request body must be a non-empty array of { id, order }");
  }

  const ops = updates.map(({ id, order }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order } },
    },
  }));

  const result = await CodeSnippet.bulkWrite(ops);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Snippet order updated successfully"));
});

const bulkToggleStatus = asyncHandler(async (req, res) => {
  const { ids, isActive } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "ids must be a non-empty array");
  }

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive (boolean) is required");
  }

  // If deactivating, also unset isDefault on those snippets
  if (!isActive) {
    await CodeSnippet.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive, isDefault: false } }
    );
  } else {
    await CodeSnippet.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive } }
    );
  }

  const updated = await CodeSnippet.find({ _id: { $in: ids } });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updated,
        `Snippets ${isActive ? "activated" : "deactivated"} successfully`
      )
    );
});

// ─── Filters & Meta ───────────────────────────────────────────────────────────

const getAvailableSnippetFilters = asyncHandler(async (req, res) => {
  const { flowId } = req.query;

  const filter = { isActive: true };
  if (flowId) filter.flowId = flowId;

  const [snippetTypes, languages, categories, frameworks] = await Promise.all([
    CodeSnippet.distinct("snippetType", filter),
    CodeSnippet.distinct("language", filter),
    CodeSnippet.distinct("category", filter),
    CodeSnippet.distinct("framework", filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        snippetTypes,
        languages,
        categories,
        frameworks: frameworks.filter(Boolean), // remove empty strings
      },
      "Available snippet filters fetched successfully"
    )
  );
});

// ─── Export ───────────────────────────────────────────────────────────────────

export {
  // CRUD
  createSnippet,
  getSnippetById,
  updateSnippet,
  deleteSnippet,

  // Read & Discovery
  getSnippetsByFlow,
  getSnippetsByType,
  getSnippetsByLanguage,
  getSnippetsByCategory,
  getSnippetsByFramework,
  getDefaultSnippet,
  getAllSnippets,

  // Admin Controls
  toggleSnippetStatus,
  setDefaultSnippet,
  bulkUpdateOrder,
  bulkToggleStatus,

  // Filters
  getAvailableSnippetFilters,
};