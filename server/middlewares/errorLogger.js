const pool = require('../config/database');

const errorLogger = async (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // prepare the data
    const logData = {
        endpoint: req.originalUrl,
        method: req.method,
        message: err.message,
        stack: err.stack,
        statusCode: statusCode,
        status: "new"
    }

    // Insert into MySQL
    try {
        (await pool).query(
            `INSERT INTO error_logs(endpoint, method, error_message, error_trace, status_code, status)
            VALUES(?, ?, ?, ?, ?, ?)`,
            [logData.endpoint, logData.method, logData.message, logData.stack, logData.statusCode, logData.status]
        );
    } catch (error) {
        console.error('failed to log into DB', error);
    }
    
    // close the connection
    // (await pool).end();

    // Send response to user
    res.status(statusCode).json({
        success: false,
        message: "Something went wrong on our end. Our engineers are notified"
    })
}

module.exports = errorLogger;