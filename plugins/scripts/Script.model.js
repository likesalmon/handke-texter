'use strict';

module.exports = function (sequelize, DataTypes) {
    var Script = sequelize.define('Script',
        {
            title: {
                type: DataTypes.STRING
            },
            content: {
                type: DataTypes.STRING
            }
        }
    );

    return Script;
};
