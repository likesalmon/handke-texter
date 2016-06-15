'use strict';

var config = require('../../config.json');

module.exports = function (sequelize, DataTypes) {
    var Contact = sequelize.define('Contact',
        {
            name: {
                type: DataTypes.STRING
            },
            group: {
                type: DataTypes.STRING
            },
            phone: {
                type: DataTypes.STRING
            }
        },
        {
            hooks: {
                beforeCreate: function (contact, options) {
                    // If a group is not set, assign a random one
                    if (!contact.get('group')) {
                        contact.set('group',
                            config.groups[Math.floor(Math.random() * 3)]);
                    }
                }
            }
        }
    );

    return Contact;
};
