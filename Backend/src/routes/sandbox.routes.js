import express from "express"
import { getRunTransaction, getSandboxRun, handleRazorpayCancelController, handleRazorpayFailureController, listSandboxRuns, runSandbox, verifyRazorpayPaymentController } from "../controllers/sandbox.controller.js";
import { verifyRazorpayPayment } from "../services/integrations/razorpay/razorpaySandbox.service.js";



const router = express.Router();
router.post("/run" ,runSandbox );
router.post("/razorpay/failure" ,handleRazorpayFailureController );
router.post("/razorpay/verify" ,verifyRazorpayPaymentController );
router.post("/razorpay/cancel" , handleRazorpayCancelController);

router.get("/run/:runId" , getSandboxRun);
router.get("/transaction/:transactionId" , getRunTransaction);
router.get("/runs?page=1&limit=10" , listSandboxRuns);


export  default router;

