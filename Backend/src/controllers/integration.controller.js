
import Integration from "../models/integration.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Get all active integrations
 * Supports filtering by provider, tags, features, payment methods, flows
 * Supports search by name/description
 * Supports featured-only filter
 */
const getIntegrations = asyncHandler(async (req, res) => {
  const {
    provider,
    tags,
    features,
    paymentMethods,
    flows,
    featured,
    search,
    webhookSupported,
    refundsSupported,
    sandboxSupported,
  } = req.query;

  const filter = { isActive: true };

  if (provider) filter.provider = new RegExp(provider, "i");
  if (featured === "true") filter.isFeatured = true;
  if (webhookSupported === "true") filter.webhookSupported = true;
  if (refundsSupported === "true") filter.refundsSupported = true;
  if (sandboxSupported === "true") filter.sandboxSupported = true;

  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim());
    filter.tags = { $in: tagList };
  }

  if (features) {
    const featureList = features.split(",").map((f) => f.trim());
    filter.supportedFeatures = { $in: featureList };
  }

  if (paymentMethods) {
    const methodList = paymentMethods.split(",").map((m) => m.trim());
    filter.supportedPaymentMethods = { $in: methodList };
  }

  if (flows) {
    const flowList = flows.split(",").map((f) => f.trim());
    filter.supportedFlows = { $in: flowList };
  }

  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
      { shortDescription: new RegExp(search, "i") },
      { provider: new RegExp(search, "i") },
    ];
  }

  const integrations = await Integration.find(filter).sort({ sortOrder: 1, createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, integrations, "Integrations fetched successfully"));
});

/**
 * Get all integrations including inactive ones (admin use)
 */
const getAllIntegrations = asyncHandler(async (req, res) => {
  const integrations = await Integration.find({}).sort({ sortOrder: 1, createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, integrations, "All integrations fetched successfully"));
});

/**
 * Get featured integrations
 */
const getFeaturedIntegrations = asyncHandler(async (req, res) => {
  const integrations = await Integration.find({
    isActive: true,
    isFeatured: true,
  }).sort({ sortOrder: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, integrations, "Featured integrations fetched successfully"));
});

/**
 * Get integration by slug
 */
const getIntegrationBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const integration = await Integration.findOne({ slug, isActive: true });

  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, integration, "Integration fetched successfully"));
});

/**
 * Get integration by ID
 */
const getIntegrationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const integration = await Integration.findById(id);

  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, integration, "Integration fetched successfully"));
});

/**
 * Create integration
 */
const createIntegration = asyncHandler(async (req, res) => {
  const existingIntegration = await Integration.findOne({ slug: req.body.slug });

  if (existingIntegration) {
    throw new ApiError(400, "Integration with this slug already exists");
  }

  const integration = await Integration.create(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, integration, "Integration created successfully"));
});

/**
 * Update integration
 */
const updateIntegration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent changing slug to one that already exists on another doc
  if (req.body.slug) {
    const conflict = await Integration.findOne({
      slug: req.body.slug,
      _id: { $ne: id },
    });
    if (conflict) {
      throw new ApiError(400, "Another integration with this slug already exists");
    }
  }

  const integration = await Integration.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, integration, "Integration updated successfully"));
});

/**
 * Delete integration
 */
const deleteIntegration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const integration = await Integration.findByIdAndDelete(id);

  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Integration deleted successfully"));
});

/**
 * Toggle active status
 */
const toggleIntegrationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const integration = await Integration.findById(id);

  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  integration.isActive = !integration.isActive;
  await integration.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        integration,
        `Integration ${integration.isActive ? "activated" : "deactivated"} successfully`
      )
    );
});

/**
 * Toggle featured status
 */
const toggleFeaturedStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const integration = await Integration.findById(id);

  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  integration.isFeatured = !integration.isFeatured;
  await integration.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        integration,
        `Integration ${integration.isFeatured ? "marked as featured" : "removed from featured"}`
      )
    );
});

/**
 * Record a run result for analytics
 * Body: { success: true | false }
 */
const recordRun = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { success } = req.body;

  if (typeof success !== "boolean") {
    throw new ApiError(400, "Field 'success' (boolean) is required");
  }

  const update = {
    $inc: {
      totalRuns: 1,
      ...(success ? { successfulRuns: 1 } : { failedRuns: 1 }),
    },
  };

  const integration = await Integration.findByIdAndUpdate(id, update, { new: true });

  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, integration, "Run recorded successfully"));
});

/**
 * Reset analytics counters for an integration
 */
const resetAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const integration = await Integration.findByIdAndUpdate(
    id,
    { $set: { totalRuns: 0, successfulRuns: 0, failedRuns: 0 } },
    { new: true }
  );

  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, integration, "Analytics reset successfully"));
});

/**
 * Get analytics summary across all integrations
 */
const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const summary = await Integration.aggregate([
    {
      $group: {
        _id: null,
        totalIntegrations: { $sum: 1 },
        activeIntegrations: { $sum: { $cond: ["$isActive", 1, 0] } },
        featuredIntegrations: { $sum: { $cond: ["$isFeatured", 1, 0] } },
        totalRuns: { $sum: "$totalRuns" },
        successfulRuns: { $sum: "$successfulRuns" },
        failedRuns: { $sum: "$failedRuns" },
      },
    },
    {
      $project: {
        _id: 0,
        totalIntegrations: 1,
        activeIntegrations: 1,
        featuredIntegrations: 1,
        totalRuns: 1,
        successfulRuns: 1,
        failedRuns: 1,
        successRate: {
          $cond: [
            { $gt: ["$totalRuns", 0] },
            {
              $round: [
                { $multiply: [{ $divide: ["$successfulRuns", "$totalRuns"] }, 100] },
                2,
              ],
            },
            0,
          ],
        },
      },
    },
  ]);

  const perIntegration = await Integration.find({})
    .select("name slug totalRuns successfulRuns failedRuns isActive")
    .sort({ totalRuns: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        overall: summary[0] || {
          totalIntegrations: 0,
          activeIntegrations: 0,
          featuredIntegrations: 0,
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0,
          successRate: 0,
        },
        perIntegration,
      },
      "Analytics summary fetched successfully"
    )
  );
});

/**
 * Bulk update sort order
 * Body: [{ id, sortOrder }]
 */
const bulkUpdateSortOrder = asyncHandler(async (req, res) => {
  const updates = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new ApiError(400, "Request body must be a non-empty array of { id, sortOrder }");
  }

  const ops = updates.map(({ id, sortOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { sortOrder } },
    },
  }));

  const result = await Integration.bulkWrite(ops);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Sort order updated successfully"));
});

const getIntegrationsByProvider = asyncHandler(async (req, res) => {
  const { provider } = req.params;

  const integrations = await Integration.find({
    provider: new RegExp(provider, "i"),
    isActive: true,
  }).sort({ sortOrder: 1 });

  if (!integrations.length) {
    throw new ApiError(404, "No integrations found for this provider");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, integrations, "Provider integrations fetched successfully"));
});

const getAvailableFilters = asyncHandler(async (req, res) => {
  const [tags, paymentMethods, flows, features, providers] = await Promise.all([
    Integration.distinct("tags", { isActive: true }),
    Integration.distinct("supportedPaymentMethods", { isActive: true }),
    Integration.distinct("supportedFlows", { isActive: true }),
    Integration.distinct("supportedFeatures", { isActive: true }),
    Integration.distinct("provider", { isActive: true }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { tags, paymentMethods, flows, features, providers },
      "Available filters fetched successfully"
    )
  );
});

// Add a single value to any array field
const addToArrayField = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { field, value } = req.body;

  const allowedArrayFields = [
    "supportedFeatures",
    "supportedPaymentMethods",
    "supportedFlows",
    "tags",
  ];

  if (!allowedArrayFields.includes(field)) {
    throw new ApiError(400, `Field '${field}' is not an allowed array field`);
  }

  const integration = await Integration.findByIdAndUpdate(
    id,
    { $addToSet: { [field]: value } }, // $addToSet prevents duplicates
    { new: true }
  );

  if (!integration) throw new ApiError(404, "Integration not found");

  return res
    .status(200)
    .json(new ApiResponse(200, integration, `Added '${value}' to ${field}`));
});

// Remove a single value from any array field
const removeFromArrayField = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { field, value } = req.body;

  const allowedArrayFields = [
    "supportedFeatures",
    "supportedPaymentMethods",
    "supportedFlows",
    "tags",
  ];

  if (!allowedArrayFields.includes(field)) {
    throw new ApiError(400, `Field '${field}' is not an allowed array field`);
  }

  const integration = await Integration.findByIdAndUpdate(
    id,
    { $pull: { [field]: value } },
    { new: true }
  );

  if (!integration) throw new ApiError(404, "Integration not found");

  return res
    .status(200)
    .json(new ApiResponse(200, integration, `Removed '${value}' from ${field}`));
});

export {
  getIntegrations,
  getAllIntegrations,
  getFeaturedIntegrations,
  getIntegrationBySlug,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  toggleIntegrationStatus,
  toggleFeaturedStatus,
  recordRun,
  resetAnalytics,
  getAnalyticsSummary,
  bulkUpdateSortOrder,
  getIntegrationsByProvider,
  getAvailableFilters,
  addToArrayField,
  removeFromArrayField
};