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
var mongoose = require('mongoose');

(function () {

    function waitFor(miliSeconds) {
        return new Promise(function (resolve, reject) {
            setTimeout(resolve, miliSeconds);
        });
    }

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
                //console.log(utf8String);
                var loaded = cheerio.load(utf8String);
                resolve(loaded);
            });
        });
    }

    function openDB(dbName) {
        return new Promise(function (resolve, reject) {
            mongoose.connect('mongodb://127.0.0.1:27017/' + dbName);
            var db = mongoose.connection;
            db.once('open', function callback() {
                //console.log('connected!');
                resolve(db);
            });

        });
    }

    function parseCompanyList(loaded) {
        var list = loaded('tr >  td.st2');
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
            currentValue = parseFloat(currentValue.replace(/,/g, ''));

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

    //function parseCompanyInfo(loaded) {
    //    var list = loaded('td > span#MData\\[62\\]lastTick\\[6\\]');
    //    var totalString = list[0].children[0].children[0].data;
    //    //console.log(totalString);
    //    var total = parseFloat(totalString.replace(/,/g, ''));
    //    //console.log(total);
    //    return total;
    //}

    function getMarketCapitalization(loaded) {
        var list = loaded('td > span#MData\\[62\\]lastTick\\[6\\]');
        var totalString = list[0].children[0].children[0].data;
        //console.log(totalString);
        var total = parseFloat(totalString.replace(/,/g, ''));
        total = total * 1000000;
        //console.log(total);
        return total;
    }

    function getListedShares(loaded) {
        var list = loaded('td > span#MData\\[62\\]');
        var totalString = list[0].children[0].children[0].data;
        //console.log(totalString);
        var total = parseFloat(totalString.replace(/,/g, ''));
        total = total * 1000;
        //console.log('total : ' + total);
        return total;
    }

    function getPER(loaded) {
        var list = loaded('td > span#PER\\/EPS');
        var perString = list[0].children[0].children[0].data;
        //console.log(totalString);
        var array = perString.split('/');
        console.log(array);
        //var total = parseFloat(totalString.replace(/,/g, ''));
        //total = total * 1000;
        //console.log('total : ' + total);
        var per = parseFloat(array[0]);
        if (isNaN(per)) {
            per = 0.0;
        }
        return per;
    }

    function checkCompanyInfo(companyInfo) {
        var calMarketCapitalization = companyInfo.current * companyInfo.ls;
        console.log('calc : ' + calMarketCapitalization
            + ', mc :' + companyInfo.mc);

    }

    function getCompanyInfos(companyList) {
        var subCompanyList = companyList.slice(0, 0 + 2);
        return Promise.all(subCompanyList).each(function (companyInfo) {
                var requestOption = {
                    encoding: null,
                    method: "GET",
                    uri: 'http://vip.mk.co.kr/newSt/price/price.php?stCode=005930&MSid=&msPortfolioID='
                };
                //var companyInfo = companyList[count];
                requestOption.uri = 'http://vip.mk.co.kr/newSt/price/price.php?stCode=' + companyInfo.code + '&MSid=&msPortfolioID=';
                //console.log('request');
                var contents = null;
                return getUrlContents(requestOption)
                    .then(function (loaded) {
                        contents = loaded;
                        return getMarketCapitalization(contents);
                    })
                    .then(function (mc) {
                        //companyList[count].total = total;
                        //console.log(' ) ' + companyInfo.name + ' : ' + total);
                        companyInfo.mc = mc;
                        return;
                        //return waitFor(100);
                    })
                    .then(function () {
                        return getListedShares(contents);
                    })
                    .then(function (ls) {
                        companyInfo.ls = ls;
                        return companyInfo;
                    })
                    .then(function () {
                        return getPER(contents);
                    })
                    .then(function (per) {
                        console.log('per : ' + per);
                        companyInfo.per = per;
                        return companyInfo;
                    })
                    .then(function (companyInfo) {
                        checkCompanyInfo(companyInfo);
                        return waitFor(100);
                    });
                //.then(function () {
                //    //return ++count;
                //});
            })
            .then(function () {
                //console.log('all done');
                //console.log(subCompanyList);
                return subCompanyList;
                //resolve(companyList);
            });
    }

    function saveCompanyInfos(dbConnection, companyList) {
        return Promise.all(companyList).each(function (companyInfo) {

                return new Promise(function (resolve, reject) {
                    var company = new CompanyModel({
                        name: companyInfo.name,
                        code: companyInfo.code,
                        current: companyInfo.current,
                        offset: companyInfo.offset,
                        mc: companyInfo.mc,
                        ls: companyInfo.ls
                    })
                    company.print();
                    company.save(function (err) {
                        resolve();
                    });
                });
            })
            .then(function () {
                //console.log('all done');
                return dbConnection;
            });
    }

    function getCompanyList(requestOption) {
        return getUrlContents(requestOption)
            .then(function (loaded) {
                return parseCompanyList(loaded);
            })
            .then(function (companyList) {
                return getCompanyInfos(companyList);
            });
    }

    function getKospiCompanyList() {
        var requestOption = {
            encoding: null,
            method: "GET",
            uri: 'http://stock.mk.co.kr/newSt/rate/item_all.php?koskok=KOSPI&orderBy=dd'
        };

        console.log('>>> kospi');

        return getCompanyList(requestOption);
    }

    function getKosdaqCompanyList() {
        var requestOption = {
            encoding: null,
            method: "GET",
            uri: 'http://stock.mk.co.kr/newSt/rate/item_all.php?koskok=KOSDAQ&orderBy=dd'
        };

        console.log('>>> kosdaq');

        return getCompanyList(requestOption);
    }

    function saveCompanyInfo(dbName, companyList) {
        return openDB(dbName)
            .then(function (dbConnection) {
                return saveCompanyInfos(dbConnection, companyList);
            })
            .then(function (dbConnection) {
                //console.log('db connection : ' + dbConnection);
                return dbConnection.close();
            });
    }


    function saveKospiCompanyInfo(companyList) {
        //console.log(companyList);
        return saveCompanyInfo('kospi', companyList);
    }

    function saveKosdaqCompanyInfo(companyList) {
        return saveCompanyInfo('kosdaq', companyList);
    }

    var CompanyModel;

    function dropCollection(dbConnection, collectionName) {
        return new Promise(function (resolve, reject) {
            dbConnection.collection(collectionName)
                .drop(function () {
                    resolve(dbConnection);
                });
        });
    }

    function initialize() {
        var companySchema = new mongoose.Schema({
            name: 'string',
            code: 'string',
            current: 'string',
            offset: 'string',
            mc: 'string',
            ls: 'string'
        });
        companySchema.methods.print = function () {
            console.log(this.name, '(', this.code, ') ', this.current, '(', this.offset,
                ')\n - Market Capitalization : ', this.mc,
                ')\n - Listed Shares : ', this.ls);
        };
        CompanyModel = mongoose.model('Company', companySchema);

        return openDB('kospi')
            .then(function (dbConnection) {
                return dropCollection(dbConnection, 'companies');
            })
            .then(function (dbConnection) {
                return dbConnection.close();
            })
            .then(function () {
                return openDB('kosdaq');
            })
            .then(function (dbConnection) {
                return dropCollection(dbConnection, 'companies');
            })
            .then(function (dbConnection) {
                return dbConnection.close();
            });
    }

    initialize()
        .then(getKospiCompanyList)
        .then(saveKospiCompanyInfo)
        .then(getKosdaqCompanyList)
        .then(saveKosdaqCompanyInfo)
        .catch(function (err) {
            console.log(err);
        });
})();

