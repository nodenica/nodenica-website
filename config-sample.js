module.exports = {
    // port to load web site
    port: 1234,

    // language
    lang: 'es-ni',

    // secure salt
    secure: {
        password: {
            hash: ''
        }
    },

    // Template
    template: 'default',

    // expressjs settings
    express: {
        // use on express.session
        secret: '',
        key: ''

    },

    mongodb: {
        url: '',
        db: ''
    },

    smtp: {
        user: '',
        password: '',
        host: 'smtp.gmail.com',
        ssl: true
    },

    twitter:{
        hashtag: "",
        twit: {
            consumer_key: '',
            consumer_secret: '',
            access_token: '',
            access_token_secret: ''
        }
    }

};