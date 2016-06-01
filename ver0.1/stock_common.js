/**
 * Created by neox on 2/29/16.
 */

var Promise = require('bluebird');

module.exports = {

    version: '0.1',

    waitFor: function (miliSeconds) {
        return new Promise(function (resolve, reject) {
            setTimeout(resolve, miliSeconds);
        });
    }
};