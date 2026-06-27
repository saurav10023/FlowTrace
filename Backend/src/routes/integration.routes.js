import { Router } from "express";
import {
  getIntegrations,
  getAllIntegrations,
  getFeaturedIntegrations,
  getIntegrationsByProvider,
  getIntegrationBySlug,
  getIntegrationById,
  getAvailableFilters,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  toggleIntegrationStatus,
  toggleFeaturedStatus,
  bulkUpdateSortOrder,
  recordRun,
  resetAnalytics,
  getAnalyticsSummary,
  addToArrayField,
  removeFromArrayField,
} from "../controllers/integration.controller.js";
import { verifyAdmin } from "../middlewares/authAdmin.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

// ─── Filters & Meta ───────────────────────────────────────────
router.get("/filters", getAvailableFilters);
router.get("/analytics", getAnalyticsSummary);

// ─── Bulk Operations ──────────────────────────────────────────
router.patch("/bulk-sort", bulkUpdateSortOrder);

// ─── Collection Routes ────────────────────────────────────────
router.get("/", getIntegrations);
router.get("/admin/all",verifyjwt , verifyAdmin ,getAllIntegrations);
router.get("/featured", getFeaturedIntegrations);
router.get("/provider/:provider", getIntegrationsByProvider);
router.post("/",verifyjwt , verifyAdmin , createIntegration);

// ─── Single Resource by ID ────────────────────────────────────
router.get("/:id", getIntegrationById);
router.put("/:id",verifyjwt , verifyAdmin , updateIntegration);
router.delete("/:id",verifyjwt , verifyAdmin , deleteIntegration);
router.patch("/:id/toggle-status",verifyjwt , verifyAdmin , toggleIntegrationStatus);
router.patch("/:id/toggle-featured", verifyjwt , verifyAdmin ,toggleFeaturedStatus);
router.patch("/:id/record-run", recordRun);
router.patch("/:id/reset-analytics",verifyjwt , verifyAdmin , resetAnalytics);

// Array field management
router.patch("/:id/array-field/add", verifyjwt, verifyAdmin, addToArrayField);
router.patch("/:id/array-field/remove", verifyjwt, verifyAdmin, removeFromArrayField);
// ─── Single Resource by Slug ──────────────────────────────────
router.get("/slug/:slug", getIntegrationBySlug);

export default router;