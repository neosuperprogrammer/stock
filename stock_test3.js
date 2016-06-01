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

    function getStockInfo(option, loaded) {
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
                loaded = cheerio.load(utf8String);
                resolve(loaded);
            });
        });
    };

    function printStatus(loaded) {
        var list = loaded('tr >  td.st2');
        var up = 0,
            down = 0,
            same = 0;
        _.each(list, function (data) {
            var companyName = data.children[0].children[0].data;
            var companyCode = data.children[0].attribs.title;
            var currentValue = data.next.children[0].data;
            var offsetValue = data.next.next.children[0].children[0].data;
            //console.log(companyName);
            //console.log(offsetValue);
            if (offsetValue === undefined) {
                if (data.next.next.children[0].children[0].attribs.title == '상한') {
                    offsetValue = '▲' + data.next.next.children[0].children[1].data;

                }
                else if (data.next.next.children[0].children[0].attribs.title == '하한') {
                    offsetValue = '▼' + data.next.next.children[0].children[1].data;
                }
            }
            //offsetValue = offsetValue.toString();
            //if (!(offsetValue instanceof String)) {
            //    console.log('not a string : ' + offsetValue.constructor)
            //}
            //else {
            //    console.dir(typeof offsetValue);
            if (offsetValue.indexOf('▲') == 0) {
                up++;
            }
            else if (offsetValue.indexOf('▼') == 0) {
                down++;
            }
            else {
                same++;
            }
            //}
            //console.log(companyName + '(' + companyCode + ') : ' + currentValue + '(' + offsetValue + ')');
            //console.log(data);
        });
        var sum = up + down + same;
        console.log('count : ' + list.length + ', up : ' + up + ', down : ' + down + ', same : ' + same + ', sum : '
            + sum);
        return 0;
    }

    var kospiOptions = {
        encoding: null,
        method: "GET",
        uri: 'http://stock.mk.co.kr/newSt/rate/item_all.php?koskok=KOSPI&orderBy=dd'
    };

    //getStockInfo(requestOptions);

    var kosdaqOptions = {
        encoding: null,
        method: "GET",
        uri: 'http://stock.mk.co.kr/newSt/rate/item_all.php?koskok=KOSDAQ&orderBy=dd'
    };

    var kospiData = null,
        kosdaqData = null;


    getStockInfo(kospiOptions, kospiData)
        .then(function (loaded) {
            printStatus(loaded);
        })
        .then(function () {
            return getStockInfo(kosdaqOptions, kosdaqData);
        })
        .then(function (loaded) {
            printStatus(loaded);
        })
        .catch(function (err) {
            console.log(err);
        });
})();

