function errorHandler(err, req, res, next) {
    if (err.status === 333) {
        res.status(333)
            .json({ message: 'ErrorHandler: not allowed!' })
    } else if (err && err.name === 'ValidationError') {
        const fields = Object.values(err.errors || {})
            .map((validationError) => validationError && validationError.path)
            .filter(Boolean);
        const message = fields.length > 0
            ? `Validation error: missing or invalid field(s): ${fields.join(', ')}.`
            : 'Validation error: request contains invalid data.';

        res.status(400).json({ message });
    } else {
        console.error(err.stack)
        const payload = {
            message: 'ErrorHandler: Something went wrong!',
        };
        if (process.env.NODE_ENV !== 'production') {
            payload.detail = err.message;
            payload.name = err.name;
        }
        res.status(500).json(payload)
    }
}

module.exports = errorHandler;
