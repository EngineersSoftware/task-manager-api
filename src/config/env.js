require('dotenv').config();

const required = ['MONGO_URI', 'JWT_SECRET'];

const missing = required.filter(
    (key) => !process.env[key] && !(process.env.NODE_ENV === 'test')
);

if (missing.length > 0){
    console.error(`Faltan variables de entorno: ${missing.join(', ')}`);
    process.exit(1);
}

module.exports = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET || 'secreto_solo_para_test',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d'
}