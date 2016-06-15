/* jshint node: true */
'use strict';

var config = require('../../config.json');
var GROUPS = config.groups;
var lastGroupIndex = 0;

/*
 * Returns the index of the next group in groups
 * @returns {Number} - the index of the next group
 */
var getNextGroupIndex = function (groups, lastGroupIndex) {
    var nextIndex;

    if (lastGroupIndex < groups.length - 1) {
        return lastGroupIndex++;
    } else {
        return 0;
    }
};

var getLastGroup = function (Contact, lastGroupIndex) {
    return Contact.findAll()
        .then(function (results) {
            var lastGroup = results.filter(function (result) {
                    return GROUPS.indexOf(result.group) > -1;
                })
                .map(function (result) {
                    return result.group;
                })
                .reduce(function (previous, current) {
                    return current;
                });

            return lastGroup;
        });
};

/**
 * contacts plugin
 */
exports.register = function (plugin, options, next) {
    var Contact = plugin.plugins['hapi-sequelized']
        .db.sequelize.models.Contact;

    plugin.expose(Contact);

    plugin.route([
        {
            path: '/api/contacts',
            method: 'GET',
            handler: function (req, reply) {
                Contact.findAll()
                    .then(function (results) {
                        reply(results);
                    });
            }
        },
        {
            path: '/api/contacts/{id}',
            method: 'GET',
            handler: function (req, reply) {
                Contact.findById(req.params.id)
                    .then(function (results) {
                        reply(results);
                    });
            }
        },
        {
            path: '/api/contacts',
            method: 'POST',
            handler: function (req, reply) {
                Contact.create(req.payload)
                    .then(function (results) {
                        options.io.emit('contact:new', results);
                        reply(results);
                    });
            }
        },
        {
            path: '/api/contacts/{id}',
            method: 'PUT',
            handler: function (req, reply) {
                Contact.findById(req.params.id)
                    .then(function (contact) {
                        if (contact) {
                            contact.update(req.payload, {
                                fields: ['name', 'phone', 'group']
                            })
                            .then(function (results) {
                                reply(results);
                            });
                        } else {
                            reply(404, {
                                error: true,
                                message: 'That contact could not be found'
                            });
                        }
                    });
            }
        },
        {
            path: '/api/contacts/{id}',
            method: 'DELETE',
            handler: function (req, reply) {
                Contact.findById(req.params.id)
                    .then(function (contact) {
                        return contact.destroy()
                            .then(function () {
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
        "name": "contacts",
        "version": "0.0.1",
        "description": "",
        "main": "index.js"
    }
};
