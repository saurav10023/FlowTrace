import { Router } from "express";
import {
  createSnippet,
  getSnippetById,
  updateSnippet,
  deleteSnippet,
  getSnippetsByFlow,
  getSnippetsByType,
  getSnippetsByLanguage,
  getSnippetsByCategory,
  getSnippetsByFramework,
  getDefaultSnippet,
  getAllSnippets,
  toggleSnippetStatus,
  setDefaultSnippet,
  bulkUpdateOrder,
  bulkToggleStatus,
  getAvailableSnippetFilters,
} from "../controllers/codeSnippet.controller.js";
import { verifyAdmin } from "../middlewares/authAdmin.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

// ─── Filters & Meta ───────────────────────────────────────────────────────────
router.get("/filters", getAvailableSnippetFilters);

// ─── Bulk Operations ──────────────────────────────────────────────────────────
router.patch("/bulk-order", verifyjwt, verifyAdmin, bulkUpdateOrder);
router.patch("/bulk-status", verifyjwt, verifyAdmin, bulkToggleStatus);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get("/admin/all", verifyjwt, verifyAdmin, getAllSnippets);

// ─── Filter Routes ────────────────────────────────────────────────────────────
router.get("/type/:snippetType", getSnippetsByType);        // ?flowId= (optional)
router.get("/language/:language", getSnippetsByLanguage);   // ?flowId= (optional)
router.get("/category/:category", getSnippetsByCategory);   // ?flowId= (optional)
router.get("/framework/:framework", getSnippetsByFramework); // ?flowId= (optional)

// ─── Flow Scoped ──────────────────────────────────────────────────────────────
router.get("/flow/:flowId", getSnippetsByFlow);             // ?snippetType= ?language= ?category= ?framework= (optional)
router.get("/flow/:flowId/default", getDefaultSnippet);

// ─── Collection ───────────────────────────────────────────────────────────────
router.post("/", verifyjwt, verifyAdmin, createSnippet);

// ─── Single Resource by ID ────────────────────────────────────────────────────
router.get("/:id", getSnippetById);
router.put("/:id", verifyjwt, verifyAdmin, updateSnippet);
router.delete("/:id", verifyjwt, verifyAdmin, deleteSnippet);
router.patch("/:id/toggle-status", verifyjwt, verifyAdmin, toggleSnippetStatus);
router.patch("/:id/set-default", verifyjwt, verifyAdmin, setDefaultSnippet);

export default router;