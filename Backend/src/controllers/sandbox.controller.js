import asyncHandler
from "../utils/asyncHandler.js";

import ApiError
from "../utils/ApiError.js";

import ApiResponse
from "../utils/ApiResponse.js";

import {
    runRazorpayTransaction,
    verifyRazorpayPayment,
    handlePaymentFailure,
    getSandboxRunDetails,
}
from "../services/integrations/razorpay/razorpaySandbox.service.js";

// import {
//     runUPITransaction,
// }
// from "../services/sandbox/upiSandbox.js";

// import {
//     runPhonePeTransaction,
// }
// from "../services/sandbox/phonepeSandbox.js";

import Transaction
from "../models/transaction.model.js";

import SandboxRun
from "../models/sandbox.model.js";



/**
 * Start Sandbox
 */
const runSandbox =
asyncHandler(async (
    req,
    res
) => {

    const {
        method,
        config,
    } = req.body;

    switch (method) {

        case "razorpay":

            return await runRazorpayTransaction(
                req,
                res,
                config
            );

        // case "upi":

        //     return await runUPITransaction(
        //         req,
        //         res,
        //         config
        //     );

        // case "phonepe":

        //     return await runPhonePeTransaction(
        //         req,
        //         res,
        //         config
        //     );

        default:

            throw new ApiError(
                400,
                "Unsupported payment method"
            );
    }
});



/**
 * Razorpay Success Verification
 */
const verifyRazorpayPaymentController =
asyncHandler(async (
    req,
    res
) => {

    const {

        runId,

        transactionId,

        orderId,

        paymentId,

        signature,

    } = req.body;

    const result =
        await verifyRazorpayPayment({

            runId,

            transactionId,

            orderId,

            paymentId,

            signature,
        });

    return res.status(200).json(

        new ApiResponse(

            200,

            result,

            "Payment verified successfully"
        )
    );
});



/**
 * Razorpay Failure
 */
const handleRazorpayFailureController =
asyncHandler(async (
    req,
    res
) => {

    const {

        runId,

        transactionId,

        error,

    } = req.body;

    const result =
        await handlePaymentFailure({

            runId,

            transactionId,

            error,
        });

    return res.status(200).json(

        new ApiResponse(

            200,

            result,

            "Payment failure recorded"
        )
    );
});



/**
 * Razorpay Cancel
 */
const handleRazorpayCancelController =
asyncHandler(async (
    req,
    res
) => {

    const {
        runId,
    } = req.body;

    const sandboxRun =
        await SandboxRun
            .findOneAndUpdate(

                {
                    runId,
                },

                {
                    status:
                        "cancelled",
                },

                {
                    new: true,
                }
            );

    if (!sandboxRun) {

        throw new ApiError(
            404,
            "Sandbox run not found"
        );
    }

    return res.status(200).json(

        new ApiResponse(

            200,

            sandboxRun,

            "Payment cancelled"
        )
    );
});



/**
 * Get Single Sandbox Run
 */
const getSandboxRun =
asyncHandler(async (
    req,
    res
) => {

    const {
        runId,
    } = req.params;

    const sandboxRun =
        await getSandboxRunDetails(
            runId
        );

    if (!sandboxRun) {

        throw new ApiError(
            404,
            "Sandbox run not found"
        );
    }

    return res.status(200).json(

        new ApiResponse(

            200,

            sandboxRun,

            "Sandbox run fetched"
        )
    );
});



/**
 * Get Transaction For Run
 */
const getRunTransaction =
asyncHandler(async (
    req,
    res
) => {

    const {
        transactionId,
    } = req.params;

    const transaction =
        await Transaction
            .findById(
                transactionId
            );

    if (!transaction) {

        throw new ApiError(
            404,
            "Transaction not found"
        );
    }

    return res.status(200).json(

        new ApiResponse(

            200,

            transaction,

            "Transaction fetched"
        )
    );
});



/**
 * List User Sandbox Runs
 */
const listSandboxRuns =
asyncHandler(async (
    req,
    res
) => {

    const page =
        Number(req.query.page) || 1;

    const limit =
        Number(req.query.limit) || 10;

    const skip =
        (page - 1) * limit;

    const runs =
        await SandboxRun
            .find({

                userId:
                    req.user._id,
            })
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit);

    const total =
        await SandboxRun.countDocuments({

            userId:
                req.user._id,
        });

    return res.status(200).json(

        new ApiResponse(

            200,

            {

                runs,

                page,

                limit,

                total,

                totalPages:
                    Math.ceil(
                        total / limit
                    ),
            },

            "Sandbox runs fetched"
        )
    );
});



export {

    runSandbox,

    verifyRazorpayPaymentController,

    handleRazorpayFailureController,

    handleRazorpayCancelController,

    getSandboxRun,

    getRunTransaction,

    listSandboxRuns,
};