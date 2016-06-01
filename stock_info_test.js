/**
 * Created by neox on 2/22/16.
 */

var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var Iconv = require('iconv').Iconv;
var detectCharacterEncoding = require('detect-character-encoding');

(function () {

    function getStockInfo(option) {
        return new Promise(function (resolve, reject) {
            request(option, function (error, response, body) {
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
    };

    function printStatus(loaded) {
        var list = loaded('td > span#MData\\[62\\]lastTick\\[6\\]');
        var totalString = list[0].children[0].children[0].data;
        console.log(totalString);
        var total = parseFloat(totalString.replace(/,/g, ''));
        console.log(total);
        return 0;
    }

    var samsungInfo = {
        encoding: null,
        method: "GET",
        uri: 'http://vip.mk.co.kr/newSt/price/price.php?stCode=005930&MSid=&msPortfolioID='
    };

    //getStockInfo(requestOptions);

    //getStockInfo(samsungInfo)
    //    .then(function (loaded) {
    //        printStatus(loaded);
    //    })
    //    .catch(function (err) {
    //        console.log(err);
    //    });

    function waitFor(miliSeconds) {
        return new Promise(function (resolve, reject) {
            setTimeout(resolve, miliSeconds);
        });
    }
    console.log('start');

    waitFor(1000)
        .then(function () {
            console.log('1 seconds');
            return waitFor(1000);
        })
        .then(function () {
            console.log('2 seconds');
        });


})();

