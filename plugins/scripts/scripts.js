/* jshint node: true */
'use strict';

/**
 * scripts plugin
 */
exports.register = function (plugin, options, next) {
    var Script = plugin.plugins['hapi-sequelized']
        .db.sequelize.models.Script;

    plugin.expose(Script);

    plugin.route([
        {
            path: '/api/scripts',
            method: 'GET',
            handler: function (req, reply) {
                Script.findAll()
                    .then(function (results) {
                        reply(results);
                    });
            }
        },
        {
            path: '/api/scripts/{id}',
            method: 'GET',
            handler: function (req, reply) {
                Script.findById(req.params.id)
                    .then(function (results) {
                        reply(results);
                    });
            }
        },
        {
            path: '/api/scripts',
            method: 'POST',
            handler: function (req, reply) {
                Script.create(req.payload)
                    .then(function (results) {
                        reply(results);
                    });
            }
        },
        {
            path: '/api/scripts/{id}',
            method: 'PUT',
            handler: function (req, reply) {
                Script.findById(req.params.id)
                    .then(function (script) {
                        if (script) {
                            script.update(req.payload, {
                                    fields: ['title', 'content']
                                })
                                .then(function (results) {
                                    reply(results);
                                });
                        } else {
                            reply(404, {
                                error: true,
                                message: 'That script could not be found'
                            });
                        }
                    });
            }
        },
        {
            path: '/api/scripts/{id}',
            method: 'DELETE',
            handler: function (req, reply) {
                Script.findById(req.params.id)
                    .then(function (script) {
                        return script.destroy()
                            .then(function (results) {
                                reply({});
                            });
                    });
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    pkg: {
        "name": "scripts",
        "version": "0.0.1",
        "description": "",
        "main": "index.js"
    }
};
