const generateRunId = () => {

    const timestamp =
        Date.now();

    const random =
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

    return `RUN-${timestamp}-${random}`;
};

const generateReceiptId = () => {

    const timestamp =
        Date.now();

    const random =
        Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();

    return `RCPT-${timestamp}-${random}`;
};

export {

    generateRunId,

    generateReceiptId,
};