/* jshint node: true */
'use strict';

var config = require('../../config.json');
var twilio = require('twilio')(config.sid, config.authToken);
var Promise = require('bluebird');

/**
 * Takes an incoming Twilio text and parses out the
 * images into an array of object.
 * @param {Object} incoming - a twilio incoming text request
 * @returns {Array}
 */
var getImages = function (incoming) {
    if (!parseInt(incoming.NumMedia)) return null;

    var images = [];

    // divide media into an array
    if (parseInt(incoming.NumMedia)) {
        for (var i = 0; i < parseInt(incoming.NumMedia); i++) {
            images.push({
                type: incoming['MediaContentType' + i],
                url: incoming['MediaUrl' + i]
            });
        }
    }

    return images;
};

exports.register = function (plugin, options, next) {
    var Text = plugin.plugins['hapi-sequelized']
        .db.sequelize.models.Text;
    var Contact = plugin.plugins['hapi-sequelized']
        .db.sequelize.models.Contact;
    var socket;

    plugin.expose(Text);

    // On connect, send out all the saved texts
    options.io.on('connection', function (data) {
        socket = data;
        Text.findAll({})
            .then(function (texts) {
                // texts need contact name and phone
                texts.forEach(function (results) {
                    var text = results.get({ plain: true });
                    Contact.findOne({
                            where: {
                                id: text.contactId
                            }
                        })
                        .then(function (contact) {
                            text.contact = {};
                            if (contact) {
                                text.contact.name = contact.get('name');
                                text.contact.phone = contact.get('phone');
                            } else {
                                text.contact.name = 'Handke';
                                text.contact.phone = config.phoneNumber;
                            }

                            socket.emit('incoming', text);
                        });
                });
            });
    });

    plugin.route([
        {
            method: 'GET',
            path: '/api/sms/incoming',
            handler: function (req, reply, server) {
                return Contact.findOne({
                        where: {
                            phone: req.query.From
                        }
                    })
                    .then(function (contact) {
                        // If the contact is found, save the text and
                        // forward it to the UI
                        if (contact) {
                            return Text.create({
                                    contactId: contact.get('id'),
                                    body: req.query.Body,
                                    images: getImages(req.query)
                                })
                                .then(function (results) {
                                    var text = results.get({ plain: true });
                                    text.contact = contact.get({ plain: true });
                                    options.io.emit('incoming', text);
                                });
                        } else {
                            // If no contact is found with that number,
                            // save a new contact
                            return Contact.create({
                                name: req.query.Body,
                                phone: req.query.From
                            })
                            .then(function (results) {
                                contact = results;
                                options.io.emit('contact:new', contact);
                                // Reply to the sender with welcome message
                                return twilio.sendMessage({
                                    to: contact.phone,
                                    from: config.phoneNumber,
                                    body: config.welcomeMessage
                                });
                            })
                            .then(function () {
                                return Text.create({
                                        contactId: contact.get('id'),
                                        body: req.query.Body,
                                        images: getImages(req.query)
                                    })
                                    .then(function (results) {
                                        var text = results
                                            .get({ plain: true });
                                        text.contact = contact
                                            .get({ plain: true });
                                        options.io.emit('incoming', text);
                                    });
                            });
                        }
                    })
                    .then(function () {
                        reply();
                    })
                    .catch(reply);
            }
        },

        {
            path: '/api/sms/send',
            method: 'POST',
            handler: function (req, reply) {
                var texts = req.payload.to.map(function (number) {
                    return twilio.sendMessage({
                        to: number,
                        from: config.phoneNumber,
                        body: req.payload.body
                    });
                });

                Promise.settle(texts)
                    .then(function (response) {
                        reply({ response: response });
                    })
                    .catch(reply);
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    pkg: {
        "name": "texts",
        "version": "0.0.1",
        "description": "",
        "main": "index.js"
    }
};
