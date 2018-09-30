/**
 * Created by neox on 2/29/16.
 */

var request = require('request');
var iconv = require('iconv-lite');
var Iconv = require('iconv').Iconv;
var detectCharacterEncoding = require('detect-character-encoding');
var cheerio = require('cheerio');
var Promise = require('bluebird');


module.exports = {

    version: '0.1',

    waitFor: function (miliSeconds) {
        return new Promise(function (resolve, reject) {
            setTimeout(resolve, miliSeconds);
        });
    },

    getUrlContents: function (requestOption) {
        return new Promise(function (resolve, reject) {
            request(requestOption, function (error, response, body) {
                if (error) {
                    reject(error);
                    return;
                }
                body = new Buffer(body, 'binary');
                var charsetMatch = detectCharacterEncoding(body);
                //console.log(charsetMatch);
                iconv2 = new Iconv(charsetMatch.encoding, 'UTF8');
                var utf8String = iconv2.convert(body).toString();
                //console.log(utf8String);
                var loaded = cheerio.load(utf8String);
                resolve(loaded);
            });
        });
    }
};