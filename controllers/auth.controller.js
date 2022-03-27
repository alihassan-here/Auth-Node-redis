const createError = require('http-errors');
const User = require('../models/User.model');
const { authSchema } = require('../helpers/validation_schema');
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} = require('../helpers/jwt_helper');
const client = require('../helpers/init_redis');

module.exports = {
    register: async (req, res, next) => {
        try {
            // const { email, password } = req.body;
            // if (!email || !password) throw createError.BadRequest('email and password are required');

            const result = await authSchema.validateAsync(req.body);

            const doesExist = await User.findOne({ email: result.email });
            if (doesExist) throw createError.Conflict(`${result.email} already exists`);
            const user = new User(result);
            const savedUser = await user.save();
            const accessToken = await signAccessToken(savedUser._id);
            const refreshToken = await signRefreshToken(savedUser._id);
            res.json({
                message: 'user created successfully',
                token: accessToken,
                refreshToken
            });

        } catch (error) {
            if (error.isJoi) {
                error.status = 422;
            }
            next(error);
        }
    },
    login: async (req, res) => {
        try {
            const result = await authSchema.validateAsync(req.body);
            const user = await User.findOne({ email: result.email });
            if (!user) throw createError.NotFound('user not found');
            const isValid = await user.comparePassword(result.password);
            if (!isValid) throw createError.Unauthorized('Invalid username/password');
            const accessToken = await signAccessToken(user._id);
            const refreshToken = await signRefreshToken(user._id);

            res.json({
                message: 'user logged in successfully',
                token: accessToken,
                refreshToken
            });
        } catch (error) {
            if (error.isJoi) return next(createError.BadRequest("email and password are required"));
            next(error);
        }
    },
    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) throw createError.BadRequest('refresh token is required');
            const userId = await verifyRefreshToken(refreshToken);
            const accessToken = await signAccessToken(userId);
            const newRefreshToken = await signRefreshToken(userId);
            res.json({
                message: 'refresh token successfully',
                token: accessToken,
                refreshToken: newRefreshToken
            });
        } catch (error) {
            next(error);
        }
    },
    logout: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) throw createError.BadRequest();
            const userId = await verifyRefreshToken(refreshToken);
            client.DEL(userId, (err, reply) => {
                if (err) {
                    console.log(err.message);
                    throw createError.InternalServerError();
                }
                console.log(reply);
                res.status(201).json({
                    message: 'logout successfully'
                });
            });
        } catch (error) {
            next(error);
        }
    }
}