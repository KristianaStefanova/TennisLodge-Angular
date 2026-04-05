function errorHandler(err, req, res, next) {
    if (err.status === 333) {
        res.status(333)
            .json({ message: 'ErrorHandler: not allowed!' })
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
