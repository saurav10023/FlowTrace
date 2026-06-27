import { Router } from "express";
import {
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
} from "../controllers/flow.controller.js";
import { verifyAdmin } from "../middlewares/authAdmin.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

// ─── Filters & Meta ───────────────────────────────────────────────────────────
router.get("/filters", getAvailableFlowFilters);

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get("/analytics", verifyjwt, verifyAdmin, getFlowAnalyticsSummary);
router.get("/analytics/integration/:integrationId", verifyjwt, verifyAdmin, getAnalyticsByIntegration);

// ─── Bulk Operations ──────────────────────────────────────────────────────────
router.patch("/bulk-sort", verifyjwt, verifyAdmin, bulkUpdateSortOrder);
router.patch("/bulk-status", verifyjwt, verifyAdmin, bulkToggleStatus);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get("/admin/all", verifyjwt, verifyAdmin, getAllFlows);

// ─── Collection Routes ────────────────────────────────────────────────────────
router.get("/", getFlowsByIntegration);  // ?integrationId=
router.post("/", verifyjwt, verifyAdmin, createFlow);

// ─── Filter Routes ────────────────────────────────────────────────────────────
router.get("/type/:type", getFlowsByType);           // ?integrationId= (optional)
router.get("/flow-type/:flowType", getFlowsByFlowType); // ?integrationId= (optional)
router.get("/tag/:tag", getFlowsByTag);              // ?integrationId= (optional)

// ─── Integration Scoped ───────────────────────────────────────────────────────
router.get("/integration/:integrationId", getFlowsByIntegration);
router.get("/integration/:integrationId/runnable", getRunnableFlows);
router.get("/integration/:integrationId/slug/:slug", getFlowBySlug);

// ─── Single Resource by ID ────────────────────────────────────────────────────
router.get("/:id", getFlowById);
router.put("/:id", verifyjwt, verifyAdmin, updateFlow);
router.delete("/:id", verifyjwt, verifyAdmin, deleteFlow);

// ─── Toggle Controls ──────────────────────────────────────────────────────────
router.patch("/:id/toggle-status", verifyjwt, verifyAdmin, toggleFlowStatus);
router.patch("/:id/toggle-runnable", verifyjwt, verifyAdmin, toggleRunnableStatus);

// ─── Analytics per Flow ───────────────────────────────────────────────────────
router.patch("/:id/record-run", recordFlowRun);
router.patch("/:id/reset-analytics", verifyjwt, verifyAdmin, resetFlowAnalytics);

// ─── Editable Fields ──────────────────────────────────────────────────────────
router.post("/:id/editable-fields", verifyjwt, verifyAdmin, addEditableField);
router.put("/:id/editable-fields/:key", verifyjwt, verifyAdmin, updateEditableField);
router.delete("/:id/editable-fields/:key", verifyjwt, verifyAdmin, removeEditableField);
router.patch("/:id/editable-fields/reorder", verifyjwt, verifyAdmin, reorderEditableFields);

// ─── Steps ────────────────────────────────────────────────────────────────────
router.post("/:id/steps", verifyjwt, verifyAdmin, addStep);
router.put("/:id/steps/:key", verifyjwt, verifyAdmin, updateStep);
router.delete("/:id/steps/:key", verifyjwt, verifyAdmin, removeStep);
router.patch("/:id/steps/reorder", verifyjwt, verifyAdmin, reorderSteps);

export default router;