module.exports = {
    // port to load web site
    port: 1234,

    // language
    lang: 'es-ni',

    // secure salt
    secure: {
        password:{
            hash: 'type hash here'
        }
    },

    // expressjs settings
    express: {
        // use on express.session
        secret: 'type hash here'

    },

    // mongodb settings
    mongodb: {
        url: 'mongodb://127.0.0.1/nodenica'
    },

    mailgun: {
        api: {
            key: 'type yout key',
            public: 'type your public key'
        }

    },

    email:{
        alert: {
            sender: 'Your site name <alerts@youtdomain.com>',
            receivers: ['Yout Name <yourname@email.com>']
        }
    },

    twitter:{
        hashtag: "#hashtag",
        twit: {
            consumer_key: '',
            consumer_secret: '',
            access_token: '',
            access_token_secret: ''
        }
    }

};