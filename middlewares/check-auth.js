const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const ApiError = require('../errors/ApiError')

dotenv.config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        req.user = jwt.verify(token, process.env.JWT_KEY);
        next();
    } catch (error) {
        return next(ApiError.unAuthorized("invalid auth token"))
    }
};
