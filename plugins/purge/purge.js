'use strict';

/**
 * purge plugin
 */
exports.register = function (plugin, options, next) {
    var Contact = plugin.plugins['hapi-sequelized']
        .db.sequelize.models.Contact;
    var Script = plugin.plugins['hapi-sequelized']
        .db.sequelize.models.Script;
    var Text = plugin.plugins['hapi-sequelized']
        .db.sequelize.models.Text;

    plugin.route([
        {
            path: '/api/purge/{table}',
            method: 'DELETE',
            handler: function (req, reply) {
                var drop = {
                    contacts: Contact,
                    scripts: Script,
                    texts: Text
                };

                drop[req.params.table].sync({ force: true })
                    .then(function () {
                        reply({ message: 'Deleted ' + req.params.table });
                    })
                    .catch(reply);
            }
        }
    ]);

    next();
};

exports.register.attributes = {
    pkg: {
        "name": "purge",
        "version": "0.0.1",
        "description": "",
        "main": "index.js"
    }
};
