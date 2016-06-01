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
        request(option, function (error, response, body) {
            body = new Buffer(body, 'binary');
            var charsetMatch = detectCharacterEncoding(body);
            //console.log(charsetMatch);
            iconv2 = new Iconv(charsetMatch.encoding, 'UTF8');
            var utf8String = iconv2.convert(body).toString();
            //console.log(utf8String);
            var $ = cheerio.load(utf8String);

            //var list = $('tr >  td.st2 > a');
            var list = $('tr >  td.st2');
            _.each(list, function (data) {
                var companyName = data.children[0].children[0].data;
                var companyCode = data.children[0].attribs.title;
                var currentValue = data.next.children[0].data;
                var offsetValue = data.next.next.children[0].children[0].data;
                console.log(companyName + '(' + companyCode + ') : ' + currentValue + '(' + offsetValue + ')');
                //console.log(data);
            });
            console.log('count : ' + list.length);
        });
    };

    //var requestOptions = {
    //    encoding: null,
    //    method: "GET",
    //    uri: 'http://stock.mk.co.kr/newSt/rate/item_all.php?koskok=KOSPI&orderBy=dd'
    //};
    //
    //getStockInfo(requestOptions);

    var requestOptions = {
        encoding: null,
        method: "GET",
        uri: 'http://stock.mk.co.kr/newSt/rate/item_all.php?koskok=KOSDAQ&orderBy=dd'
    };

    getStockInfo(requestOptions);
})();

