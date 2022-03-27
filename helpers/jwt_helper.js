const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const client = require('./init_redis');




module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const options = {
                expiresIn: '1h',
                issuer: 'alihassan.com',
                // subject: userId,
                audience: `${userId}`,
            };
            JWT.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, options, (err, token) => {
                if (err) {
                    console.log(err.message);
                    return reject(createError.InternalServerError());
                }
                resolve(token);
            });
        });
    }
    ,
    verifyAccessToken: (req, res, next) => {
        if (!req.headers.authorization) {
            return next(createError.Unauthorized());
        }
        const token = req.headers.authorization.split(' ')[1];
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                const message = err.name === 'JsonWebTokenError' ? 'Invalid token' : err.message;
                return next(createError.Unauthorized(message));
            }
            req.userId = decoded.userId;
            next();
        });
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const options = {
                expiresIn: '1y',
                issuer: 'alihassan.com',
                // subject: userId,
                audience: `${userId}`,
            };
            JWT.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, options, (err, token) => {
                if (err) {
                    console.log(err.message);
                    return reject(createError.InternalServerError());
                }
                client.SET(userId, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
                    if (err) {
                        console.log(err.message);
                        reject(createError.InternalServerError());
                    }
                    resolve(token);
                });


                resolve(token);
            });
        });
    }
    ,
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    const message = err.name === 'JsonWebTokenError' ? 'Invalid token' : err.message;
                    return reject(createError.Unauthorized(message));
                }
                const userId = decoded.aud;
                client.GET(userId, (err, reply) => {
                    if (err) {
                        console.log(err.message);
                        reject(createError.InternalServerError());
                        return;
                    }
                    if (reply !== refreshToken) {
                        return reject(createError.Unauthorized());
                    }
                    resolve(userId);
                });
            });
        }
        )
    }
}