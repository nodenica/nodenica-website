module.exports = {
    /**
     * Port
     */
    port: process.env.PORT || 5000,

    /**
     * Language
     * https://www.npmjs.org/package/lingua
     */
    lang: 'es-ni',

    /**
     * Salt
     * http://en.wikipedia.org/wiki/Salt_(cryptography)
     */
    salt: process.env.SALT || '',

    /**
     * Template
     */
    template: 'default',

    /**
     * ExpressJS settings
     * http://expressjs.com/guide.html
     */
    express: {
        // use on express.session
        secret: process.env.SECRET || '',
        key: process.env.KEY || ''

    },

    /**
     * MongoDB Connection
     * https://www.mongohq.com/signup/
     */
    mongodb: {
        host: process.env.MONGODB_HOST || '',
        port: process.env.MONGODB_PORT || '',
        db: process.env.MONGODB_DATABASE || '',
        username: process.env.MONGODB_USERNAME || '',
        password: process.env.MONGODB_PASSWORD || ''
    },

    /**
     * SMTP emails
     * http://www.gmail.com
     */
    smtp: {
        user: process.env.SMTP_USERNAME || '',
        password: process.env.SMTP_PASSWORD || '',
        host: process.env.SMTP_HOST || '',
        tls: true
    },

    /**
     * Log
     * https://www.getsentry.com/register/
     */
    log: {
        url: process.env.LOG_URL || ''
    }
};
