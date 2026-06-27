// services/sandbox/razorpaySandbox.js

import SandboxRun
from "../../../models/sandbox.model.js";

import Transaction
from "../../../models/transaction.model.js";

import {
    generateRunId,
} from "../../utils/generateIds.js";

import {
    validateRazorpayConfig,
} from "./validationService.js";

import {
    createOrder,
    createCheckoutPayload,
    getPayment,
    verifySignature,
} from "../razorpay.service.js";

/**
 * Start Razorpay Sandbox
 */
const runRazorpayTransaction = async ({
    config,
    user,
}) => {

    const runId =
        generateRunId();

    const validation =
        validateRazorpayConfig(
            config
        );

    const sandboxRun =
        await SandboxRun.create({
            runId,
            method: "razorpay",
            config,
            validation,
            status: "running",
            timeline: [],
        });

    if (!validation.valid) {

        return {
            success: false,
            runId,
            errors:
                validation.errors,
        };
    }

    const transaction =
        await Transaction.create({
            runId,
            method: "razorpay",
            status: "created",
            amount: config.amount,
        });

    const order =
        await createOrder({
            amount:
                config.amount,

            currency:
                config.currency,

            receipt:
                config.receipt,
        });

    await addTimelineEvent({
        runId,
        event:
            "order_created",
        label:
            "Order Created",
        status:
            "success",
        data: {
            orderId:
                order.id,
        },
    });

    const checkout =
        createCheckoutPayload({
            order,
            user,
        });

    await addTimelineEvent({
        runId,
        event:
            "checkout_ready",
        label:
            "Checkout Ready",
        status:
            "success",
    });

    return {

        success: true,

        runId,

        transactionId:
            transaction._id,

        order,

        checkout,

        timeline:
            [
                {
                    event:
                        "order_created",
                    status:
                        "success",
                },
                {
                    event:
                        "checkout_ready",
                    status:
                        "success",
                },
            ],
    };
};

/**
 * Verify Razorpay Payment
 */
const verifyRazorpayPayment =
async ({
    runId,
    transactionId,
    orderId,
    paymentId,
    signature,
}) => {

    const verification =
        verifySignature({
            orderId,
            paymentId,
            signature,
        });

    if (!verification.valid) {

        await addTimelineEvent({
            runId,
            event:
                "signature_verification",
            label:
                "Signature Verification Failed",
            status:
                "failed",
        });

        throw new Error(
            "Invalid Signature"
        );
    }

    const payment =
        await getPayment(
            paymentId
        );

    await Transaction
        .findByIdAndUpdate(
            transactionId,
            {
                status:
                    "success",

                paymentId,

                orderId,
            },
            {
                new: true,
            }
        );

    await addTimelineEvent({
        runId,
        event:
            "payment_success",
        label:
            "Payment Successful",
        status:
            "success",
        data: {
            paymentId,
        },
    });

    await addTimelineEvent({
        runId,
        event:
            "signature_verified",
        label:
            "Signature Verified",
        status:
            "success",
        data: {
            paymentId,
        },
    });

    await SandboxRun
        .findOneAndUpdate(
            {
                runId,
            },
            {
                status:
                    "completed",
            }
        );

    return {

        verified:
            true,

        payment,
    };
};

/**
 * Handle Payment Failure
 */
const handlePaymentFailure =
async ({
    runId,
    transactionId,
    error,
}) => {

    await Transaction
        .findByIdAndUpdate(
            transactionId,
            {
                status:
                    "failed",

                failureReason:
                    error?.description ||
                    "Payment Failed",
            }
        );

    await addTimelineEvent({
        runId,
        event:
            "payment_failed",
        label:
            "Payment Failed",
        status:
            "failed",
        data: {
            reason:
                error?.description,
        },
    });

    await SandboxRun
        .findOneAndUpdate(
            {
                runId,
            },
            {
                status:
                    "failed",
            }
        );

    return {
        success: false,
    };
};

/**
 * Get Sandbox Run
 */
const getSandboxRunDetails =
async (runId) => {

    return await SandboxRun
        .findOne({
            runId,
        });
};

/**
 * Timeline Helper
 */
const addTimelineEvent =
async ({
    runId,
    event,
    label,
    status = "success",
    data = {},
}) => {

    const timelineEvent = {

        event,

        label,

        status,

        timestamp:
            new Date(),

        data,
    };

    return await SandboxRun
        .findOneAndUpdate(

            {
                runId,
            },

            {
                $push: {
                    timeline:
                        timelineEvent,
                },
            },

            {
                new: true,
            }
        );
};

export {

    runRazorpayTransaction,

    verifyRazorpayPayment,

    handlePaymentFailure,

    getSandboxRunDetails,

    addTimelineEvent,
};