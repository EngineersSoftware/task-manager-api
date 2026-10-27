const AppError = require('../utils/AppError');
const { nodeEnv } = require('../config/env');

const notFound = (req, res, next) => {
    next(new AppError(`Ruta no encontrada - ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    }

    if(err.name === 'CastError'){
        statusCode = 400;
        message = `ID invalido: ${err.value}`;
    }

    if(err.code === 11000){
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Ya existe un registro con este ${field}`;
    }

    if (err.name === 'JsonWebTokenError'){
        statusCode = 401;
        message = 'Token invalido';
    }

    if (err.name === 'TokenExpiredError'){
        statusCode = 401;
        message = 'Token expirado, inicie sesión nuevamente';
    }

    if ( statusCode === 500 && nodeEnv !== 'test') console.error(err);

    res.status(statusCode).json({
        success: false,
        message,
        ... (nodeEnv === 'development' && { stack: err.stack }),
    });

};

module.exports = {
    notFound,
    errorHandler,
};