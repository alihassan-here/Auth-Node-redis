const express = require('express');
const app = express();
const morgan = require('morgan');
const createError = require('http-errors');
require('dotenv').config();
require('./helpers/init_mongodb');
const { verifyAccessToken } = require('./helpers/jwt_helper');
require('./helpers/init_redis');


//import routes
const authRoute = require('./routes/auth.route');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', verifyAccessToken, async (req, res, next) => {
    res.send('Hello World!');
});

app.use('/auth', authRoute);

app.use(async (req, res, next) => {
    // const error = new Error('Not Found');
    // error.status = 404;
    // next(error);
    /**
     * todo: we can use the http-errors package to create a custom error
     */
    // next(createError.NotFound());
    //*? or we can customise the error message
    next(createError(404, 'this route does not exist'));
});

app.use(async (error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}
);