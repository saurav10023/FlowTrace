import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Integration from "../models/integration.model.js";

import Flow from "../models/flow.model.js";
import mongoose from "mongoose";
// CRUD
// createFlow
// getFlowById
// updateFlow
// deleteFlow

// // Read & Discovery
// getFlowsByIntegration
// getFlowBySlug
// getAllFlows
// getFlowsByType
// getFlowsByFlowType
// getFlowsByTag
// getRunnableFlows

// // Admin Controls
// toggleFlowStatus
// toggleRunnableStatus
// bulkUpdateSortOrder
// bulkToggleStatus

// // Editable Fields
// addEditableField
// updateEditableField
// removeEditableField
// reorderEditableFields

// // Steps
// addStep
// updateStep
// removeStep
// reorderSteps

// // Analytics
// recordFlowRun
// resetFlowAnalytics
// getFlowAnalyticsSummary
// getAnalyticsByIntegration

// // Filters
// getAvailableFlowFilters

const createFlow = asyncHandler(async (req, res) => {
  const { integrationId, slug } = req.body;

  // Check integration exists
  const integration = await Integration.findById(integrationId);
  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  // Slug must be unique per integration
  const existingFlow = await Flow.findOne({ integrationId, slug });
  if (existingFlow) {
    throw new ApiError(400, "A flow with this slug already exists for this integration");
  }

  const flow = await Flow.create(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, flow, "Flow created successfully"));
});

const getFlowById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const flow = await Flow.findById(id).populate("integrationId", "name slug logoUrl");

  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Flow fetched successfully"));
});


const updateFlow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Guard slug uniqueness if slug is being changed
  if (req.body.slug) {
    const flow = await Flow.findById(id);
    if (!flow) throw new ApiError(404, "Flow not found");

    const conflict = await Flow.findOne({
      integrationId: flow.integrationId,
      slug: req.body.slug,
      _id: { $ne: id },
    });

    if (conflict) {
      throw new ApiError(400, "A flow with this slug already exists for this integration");
    }
  }

  const flow = await Flow.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Flow updated successfully"));
});


const deleteFlow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const flow = await Flow.findByIdAndDelete(id);

  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Flow deleted successfully"));
});

const getFlowsByIntegration = asyncHandler(async (req, res) => {
  const { integrationId } = req.params;

  const integration = await Integration.findById(integrationId);
  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  const flows = await Flow.find({
    integrationId,
    isActive: true,
  }).sort({ sortOrder: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, flows, "Flows fetched successfully"));
});

const getFlowBySlug = asyncHandler(async (req, res) => {
  const { integrationId, slug } = req.params;

  const flow = await Flow.findOne({
    integrationId,
    slug,
    isActive: true,
  }).populate("integrationId", "name slug logoUrl");

  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Flow fetched successfully"));
});
const getAllFlows = asyncHandler(async (req, res) => {
  const { integrationId } = req.query;

  const filter = {};
  if (integrationId) filter.integrationId = integrationId;

  const flows = await Flow.find(filter)
    .populate("integrationId", "name slug logoUrl")
    .sort({ sortOrder: 1, createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, flows, "All flows fetched successfully"));
});

const getFlowsByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { integrationId } = req.query;

  const filter = {
    type: new RegExp(type, "i"),
    isActive: true,
  };

  if (integrationId) filter.integrationId = integrationId;

  const flows = await Flow.find(filter)
    .populate("integrationId", "name slug logoUrl")
    .sort({ sortOrder: 1 });

  if (!flows.length) {
    throw new ApiError(404, "No flows found for this type");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, flows, "Flows fetched by type successfully"));
});

const getFlowsByFlowType = asyncHandler(async (req, res) => {
  const { flowType } = req.params;
  const { integrationId } = req.query;

  const filter = {
    flowType,
    isActive: true,
  };

  if (integrationId) filter.integrationId = integrationId;

  const flows = await Flow.find(filter)
    .populate("integrationId", "name slug logoUrl")
    .sort({ sortOrder: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, flows, "Flows fetched by flow type successfully"));
});

const getFlowsByTag = asyncHandler(async (req, res) => {
  const { tag } = req.params;
  const { integrationId } = req.query;

  const filter = {
    tags: tag.toLowerCase().trim(),
    isActive: true,
  };

  if (integrationId) filter.integrationId = integrationId;

  const flows = await Flow.find(filter)
    .populate("integrationId", "name slug logoUrl")
    .sort({ sortOrder: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, flows, "Flows fetched by tag successfully"));
});

const getRunnableFlows = asyncHandler(async (req, res) => {
  const { integrationId } = req.params;

  const integration = await Integration.findById(integrationId);
  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  const flows = await Flow.find({
    integrationId,
    isActive: true,
    isRunnable: true,
  }).sort({ sortOrder: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, flows, "Runnable flows fetched successfully"));
});


// admin controllers 

const toggleFlowStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const flow = await Flow.findById(id);

  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  flow.isActive = !flow.isActive;
  await flow.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        flow,
        `Flow ${flow.isActive ? "activated" : "deactivated"} successfully`
      )
    );
});


const toggleRunnableStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const flow = await Flow.findById(id);

  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  flow.isRunnable = !flow.isRunnable;
  await flow.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        flow,
        `Flow ${flow.isRunnable ? "marked as runnable" : "marked as non-runnable"}`
      )
    );
});

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

  const result = await Flow.bulkWrite(ops);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Sort order updated successfully"));
});

const bulkToggleStatus = asyncHandler(async (req, res) => {
  const { ids, isActive } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "ids must be a non-empty array");
  }

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive (boolean) is required");
  }

  const result = await Flow.updateMany(
    { _id: { $in: ids } },
    { $set: { isActive } }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        `Flows ${isActive ? "activated" : "deactivated"} successfully`
      )
    );
});

const addEditableField = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const flow = await Flow.findById(id);
  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  // Prevent duplicate keys
  const keyExists = flow.editableFields.some(
    (field) => field.key === req.body.key
  );
  if (keyExists) {
    throw new ApiError(400, `Field with key '${req.body.key}' already exists`);
  }

  flow.editableFields.push(req.body);
  await flow.save();

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Editable field added successfully"));
});

const updateEditableField = asyncHandler(async (req, res) => {
  const { id, key } = req.params;

  const flow = await Flow.findById(id);
  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  const fieldIndex = flow.editableFields.findIndex(
    (field) => field.key === key
  );
  if (fieldIndex === -1) {
    throw new ApiError(404, `Field with key '${key}' not found`);
  }

  // If key is being changed, check for conflicts
  if (req.body.key && req.body.key !== key) {
    const keyExists = flow.editableFields.some(
      (field) => field.key === req.body.key
    );
    if (keyExists) {
      throw new ApiError(400, `Field with key '${req.body.key}' already exists`);
    }
  }

  flow.editableFields[fieldIndex] = {
    ...flow.editableFields[fieldIndex].toObject(),
    ...req.body,
  };

  await flow.save();

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Editable field updated successfully"));
});

const removeEditableField = asyncHandler(async (req, res) => {
  const { id, key } = req.params;

  const flow = await Flow.findById(id);
  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  const fieldExists = flow.editableFields.some(
    (field) => field.key === key
  );
  if (!fieldExists) {
    throw new ApiError(404, `Field with key '${key}' not found`);
  }

  flow.editableFields = flow.editableFields.filter(
    (field) => field.key !== key
  );

  await flow.save();

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Editable field removed successfully"));
});

const reorderEditableFields = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { keys } = req.body; // ordered array of keys e.g. ["amount", "currency", "email"]

  if (!Array.isArray(keys) || keys.length === 0) {
    throw new ApiError(400, "keys must be a non-empty array of field keys in desired order");
  }

  const flow = await Flow.findById(id);
  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  // Validate all keys exist
  const existingKeys = flow.editableFields.map((f) => f.key);
  const invalidKeys = keys.filter((k) => !existingKeys.includes(k));
  if (invalidKeys.length > 0) {
    throw new ApiError(400, `Invalid keys: ${invalidKeys.join(", ")}`);
  }

  // Rebuild array in new order
  flow.editableFields = keys.map((key) =>
    flow.editableFields.find((f) => f.key === key)
  );

  await flow.save();

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Editable fields reordered successfully"));
});

const addStep = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const flow = await Flow.findById(id);
  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  // Prevent duplicate keys
  const keyExists = flow.steps.some(
    (step) => step.key === req.body.key
  );
  if (keyExists) {
    throw new ApiError(400, `Step with key '${req.body.key}' already exists`);
  }

  // If order not provided, append to end
  if (req.body.order === undefined) {
    req.body.order = flow.steps.length + 1;
  }

  // Check order conflict
  const orderExists = flow.steps.some(
    (step) => step.order === req.body.order
  );
  if (orderExists) {
    throw new ApiError(400, `Step with order '${req.body.order}' already exists`);
  }

  flow.steps.push(req.body);

  // Keep steps sorted by order
  flow.steps.sort((a, b) => a.order - b.order);

  await flow.save();

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Step added successfully"));
});

const updateStep = asyncHandler(async (req, res) => {
  const { id, key } = req.params;

  const flow = await Flow.findById(id);
  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  const stepIndex = flow.steps.findIndex(
    (step) => step.key === key
  );
  if (stepIndex === -1) {
    throw new ApiError(404, `Step with key '${key}' not found`);
  }

  // If key is being changed check for conflicts
  if (req.body.key && req.body.key !== key) {
    const keyExists = flow.steps.some(
      (step) => step.key === req.body.key
    );
    if (keyExists) {
      throw new ApiError(400, `Step with key '${req.body.key}' already exists`);
    }
  }

  // If order is being changed check for conflicts
  if (req.body.order !== undefined && req.body.order !== flow.steps[stepIndex].order) {
    const orderExists = flow.steps.some(
      (step, i) => step.order === req.body.order && i !== stepIndex
    );
    if (orderExists) {
      throw new ApiError(400, `Step with order '${req.body.order}' already exists`);
    }
  }

  flow.steps[stepIndex] = {
    ...flow.steps[stepIndex].toObject(),
    ...req.body,
  };

  // Re-sort after potential order change
  flow.steps.sort((a, b) => a.order - b.order);

  await flow.save();

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Step updated successfully"));
});

const removeStep = asyncHandler(async (req, res) => {
  const { id, key } = req.params;

  const flow = await Flow.findById(id);
  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  const stepExists = flow.steps.some(
    (step) => step.key === key
  );
  if (!stepExists) {
    throw new ApiError(404, `Step with key '${key}' not found`);
  }

  flow.steps = flow.steps.filter(
    (step) => step.key !== key
  );

  // Normalize order after removal
  flow.steps = flow.steps
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({
      ...step.toObject(),
      order: index + 1,
    }));

  await flow.save();

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Step removed successfully"));
});

const reorderSteps = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { keys } = req.body; // ordered array of keys e.g. ["init", "verify", "capture"]

  if (!Array.isArray(keys) || keys.length === 0) {
    throw new ApiError(400, "keys must be a non-empty array of step keys in desired order");
  }

  const flow = await Flow.findById(id);
  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  // Validate all keys exist
  const existingKeys = flow.steps.map((s) => s.key);
  const invalidKeys = keys.filter((k) => !existingKeys.includes(k));
  if (invalidKeys.length > 0) {
    throw new ApiError(400, `Invalid keys: ${invalidKeys.join(", ")}`);
  }

  // Rebuild in new order and reassign order numbers
  flow.steps = keys.map((key, index) => ({
    ...flow.steps.find((s) => s.key === key).toObject(),
    order: index + 1,
  }));

  await flow.save();

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Steps reordered successfully"));
});


const recordFlowRun = asyncHandler(async (req, res) => {
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

  const flow = await Flow.findByIdAndUpdate(id, update, { new: true });

  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Run recorded successfully"));
});


const resetFlowAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const flow = await Flow.findByIdAndUpdate(
    id,
    { $set: { totalRuns: 0, successfulRuns: 0, failedRuns: 0 } },
    { new: true }
  );

  if (!flow) {
    throw new ApiError(404, "Flow not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, flow, "Flow analytics reset successfully"));
});

const getFlowAnalyticsSummary = asyncHandler(async (req, res) => {
  const summary = await Flow.aggregate([
    {
      $group: {
        _id: null,
        totalFlows: { $sum: 1 },
        activeFlows: { $sum: { $cond: ["$isActive", 1, 0] } },
        runnableFlows: { $sum: { $cond: ["$isRunnable", 1, 0] } },
        totalRuns: { $sum: "$totalRuns" },
        successfulRuns: { $sum: "$successfulRuns" },
        failedRuns: { $sum: "$failedRuns" },
      },
    },
    {
      $project: {
        _id: 0,
        totalFlows: 1,
        activeFlows: 1,
        runnableFlows: 1,
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

  const perFlow = await Flow.find({})
    .select("name slug integrationId totalRuns successfulRuns failedRuns isActive")
    .populate("integrationId", "name slug")
    .sort({ totalRuns: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        overall: summary[0] || {
          totalFlows: 0,
          activeFlows: 0,
          runnableFlows: 0,
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0,
          successRate: 0,
        },
        perFlow,
      },
      "Flow analytics summary fetched successfully"
    )
  );
});

const getAnalyticsByIntegration = asyncHandler(async (req, res) => {
  const { integrationId } = req.params;

  const integration = await Integration.findById(integrationId);
  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  const summary = await Flow.aggregate([
    {
      $match: {
        integrationId: new mongoose.Types.ObjectId(integrationId),
      },
    },
    {
      $group: {
        _id: null,
        totalFlows: { $sum: 1 },
        activeFlows: { $sum: { $cond: ["$isActive", 1, 0] } },
        runnableFlows: { $sum: { $cond: ["$isRunnable", 1, 0] } },
        totalRuns: { $sum: "$totalRuns" },
        successfulRuns: { $sum: "$successfulRuns" },
        failedRuns: { $sum: "$failedRuns" },
      },
    },
    {
      $project: {
        _id: 0,
        totalFlows: 1,
        activeFlows: 1,
        runnableFlows: 1,
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

  const perFlow = await Flow.find({ integrationId })
    .select("name slug totalRuns successfulRuns failedRuns isActive isRunnable")
    .sort({ totalRuns: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        integration: { id: integration._id, name: integration.name, slug: integration.slug },
        overall: summary[0] || {
          totalFlows: 0,
          activeFlows: 0,
          runnableFlows: 0,
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0,
          successRate: 0,
        },
        perFlow,
      },
      "Integration flow analytics fetched successfully"
    )
  );
});


const getAvailableFlowFilters = asyncHandler(async (req, res) => {
  const { integrationId } = req.query;

  const filter = { isActive: true };
  if (integrationId) filter.integrationId = integrationId;

  const [tags, types, flowTypes, runnableCount, totalCount] = await Promise.all([
    Flow.distinct("tags", filter),
    Flow.distinct("type", filter),
    Flow.distinct("flowType", filter),
    Flow.countDocuments({ ...filter, isRunnable: true }),
    Flow.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tags,
        types,
        flowTypes,
        counts: {
          total: totalCount,
          runnable: runnableCount,
          nonRunnable: totalCount - runnableCount,
        },
      },
      "Available flow filters fetched successfully"
    )
  );
});


export{
    createFlow,
  getFlowById,
  updateFlow,
  deleteFlow,
  getFlowsByIntegration,
  getFlowBySlug,
  getAllFlows,
  getFlowsByType,
  getFlowsByFlowType,
  getFlowsByTag,
  getRunnableFlows,
  toggleFlowStatus,
  toggleRunnableStatus,
  bulkUpdateSortOrder,
  bulkToggleStatus,
  addEditableField,
  updateEditableField,
  removeEditableField,
  reorderEditableFields,
  addStep,
  updateStep,
  removeStep,
  reorderSteps,
  recordFlowRun,
  resetFlowAnalytics,
  getFlowAnalyticsSummary,
  getAnalyticsByIntegration,
  getAvailableFlowFilters,
}