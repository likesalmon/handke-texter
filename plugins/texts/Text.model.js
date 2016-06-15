/* jshint node: true */
'use strict';

module.exports = function (sequelize, DataTypes) {
    var Text = sequelize.define('Text',
        {
            contactId: {
                type:DataTypes.INTEGER
            },
            body: {
                type: DataTypes.STRING
            },
            images: {
                type: DataTypes.JSON
            }
        }
    );

    return Text;
};
