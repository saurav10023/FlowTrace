import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import * as transactionService from "../services/transaction.service.js";

/* -------------------------------------------------------------------------- */
/* START TRANSACTION */
/* Anyone can run a flow                                                      */
/* POST /api/transactions/run                                                 */
/* -------------------------------------------------------------------------- */

const runTransaction = asyncHandler(async (req, res) => {
    const transaction = await transactionService.start({
        user: req.user || null,
        body: req.body,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                transaction,
                "Transaction started successfully"
            )
        );
});

/* -------------------------------------------------------------------------- */
/* GET ALL TRANSACTIONS                                                       */
/* GET /api/transactions                                                      */
/* -------------------------------------------------------------------------- */

const getTransactions = asyncHandler(async (req, res) => {
    const transactions = await transactionService.getAll({
        user: req.user || null,
        query: req.query,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                transactions,
                "Transactions fetched successfully"
            )
        );
});

/* -------------------------------------------------------------------------- */
/* GET TRANSACTION DETAILS                                                    */
/* GET /api/transactions/:transactionId                                       */
/* -------------------------------------------------------------------------- */

const getTransactionById = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    if (!transactionId)
        throw new ApiError(400, "Transaction id is required");

    const transaction = await transactionService.getById({
        transactionId,
        user: req.user || null,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                transaction,
                "Transaction fetched successfully"
            )
        );
});

/* -------------------------------------------------------------------------- */
/* RETRY TRANSACTION                                                          */
/* POST /api/transactions/:transactionId/retry                               */
/* -------------------------------------------------------------------------- */

const retryTransaction = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    if (!transactionId)
        throw new ApiError(400, "Transaction id is required");

    const transaction = await transactionService.retry({
        transactionId,
        user: req.user || null,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                transaction,
                "Transaction retried successfully"
            )
        );
});

/* -------------------------------------------------------------------------- */
/* CANCEL TRANSACTION                                                         */
/* POST /api/transactions/:transactionId/cancel                              */
/* -------------------------------------------------------------------------- */

const cancelTransaction = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    if (!transactionId)
        throw new ApiError(400, "Transaction id is required");

    const transaction = await transactionService.cancel({
        transactionId,
        user: req.user || null,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                transaction,
                "Transaction cancelled successfully"
            )
        );
});

export {
    runTransaction,
    getTransactions,
    getTransactionById,
    retryTransaction,
    cancelTransaction,
};