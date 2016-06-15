'use strict';
/* jshint node: true */


var Good = require('good');
var Hapi = require('hapi');
var server = new Hapi.Server();
var serverOptions = {
    host: 'localhost',
    port: 8000,
    routes: {
        cors: true
    }
};

server.connection(serverOptions);

if (process.env.NODE_ENV === 'production') {
    var io = require('socket.io')(server.listener, {
        path: '/api/socket.io'
    });
} else {
    var io = require('socket.io')(server.listener);
}

io.on('connection', function (socket) {
    socket.on('incoming', function (data) {
        socket.emit('incoming', data);
    });

    socket.emit('connection');
});

server.register(require('hapi-auth-cookie'), function (err) {
    if (err) throw err;

    server.auth.strategy('session', 'cookie', {
        password: '',
        cookie: 'sid-handke',
        isSecure: false
    });
});

server.register(
    [
        {
            register: Good,
            options: {
                reporters: [{
                    reporter: require('good-console'),
                    events: {
                        response: '*',
                        log: '*'
                    }
                }]
            }
        },

        {
            register: require('hapi-sequelized'),
            options: {
                host: serverOptions.host,
                port: '5432',
                database: 'handke',
                user: 'handke',
                pass: '',
                dialect: 'postgres',
                models: '**/*.model.js'
            }
        },

        {
            register: require('./plugins/auth')
        },

        {
            register: require('./plugins/scripts'),
            options: {
                auth: 'simple'
            }
        },

        {
            register: require('./plugins/contacts'),
            options: {
                io: io
            }
        },

        {
            register: require('./plugins/texts'),
            options: {
                io: io
            }
        },

        {
            register: require('./plugins/purge')
        }
    ], function (err) {
        if (err) throw err;

        server.plugins['hapi-sequelized'].db.sequelize.sync()
            .then(function () {
                server.start(function () {
                    server.log('info', 'Server running at: ' + server.info.uri);
                });
            });
    }
);
