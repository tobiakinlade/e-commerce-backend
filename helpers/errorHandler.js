function errorHandler(err, req, res, next) {
    // If a restful api request is made without a token, the message will be shown to the user
    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({message: "The user is not authorized"})
    }

    // Upload validation error
    if (err.name === 'ValidationError') {
        //  validation error
        return res.status(401).json({message: err})
    }

    // default to 500 server error (not classified error)
    return res.status(500).json(err);
}

module.exports = errorHandler;
