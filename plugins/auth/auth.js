'use strict';

var config = require('../../config.json');

exports.register = function (plugin, options, next) {
    plugin.route([
        {
            path: '/api/login',
            method: 'GET',
            config: {
                auth: 'session',
                handler: function (req, reply) {
                    console.error('*********', req.auth);
                    // Check auth status
                    reply({ isAuthenticated: req.auth.isAuthenticated });
                }
            }
        },

        {
            path: '/api/login',
            method: 'POST',
            config: {
                auth: {
                    mode: 'try',
                    strategy: 'session'
                },
                plugins: {
                    'hapi-auth-cookie': {
                        redirectTo: false
                    }
                },
                handler: function (req, reply) {
                    if (!req.payload.username ||
                        !req.payload.password) {
                        return reply({
                            message: 'Missing username or password',
                             error: true
                        });
                    }

                    if (req.payload.username === config.username &&
                        req.payload.password === config.password) {
                        req.auth.session.set({
                            username: config.username,
                            password: config.password
                        });
                        console.error("req.auth.isAuthenticated",
                            req.auth.isAuthenticated);
                        return reply({
                            message: 'Login successful',
                            error: false
                        });
                    } else {
                        reply({
                            message: 'Invalid username or password',
                            error: true
                        });
                    }
                }
            }
        },

        {
            path: '/api/login',
            method: 'DELETE',
            config: {
                auth: 'session',
                handler: function (req, reply) {
                    req.auth.session.clear();
                    reply({ message: 'Logged out' });
                }
            }
        },
    ]);

    next();
};

exports.register.attributes = {
    pkg: {
        name: 'authentication',
        description: '',
        main: 'index.js',
        author: 'Ammon Morris',
        license: 'MIT'
    }
};
