import crypto from "crypto";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Validate Razorpay configuration
 */
const validateConfig = (config) => {

    const errors = [];

    if (!config.amount) {
        errors.push({
            field: "amount",
            message: "Amount is required",
        });
    }

    if (
        config.amount &&
        typeof config.amount !== "number"
    ) {
        errors.push({
            field: "amount",
            message: "Amount must be a number",
        });
    }

    if (
        config.currency &&
        config.currency !== "INR"
    ) {
        errors.push({
            field: "currency",
            message: "Only INR is supported",
        });
    }

    if (!config.receipt) {
        errors.push({
            field: "receipt",
            message: "Receipt is required",
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Create Razorpay Order
 */
const createOrder = async ({
    amount,
    currency = "INR",
    receipt,
    notes = {},
}) => {

    return await razorpay.orders.create({
        amount,
        currency,
        receipt,
        notes,
    });
};

/**
 * Fetch Order
 */
const getOrder = async (
    orderId
) => {

    return await razorpay.orders.fetch(
        orderId
    );
};

/**
 * Fetch Payment
 */
const getPayment = async (
    paymentId
) => {

    return await razorpay.payments.fetch(
        paymentId
    );
};

/**
 * Fetch Payments For Order
 */
const getOrderPayments = async (
    orderId
) => {

    return await razorpay.orders.fetchPayments(
        orderId
    );
};

/**
 * Create Checkout Payload
 */
const createCheckoutPayload = ({
    order,
    user,
}) => {

    return {

        key:
            process.env
                .RAZORPAY_KEY_ID,

        order_id:
            order.id,

        amount:
            order.amount,

        currency:
            order.currency,

        name:
            "PaymentLab",

        description:
            "Sandbox Payment",

        prefill: {
            name:
                user?.name || "",
            email:
                user?.email || "",
            contact:
                user?.phone || "",
        },

        theme: {
            color: "#3399cc",
        },
    };
};

/**
 * Verify Payment Signature
 */
const verifySignature = ({
    orderId,
    paymentId,
    signature,
}) => {

    const body =
        `${orderId}|${paymentId}`;

    const expectedSignature =
        crypto
            .createHmac(
                "sha256",
                process.env
                    .RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");

    return {

        valid:
            expectedSignature ===
            signature,

        expectedSignature,
    };
};

/**
 * Generate Sandbox Timeline
 */
const generateTimeline = ({
    order,
}) => {

    return [

        {
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
        },

        {
            event:
                "checkout_ready",

            label:
                "Checkout Ready",

            status:
                "pending",
        },

        {
            event:
                "payment_success",

            label:
                "Payment Successful",

            status:
                "pending",
        },

        {
            event:
                "signature_verification",

            label:
                "Signature Verification",

            status:
                "pending",
        },
    ];
};

/**
 * Example Webhook Payload
 */
const generateWebhookExample = ({
    paymentId,
    orderId,
    amount,
}) => {

    return {

        event:
            "payment.captured",

        payload: {

            payment: {

                entity: {

                    id:
                        paymentId,

                    order_id:
                        orderId,

                    amount,

                    status:
                        "captured",
                },
            },
        },
    };
};

export {

    validateConfig,

    createOrder,

    getOrder,

    getPayment,

    getOrderPayments,

    createCheckoutPayload,

    verifySignature,

    generateTimeline,

    generateWebhookExample,
};