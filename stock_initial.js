/**
 * Created by neox on 2/22/16.
 */

var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var Iconv = require('iconv').Iconv;
var detectCharacterEncoding = require('detect-character-encoding');
var Promise = require('bluebird');

(function () {


    var promiseWhile = function (condition, action) {
        var resolver = Promise.defer();

        var loop = function () {
            if (!condition()) return resolver.resolve();
            return Promise.cast(action())
                .then(loop)
                .catch(resolver.reject);
        };

        process.nextTick(loop);

        return resolver.promise;
    };

    var promiseFor = Promise.method(function (condition, action, value) {
        if (!condition(value)) return value;
        return action(value).then(promiseFor.bind(null, condition, action));
    });

    function getUrlContents(requestOption) {
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
                // console.log(utf8String);
                var loaded = cheerio.load(utf8String);
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

    function parseCompanyList(loaded) {
        var list = loaded('tr >  td.st2');
        // console.log('list : ' + list);
        var up = 0,
            down = 0,
            same = 0;
        var companyList = [];
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

            var offset = offsetValue.replace('▲', '');
            offset = offset.replace('▼', '-');
            companyList.push({'name': companyName, 'code': companyCode, 'current': currentValue, 'offset': offset});
            //}
            //console.log(companyName + '(' + companyCode + ') : ' + currentValue + '(' + offsetValue + ')');
            //console.log(data);
        });
        var sum = up + down + same;
        console.log('count : ' + list.length + ', up : ' + up + ', down : ' + down + ', same : ' + same + ', sum : '
            + sum);
        return companyList;
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


    function parseCompanyInfo(loaded) {
        var list = loaded('td > span#MData\\[62\\]lastTick\\[6\\]');
        var totalString = list[0].children[0].children[0].data;
        // console.log(totalString);
        var total = parseFloat(totalString.replace(/,/g, ''));
        // console.log(total);
        return total;
    };

    function waitFor(miliSeconds) {
        return new Promise(function (resolve, reject) {
            setTimeout(resolve, miliSeconds);
        });
    }

    function getCompanyInfo(companyList) {
        return new Promise(function (resolve, reject){
            var requestOption = {
                encoding: null,
                method: "GET",
                uri: 'http://vip.mk.co.kr/newSt/price/price.php?stCode=005930&MSid=&msPortfolioID='
            };
            var sum = 0,
            stop = companyList.length;
                // stop = 3;

            promiseFor(function (count) {
                return count < stop;
            }, function (count) {
                var companyInfo = companyList[count];
                requestOption.uri = 'http://vip.mk.co.kr/newSt/price/price.php?stCode=' + companyInfo.code + '&MSid=&msPortfolioID=';
                // console.log('request');
                return getUrlContents(requestOption)
                //.then(function (loaded) {
                //    return ++count;
                //    //parseCompanyInfo(loaded);
                //});
                    .then(function (loaded) {
                        return parseCompanyInfo(loaded);
                    })
                    .then(function (total) {
                        //companyList[count].total = total;
                        companyInfo.total = total;
                        console.log('-');
                        return waitFor(100);
                    })
                    .then(function () {
                        return ++count;
                    });



            }, 0)
            //.then(console.log.bind(console, 'all done'));
                .then(function () {
                    console.log('all done');
                    resolve(companyList);
                });
        });

        //var requestOption = {
        //    encoding: null,
        //    method: "GET",
        //    uri: 'http://vip.mk.co.kr/newSt/price/price.php?stCode=005930&MSid=&msPortfolioID='
        //};
        //var sum = 0,
        ////stop = companyList.length;
        //    stop = 3;
        //
        //promiseFor(function (count) {
        //    return count < stop;
        //}, function (count) {
        //    var companyInfo = companyList[count];
        //    requestOption.uri = 'http://vip.mk.co.kr/newSt/price/price.php?stCode=' + companyInfo.code + '&MSid=&msPortfolioID=';
        //    console.log('request');
        //    return getUrlContents(requestOption)
        //    //.then(function (loaded) {
        //    //    return ++count;
        //    //    //parseCompanyInfo(loaded);
        //    //});
        //        .then(function (loaded) {
        //            parseCompanyInfo(loaded);
        //        })
        //        .then(function (total) {
        //            companyInfo.total = total;
        //            return ++count;
        //        });
        //
        //
        //    //return db.getUser(email)
        //    //    .then(function(res) {
        //    //        logger.log(res);
        //    //        return ++count;
        //    //    });
        //}, 0)
        ////.then(console.log.bind(console, 'all done'));
        //    .then(function () {
        //        console.log('all done');
        //        return companyList;
        //    });


        //var requestOption = {
        //    encoding: null,
        //    method: "GET",
        //    uri: 'http://vip.mk.co.kr/newSt/price/price.php?stCode=005930&MSid=&msPortfolioID='
        //};
        //var sum = 0,
        //    stop = companyList.length;
        //
        //promiseWhile(function() {
        //    // Condition for stopping
        //    return sum < stop;
        //}, function() {
        //    // Action to run, should return a promise
        //    return new Promise(function(resolve, reject) {
        //        // Arbitrary 250ms async method to simulate async process
        //        // In real usage it could just be a normal async event that
        //        // returns a Promise.
        //        //setTimeout(function() {
        //        //    sum++;
        //        //    // Print out the sum thus far to show progress
        //        //    console.log(sum);
        //        //    resolve();
        //        //}, 250);
        //        requestOption.uri = 'http://vip.mk.co.kr/newSt/price/price.php?stCode=' + companyInfo.code + '&MSid=&msPortfolioID=';
        //        console.log('request');
        //        return getUrlContents(requestOption)
        //            .then(function (loaded) {
        //                resolve();
        //                //parseCompanyInfo(loaded);
        //            })
        //            //.then(function (total) {
        //            //    companyInfo.total = total;
        //            //});
        //
        //
        //    });
        //}).then(function() {
        //    // Notice we can chain it because it's a Promise,
        //    // this will run after completion of the promiseWhile Promise!
        //    console.log("Done");
        //});


        //return new Promise(function(resolve, reject) {
        //    var requestOption = {
        //        encoding: null,
        //        method: "GET",
        //        uri: 'http://vip.mk.co.kr/newSt/price/price.php?stCode=005930&MSid=&msPortfolioID='
        //    };
        //
        //    var max = 0;
        //    _.each(companyList, function (companyInfo) {
        //        requestOption.uri = 'http://vip.mk.co.kr/newSt/price/price.php?stCode=' + companyInfo.code + '&MSid=&msPortfolioID=';
        //        console.log('request');
        //        getUrlContents(requestOption)
        //            .then(function (loaded) {
        //                parseCompanyInfo(loaded);
        //            })
        //            .then(function (total) {
        //                companyInfo.total = total;
        //            });
        //        max++;
        //        if(max > 3) {
        //            return companyList;
        //        }
        //    });
        //    return companyList;
        //});

    };

    getUrlContents(kospiOptions)
        .then(function (loaded) {
            return parseCompanyList(loaded);
            //printStatus(loaded);
        })
        .then(function (companyList) {
            // console.log(companyList);
            return getCompanyInfo(companyList);
        })
        .then(function (companyList) {
            console.log(companyList);
            //return getCompanyInfo(companyList);
        })
        //.then(function () {
        //    return getStockInfo(kosdaqOptions, kosdaqData);
        //})
        //.then(function (loaded) {
        //    printStatus(loaded);
        //})
        .
        catch(function (err) {
            console.log(err);
        });
})();

