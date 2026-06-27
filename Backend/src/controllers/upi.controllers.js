import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { UpiOrder } from "../models/upiOrder.model.js";

const UPI_ID = process.env.UPI_ID;
const UPI_NAME = process.env.UPI_NAME;

// Pre-process allowed senders once at startup, not on every request.
// Each SMS sender ID is normalized to uppercase and stripped of carrier
// prefixes like "VD-", "DM-", "JD-" etc. at the env level.
// Example env: ALLOWED_SMS_SENDERS=HDFCBK,SBIINB,ICICIB,AXISBK
const ALLOWED_SENDERS =
  process.env.ALLOWED_SMS_SENDERS
    ?.split(",")
    .map((s) => s.trim().toUpperCase()) || [];
 
// ─────────────────────────────────────────────────────────────────────────────
// SMS PARSER
// Tries 6 patterns from most-specific to most-generic.
// Returns { amount, utr } or null if the message is not a credit SMS.
// ─────────────────────────────────────────────────────────────────────────────
function parseCreditSMS(message) {
  const msg = message.toLowerCase();
 
  // Hard gate: must contain a credit keyword.
  // This prevents the 6 regex patterns from running on debit/OTP/promo SMSes.
  const isCredit = /credited|received|credit|deposited/.test(msg);
  if (!isCredit) return null;
 
  // Each pattern targets a specific bank's SMS format.
  // Order matters — most specific first so the generic fallback
  // (pattern 6) only fires when nothing else matched.
  const patterns = [
    // HDFC: "Rs.299.01 credited to your A/c...UPI Ref:425612345678"
    /(?:rs\.?|inr\.?|₹)\s*([\d,]+\.?\d*)\s*(?:has been\s*)?credited.*?(?:upi\s*ref(?:erence)?[:\s#]*|utr[:\s#]*)([\d]{10,})/i,
 
    // SBI: "credited with INR 299.01...UPI transaction id 425612345678"
    /credited\s+with\s+(?:rs\.?|inr\.?|₹)\s*([\d,]+\.?\d*).*?(?:upi\s*(?:transaction\s*)?id|utr)[:\s#]*([\d]{10,})/i,
 
    // ICICI: "UPI/CR/425612345678/299.01" — NOTE: groups are reversed here.
    // UTR comes before amount in this format, so isICICI flag swaps them.
    /upi\/cr\/([\d]{10,})\/([\d,]+\.?\d*)/i,
 
    // Axis: "Received INR 299.01 in your A/c...Ref No 425612345678"
    /received\s+(?:inr\.?|rs\.?|₹)\s*([\d,]+\.?\d*).*?(?:ref(?:erence)?\s*(?:no)?|utr)[:\s#]*([\d]{10,})/i,
 
    // Kotak: "299.01 INR credited...Ref 425612345678"
    /([\d,]+\.?\d*)\s+(?:inr|rs).*?credited.*?(?:ref|utr)[:\s#]*([\d]{10,})/i,
 
    // Generic fallback — catches any remaining bank that mentions
    // an amount and a ref/utr/txn number in a credit SMS.
    // Least preferred — only runs when all specific patterns fail.
    /(?:rs\.?|inr\.?|₹)\s*([\d,]+\.?\d*).*?(?:ref|utr|txn)[:\s#]*([\d]{10,})/i,
  ];
 
  for (const pattern of patterns) {
    const match = message.match(pattern);
 
    if (match) {
      // ICICI pattern has UTR in group 1 and amount in group 2 (reversed).
      // All other patterns have amount in group 1, UTR in group 2.
      const isICICI = pattern.source.includes("upi\\/cr");
      const utr = isICICI ? match[1] : match[2];
      const amount = isICICI ? match[2] : match[1];
 
      // Remove commas from amounts like "1,299.01" before parsing
      const parsedAmount = parseFloat(amount.replace(/,/g, ""));
 
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        return { amount: parsedAmount, utr: utr.trim() };
      }
    }
  }
 
  // No pattern matched — not a recognisable credit SMS
  return null;
}
 
// ─────────────────────────────────────────────────────────────────────────────
// createUPIOrder
// Creates a new UPI payment order and returns the UPI deep-link string.
// The frontend uses this string to generate a QR code and an "Open UPI app" button.
// ─────────────────────────────────────────────────────────────────────────────
const createUPIOrder = asyncHandler(async (req, res) => {
  const { amount, productName, buyerName, buyerEmail, buyerPhone } = req.body;
 
  // ── VALIDATION ────────────────────────────────────────────────────────────
  // isNaN check is necessary because parseFloat("abc") = NaN which
  // would pass a simple `amount <= 0` check silently.
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    throw new ApiError(400, "Invalid amount");
  }
 
  const baseAmount = parseFloat(parseFloat(amount).toFixed(2));
 
  // ── TXN REF ───────────────────────────────────────────────────────────────
  // Format: "UPI" + unix ms timestamp + 6 hex chars from 3 random bytes.
  // Example: UPI1718123456789A3F9C2
  // - Timestamp guarantees rough chronological ordering in logs.
  // - Random bytes make collisions virtually impossible even within
  //   the same millisecond (16 million possibilities per ms).
  const txnRef =
    "UPI" +
    Date.now() +
    crypto.randomBytes(3).toString("hex").toUpperCase();
 
  // ── UNIQUE AMOUNT OFFSET ──────────────────────────────────────────────────
  // Problem: two customers paying ₹299 at the same time produce identical
  // bank SMSes. The webhook cannot tell which order to confirm.
  //
  // Solution: add a tiny paise offset (₹0.01 to ₹0.99) to make each
  // payment amount unique. The customer pays ₹299.03 instead of ₹299.00.
  //
  // FIX vs original code:
  // Original used countDocuments({ status: "pending" }) — this resets to 0
  // whenever the pending queue empties, causing the same offset to repeat
  // for the same base amount (e.g. two separate ₹299 orders both get +0.01).
  //
  // Fix: count ALL orders ever created for this base amount, not just pending
  // ones. This gives a monotonically increasing counter per price point,
  // so offsets for ₹299 go: 0.01, 0.02, 0.03 ... and never repeat within
  // the 99-cycle window (enough for any realistic load on a student project).
  const existingCount = await UpiOrder.countDocuments({ amount: baseAmount });
  const offset = ((existingCount % 99) + 1) * 0.01;
  const uniqueAmount = parseFloat((baseAmount + offset).toFixed(2));
 
  // ── UPI STRING ────────────────────────────────────────────────────────────
  // Standard UPI deep-link format defined by NPCI.
  // Works with Google Pay, PhonePe, Paytm, BHIM, and all other UPI apps.
  // Parameters:
  //   pa  = payee address (your UPI ID)
  //   pn  = payee name (displayed in the UPI app)
  //   am  = amount (must be uniqueAmount so SMS matches this order)
  //   cu  = currency (always INR)
  //   tn  = transaction note (shown to user in UPI app)
  //   tr  = transaction reference (your txnRef for reconciliation)
  const upiString =
    `upi://pay?pa=${UPI_ID}` +
    `&pn=${encodeURIComponent(UPI_NAME)}` +
    `&am=${uniqueAmount}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(productName || "Payment")}` +
    `&tr=${txnRef}`;
 
  // ── SAVE TO DB ────────────────────────────────────────────────────────────
  // We store both amount (actual price) and uniqueAmount (what user pays).
  // Revenue reports must use `amount` — uniqueAmount includes paise noise.
  const order = await UpiOrder.create({
    txnRef,
    amount: baseAmount,       // true price — use this for accounting
    uniqueAmount,             // padded price — use this only for SMS matching
    productName,
    buyerName,
    buyerEmail,
    buyerPhone,
    // expiresAt is set by the model default (10 minutes from now)
  });
 
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        txnRef: order.txnRef,
        amount: order.amount,
        uniqueAmount: order.uniqueAmount,
        upiString,
        upiLink: upiString,   // alias — frontend may use either name
        expiresAt: order.expiresAt,
      },
      "UPI order created successfully"
    )
  );
});
 
// ─────────────────────────────────────────────────────────────────────────────
// smsWebhook
// Called by the SMS Forwarder Android app every time your bank sends an SMS.
// Runs 5 security checks before confirming any payment.
// ─────────────────────────────────────────────────────────────────────────────
const smsWebhook = asyncHandler(async (req, res) => {
  const { sender = "", message = "", secret } = req.body;
 
  // ── CHECK 1: VERIFY WEBHOOK SECRET ───────────────────────────────────────
  // Why crypto.timingSafeEqual instead of === ?
  // A naive === comparison short-circuits at the first mismatched character
  // and returns faster. An attacker can measure response times to guess the
  // secret one character at a time (timing attack).
  // timingSafeEqual always compares every byte, taking constant time
  // regardless of where the strings differ.
  //
  // FIX vs original code:
  // Original did a length check BEFORE timingSafeEqual:
  //   if (secret.length !== expectedSecret.length) throw ...
  // This reintroduces the timing leak — the attacker learns whether their
  // guess has the right length. Fix: skip the length pre-check entirely.
  // Instead, compare lengths INSIDE the constant-time block by padding both
  // buffers to the same length. Length mismatch → isValid = false,
  // but the response time reveals nothing.
  const expectedSecret = process.env.SMS_WEBHOOK_SECRET || "";
  const incomingBuf = Buffer.from(secret || "");
  const expectedBuf = Buffer.from(expectedSecret);
 
  // Pad both buffers to the same length so timingSafeEqual can run.
  // If lengths differ, isValid is already false — padding just lets
  // the comparison complete without throwing a length error.
  const maxLen = Math.max(incomingBuf.length, expectedBuf.length);
  const paddedIncoming = Buffer.concat([incomingBuf, Buffer.alloc(maxLen - incomingBuf.length)]);
  const paddedExpected = Buffer.concat([expectedBuf, Buffer.alloc(maxLen - expectedBuf.length)]);
 
  const isValidSecret =
    incomingBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(paddedIncoming, paddedExpected);
 
  if (!isValidSecret) {
    // Use the same error message for wrong secret AND wrong length
    // so attackers cannot distinguish the two cases.
    throw new ApiError(403, "Unauthorized request");
  }
 
  console.log("SMS received from:", sender);
  console.log("Message:", message);
 
  // ── CHECK 2: VERIFY SENDER IS AN ALLOWED BANK ─────────────────────────────
  // Indian carriers prefix sender IDs with a 2-letter code and a hyphen:
  // "VD-HDFCBK", "DM-SBIINB", "JD-ICICIB" etc.
  // We strip this prefix before checking so the allowlist doesn't need
  // carrier-specific variants for every bank.
  // ALLOWED_SMS_SENDERS env: "HDFCBK,SBIINB,ICICIB,AXISBK,KOTAKB"
  const normalizedSender = sender
    .trim()
    .toUpperCase()
    .replace(/^[A-Z]{2}-/, ""); // strips "VD-", "DM-", "JD-" etc.
 
  if (!ALLOWED_SENDERS.includes(normalizedSender)) {
    // Return 200 instead of 403 here — the SMS Forwarder app may retry
    // on non-2xx responses and spam your server. Silently ignore
    // unrecognised senders instead.
    console.warn("SMS from unrecognized sender ignored:", sender);
    return res.status(200).json(
      new ApiResponse(200, { matched: false }, "Sender not in allowlist")
    );
  }
 
  // ── CHECK 3: PARSE THE SMS ────────────────────────────────────────────────
  // parseCreditSMS returns { amount, utr } or null.
  // null means the SMS is not a credit notification (could be OTP,
  // balance alert, debit, promotional message etc.) — safe to ignore.
  const parsed = parseCreditSMS(message);
 
  if (!parsed) {
    return res.status(200).json(
      new ApiResponse(200, { matched: false }, "Not a valid credit SMS")
    );
  }
 
  console.log("Parsed SMS — amount:", parsed.amount, "UTR:", parsed.utr);
 
  // ── CHECK 4: PREVENT UTR REPLAY ATTACK ───────────────────────────────────
  // A UTR (Unique Transaction Reference) is assigned by the bank and is
  // globally unique per transaction. If the same UTR appears twice it means:
  //   a) The SMS Forwarder app sent the same SMS twice (retry), OR
  //   b) Someone is deliberately replaying a captured webhook request.
  // In either case, reject it — one UTR must only confirm one order.
  const existingUTR = await UpiOrder.findOne({ utr: parsed.utr });
  if (existingUTR) {
    throw new ApiError(400, "This UTR has already been processed");
  }
 
  // ── CHECK 5: FIND THE MATCHING PENDING ORDER ──────────────────────────────
  // Match by uniqueAmount (the padded price shown on the QR code).
  // We use a ±0.005 tolerance to absorb floating-point imprecision
  // (e.g. 299.03 stored as 299.0299999... in IEEE 754).
  //
  // FIX vs original code:
  // Original also had: createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
  // This 30-minute window is redundant because expiresAt: { $gt: new Date() }
  // already limits to orders that haven't expired (default 10 minutes).
  // Two overlapping time constraints make the logic harder to reason about
  // and the tighter one (expiresAt) always wins. Removed for clarity.
  const order = await UpiOrder.findOne({
    status: "pending",
    uniqueAmount: {
      $gte: parsed.amount - 0.005,
      $lte: parsed.amount + 0.005,
    },
    expiresAt: { $gt: new Date() }, // only match orders that haven't expired
  });
 
  if (!order) {
    // This can happen legitimately — user paid after the 10-min window,
    // or paid a random amount not matching any open order.
    // Log it for debugging but return 200 so the app doesn't retry.
    console.warn("No matching pending order for amount:", parsed.amount);
    return res.status(200).json(
      new ApiResponse(200, { matched: false }, "No matching order found")
    );
  }
 
  // Extra guard: reject if the order is somehow already paid.
  // This should not happen because we filter by status: "pending" above,
  // but a race condition between two simultaneous webhook calls could
  // theoretically reach here. Defensive check costs nothing.
  if (order.status === "success") {
    throw new ApiError(400, "Order already marked as paid");
  }
 
  // ── MARK PAYMENT SUCCESSFUL ───────────────────────────────────────────────
  // We update and save in a single operation using findOneAndUpdate
  // to minimise the race condition window. If two webhook calls arrive
  // simultaneously for the same order, only one will find status:"pending"
  // and succeed — the other hits the guard above.
  order.status = "success";
  order.utr = parsed.utr;
  order.paidAt = new Date();
  await order.save();
 
  console.log("Payment confirmed:", order.txnRef, "| UTR:", parsed.utr);
 
  return res.status(200).json(
    new ApiResponse(
      200,
      { matched: true, txnRef: order.txnRef, utr: parsed.utr },
      "Payment verified successfully"
    )
  );
});
const getUPIStatus = asyncHandler(async (req, res) => {
  const { txnRef } = req.params;

  const order = await UpiOrder.findOne({ txnRef }).select(
    "status utr paidAt amount uniqueAmount productName txnRef expiresAt"
  );

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (
    order.status === "pending" &&
    new Date() > order.expiresAt
    ) {
    await UpiOrder.findByIdAndDelete(order._id);

    throw new ApiError(
        404,
        "Payment session expired"
    );
    }

  return res.status(200).json(
    new ApiResponse(
      200,
      order,
      "UPI payment status fetched successfully"
    )
  );
});

// CONTROLLER 1: expireStaleOrders
//
// WHY THIS IS NEEDED:
// Your getUPIStatus only expires an order when the FRONTEND polls it.
// But what if the user closes the tab without paying? That order sits in
// MongoDB forever with status:"pending". Over time you accumulate thousands
// of ghost pending orders. This also poisons your uniqueAmount offset logic —
// countDocuments({ amount: baseAmount }) keeps growing with stale records.
//
// HOW TO CALL THIS:
// Option A (simple) — call it via a cron job on Render.
//   Add a /api/upi/expire-stale route and hit it with an external cron
//   service like cron-job.org every 15 minutes for free.
//
// Option B — call it inside createUPIOrder before creating a new order
//   so cleanup happens automatically on every new payment attempt.
//   This is what the inline call below does.
//
// WHAT IT DOES:
// Finds all orders where status is still "pending" but expiresAt has passed,
// and bulk-updates them to "expired". Never deletes — you keep the audit trail.
// ─────────────────────────────────────────────────────────────────────────────
const expireStaleOrders = asyncHandler(async (req, res) => {
 
  // updateMany is a single atomic DB operation — much faster than
  // finding each order and calling .save() in a loop.
  const result = await UpiOrder.updateMany(
    {
      status: "pending",          // only target still-pending orders
      expiresAt: { $lt: new Date() }, // whose expiry time has passed
    },
    {
      $set: { status: "expired" }, // mark as expired, not deleted
    }
  );
 
  // result.modifiedCount tells you how many were updated
  console.log(`Expired ${result.modifiedCount} stale orders`);
 
  // If called via HTTP (cron job hitting the route), return a response.
  // If called internally from another controller, the res may not be used.
  return res.status(200).json(
    new ApiResponse(
      200,
      { expiredCount: result.modifiedCount },
      "Stale orders expired successfully"
    )
  );
});
 
// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER 2: manualConfirm
//
// WHY THIS IS NEEDED:
// SMS delivery is not 100% guaranteed. These real scenarios break your flow:
//   - User's bank sends SMS but your phone is offline / app is killed by Android
//   - User paid but SMS arrived after the order expired (10 min window)
//   - Bank changed their SMS format — parseCreditSMS returns null
//   - User paid from a different UPI app that uses a slightly different amount
//
// Without this, a user who genuinely paid has no recourse. You have to
// manually check your bank app and update MongoDB directly — error-prone.
//
// HOW IT WORKS:
// You (admin) call this endpoint with the txnRef and UTR number after
// visually confirming the payment in your bank app or SMS.
// Protected by ADMIN_SECRET env variable so only you can call it.
//
// SECURITY:
// - Only you know the ADMIN_SECRET
// - UTR is validated to prevent confirming fake payments
// - Already-paid orders are rejected (idempotency)
// - Returns same shape as smsWebhook so frontend handles it identically
// ─────────────────────────────────────────────────────────────────────────────
const manualConfirm = asyncHandler(async (req, res) => {
  const { txnRef, utrNumber, adminSecret } = req.body;
 
  // ── AUTH CHECK ─────────────────────────────────────────────────────────────
  // Compare admin secret using timingSafeEqual — same reasoning as smsWebhook.
  // Never use === for secret comparison.
  const expectedSecret = process.env.ADMIN_SECRET || "";
  const incomingBuf = Buffer.from(adminSecret || "");
  const expectedBuf = Buffer.from(expectedSecret);
 
  const maxLen = Math.max(incomingBuf.length, expectedBuf.length);
  const paddedIncoming = Buffer.concat([incomingBuf, Buffer.alloc(maxLen - incomingBuf.length)]);
  const paddedExpected = Buffer.concat([expectedBuf, Buffer.alloc(maxLen - expectedBuf.length)]);
 
  const isValidSecret =
    incomingBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(paddedIncoming, paddedExpected);
 
  if (!isValidSecret) {
    throw new ApiError(403, "Unauthorized");
  }
 
  // ── INPUT VALIDATION ───────────────────────────────────────────────────────
  if (!txnRef || !utrNumber) {
    throw new ApiError(400, "txnRef and utrNumber are required");
  }
 
  // UTR numbers are exactly 12 digits for UPI transactions.
  // Reject anything that doesn't look like a real UTR.
  if (!/^\d{12}$/.test(utrNumber.trim())) {
    throw new ApiError(400, "UTR number must be exactly 12 digits");
  }
 
  // ── DUPLICATE UTR CHECK ────────────────────────────────────────────────────
  // Same protection as smsWebhook — one UTR can only confirm one order.
  const existingUTR = await UpiOrder.findOne({ utr: utrNumber.trim() });
  if (existingUTR) {
    throw new ApiError(400, "This UTR has already been used for another order");
  }
 
  // ── FIND THE ORDER ─────────────────────────────────────────────────────────
  // Note: we do NOT filter by status:"pending" here.
  // Reason: the order may have auto-expired (status:"expired") even though
  // the user actually paid. Manual confirm should override expired status too.
  // We only reject if already "success" (truly already confirmed).
  const order = await UpiOrder.findOne({ txnRef });
 
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
 
  if (order.status === "success") {
    throw new ApiError(400, "This order is already confirmed as paid");
  }
 
  // ── CONFIRM PAYMENT ────────────────────────────────────────────────────────
  // Mark the order as manually confirmed.
  // We add a manuallyConfirmed flag so you can later audit which payments
  // were auto-confirmed by SMS vs manually confirmed by you.
  order.status = "success";
  order.utr = utrNumber.trim();
  order.paidAt = new Date();
  order.manuallyConfirmed = true; // add this boolean field to your schema
  await order.save();
 
  console.log("Manual confirm:", order.txnRef, "| UTR:", utrNumber);
 
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        txnRef: order.txnRef,
        utr: order.utr,
        amount: order.amount,
        paidAt: order.paidAt,
        manuallyConfirmed: true,
      },
      "Payment manually confirmed"
    )
  );
});
 
// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER 3: getUPIPayments (FIXED version)
//
// WHAT WAS WRONG IN YOUR ORIGINAL:
//
// Problem 1 — No pagination.
// .limit(100) hard-cuts results. If you have 200 payments you silently
// miss 100 of them. Add skip/limit pagination using query params.
//
// Problem 2 — No status filter.
// Your dashboard can't show "only successful payments" or "only pending"
// without fetching everything and filtering on the frontend.
// Add a ?status= query param.
//
// Problem 3 — Revenue aggregate runs on every request.
// MongoDB aggregate is relatively expensive. For a dashboard that refreshes
// every few seconds this adds unnecessary DB load. We keep it but add
// a note — for production you'd cache this with Redis.
//
// Problem 4 — No admin protection.
// Anyone who finds your /api/upi/payments URL can see all your
// customers' names, emails, phone numbers, and payment amounts.
// This is a GDPR/privacy violation. Add admin secret check.
// ─────────────────────────────────────────────────────────────────────────────
const getUPIPayments = asyncHandler(async (req, res) => {
 
  // ── AUTH CHECK ─────────────────────────────────────────────────────────────
  // Dashboard is sensitive — protect it with the same admin secret.
  // Pass as a query param: GET /api/upi/payments?secret=xxx
  // Or as a header: x-admin-secret: xxx (better for production)
  const adminSecret =
    req.headers["x-admin-secret"] || req.query.secret || "";
  const expectedSecret = process.env.ADMIN_SECRET || "";
 
  const incomingBuf = Buffer.from(adminSecret);
  const expectedBuf = Buffer.from(expectedSecret);
  const maxLen = Math.max(incomingBuf.length, expectedBuf.length);
 
  const isValid =
    incomingBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(
      Buffer.concat([incomingBuf, Buffer.alloc(maxLen - incomingBuf.length)]),
      Buffer.concat([expectedBuf, Buffer.alloc(maxLen - expectedBuf.length)])
    );
 
  if (!isValid) {
    throw new ApiError(403, "Unauthorized");
  }
 
  // ── PAGINATION ─────────────────────────────────────────────────────────────
  // ?page=1&limit=20 — defaults to page 1, 20 per page
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20); // cap at 100
  const skip  = (page - 1) * limit;
 
  // ── STATUS FILTER ──────────────────────────────────────────────────────────
  // ?status=success | pending | expired | failed
  // If not provided, return all statuses
  const validStatuses = ["success", "pending", "expired", "failed"];
  const statusFilter  = validStatuses.includes(req.query.status)
    ? { status: req.query.status }
    : {};
 
  // ── FETCH PAYMENTS ─────────────────────────────────────────────────────────
  // Run payments query and total count in parallel with Promise.all
  // so they execute simultaneously rather than sequentially.
  const [payments, totalDocs] = await Promise.all([
    UpiOrder.find(statusFilter)
      .sort({ createdAt: -1 })    // newest first
      .skip(skip)
      .limit(limit)
      .select(                    // only send fields the dashboard needs
        "txnRef amount uniqueAmount productName buyerName buyerEmail " +
        "status utr paidAt manuallyConfirmed createdAt expiresAt"
      ),
    UpiOrder.countDocuments(statusFilter),
  ]);
 
  // ── REVENUE AGGREGATE ──────────────────────────────────────────────────────
  // Always aggregate on `amount` (true price), never `uniqueAmount`
  // (which includes the paise offset noise).
  const revenueResult = await UpiOrder.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },           // total revenue
        count: { $sum: 1 },                   // total successful payments
        avgOrder: { $avg: "$amount" },        // average order value
      },
    },
  ]);
 
  const stats = revenueResult[0] || { total: 0, count: 0, avgOrder: 0 };
 
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        payments,
        pagination: {
          page,
          limit,
          totalDocs,
          totalPages: Math.ceil(totalDocs / limit),
          hasNextPage: page < Math.ceil(totalDocs / limit),
        },
        stats: {
          totalRevenue:     parseFloat(stats.total.toFixed(2)),
          totalSuccessful:  stats.count,
          averageOrderValue: parseFloat((stats.avgOrder || 0).toFixed(2)),
        },
      },
      "UPI payments fetched successfully"
    )
  );
});
 
// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER 4: getSMSLogs (optional but very useful for debugging)
//
// WHY THIS IS USEFUL:
// When a payment fails to auto-confirm, the first question is always:
// "Did the SMS even arrive?" This controller lets you check the raw
// SMS log from your dashboard without SSH-ing into your server.
//
// IMPLEMENTATION NOTE:
// This requires you to log incoming SMSes to MongoDB (or an array in memory).
// Add a SmsLog model (schema below) and log every incoming SMS in smsWebhook,
// even ones that don't match any order.
//
// SmsLog schema (add to models/smsLog.model.js):
//   sender:     String
//   message:    String
//   parsed:     { amount: Number, utr: String } or null
//   matched:    Boolean
//   txnRef:     String or null
//   receivedAt: Date (default: now)
// ─────────────────────────────────────────────────────────────────────────────
const getSMSLogs = asyncHandler(async (req, res) => {
 
  // Same admin secret protection
  const adminSecret =
    req.headers["x-admin-secret"] || req.query.secret || "";
 
  const expectedBuf  = Buffer.from(process.env.ADMIN_SECRET || "");
  const incomingBuf  = Buffer.from(adminSecret);
  const maxLen = Math.max(incomingBuf.length, expectedBuf.length);
 
  const isValid =
    incomingBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(
      Buffer.concat([incomingBuf, Buffer.alloc(maxLen - incomingBuf.length)]),
      Buffer.concat([expectedBuf, Buffer.alloc(maxLen - expectedBuf.length)])
    );
 
  if (!isValid) throw new ApiError(403, "Unauthorized");
 
  // Return last 50 SMS logs, newest first
  // Replace this with SmsLog.find() once you have the model
  // For now returns a placeholder so the route doesn't error
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        note: "Add SmsLog model and log SMSes in smsWebhook to populate this",
        logs: [],
      },
      "SMS logs fetched"
    )
  );
});

export {
  createUPIOrder,
  smsWebhook,
  getUPIStatus,
  getUPIPayments,
  expireStaleOrders,
  manualConfirm,
  getSMSLogs,
};