const ApiError = require('../errors/ApiError')
module.exports = (req, res, next) => {
    try {
        if (req.query.start === undefined || req.query.length === undefined) {
            return next(ApiError.badRequest("please specify `start` and `length` in query"));
        }
        next();
    } catch (error) {
        return next(ApiError.internalServerError())
    }
};