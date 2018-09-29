/**
 * Created by neox on 3/10/16.
 */

// naver 게시판에서 특정 게시자가 있는 종목 검색.

var _ = require('underscore');
var $ = require('cheerio');
var Promise = require('bluebird');
var stock_request = require('./stock_request');
var common = require('./stock_common');
var db = require('./stock_db');
var Items       = require("../model/items");

(function () {

    function getSpecificWriter(loaded, writers) {
        var found = 0;

        var tbody = loaded('table.type2 > tbody');
        if (tbody.length < 1) {
            return 0;
        }
        //console.log(tbody.children().length);

        var header = $(tbody.children().get(0));
        //console.log(header);
        for (var index = 0; index < header.children().length; index++) {
            //console.log($(header.children().get(index)).text());
            var text = $(header.children().get(index)).text();
            //console.log(text);
            if (text == '글쓴이') {
                break;
            }
        }

        //console.log(index);

        for (var i = 2; i < tbody.children().length; i++) {
            var tr = $(tbody.children().get(i));
            var td = $(tr.children().get(index));
            var writer = td.text().trim();
            writers.forEach(function (writerName) {
                if (writer == writerName) {
                    console.log('>>>>> found : ' + writerName + '\n');
                    found = 1;
                }
            });
            if (found === 1) {
                break;
            }
        }

        return found;
    }

    function parseAndSearchWriters(companyInfo, page, writers) {
        var requestOption = {
            encoding: null,
            method: "GET",
            uri: 'http://finance.naver.com/item/board.nhn?code=005490&page=1'
        };

        requestOption.uri = 'http://finance.naver.com/item/board.nhn?code='
            + companyInfo.code + '&page=' + page;

        //console.log(requestOption.uri);
        //console.log('chart : ' + 'http://finance.naver.com/item/fchart.nhn?code=' + companyInfo.code);

        var contents = null;

        var found = 0;

        return stock_request.getUrlContents(requestOption)
            //return getUrlContents(requestOption)
            .then(function (loaded) {
                contents = loaded;
                return getSpecificWriter(contents, writers);
            })
            .then(function (f) {
                //console.log('found : ' + f);
                found = f;
                return common.waitFor(100);
                //return found;
                //return waitFor(100);
            })
            .then(function() {
                return found;
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    function searchWriters(companyList) {
        var subCompanyList = companyList.slice(0, 0 + 10);
        // var subCompanyList = companyList.slice();

        var i = 0;
        var sequence = Promise.resolve();

        var foundedCompanies = [];
        //var writers = ['star****', 'jsak****'];
        var writers = ['jsak****'];

        subCompanyList.forEach(function (companyInfo) {
            var page = 1;
            sequence = sequence
                .then(function () {
                    var uri = 'http://finance.naver.com/item/board.nhn?code='
                        + companyInfo.code + '&page=' + page;
                    i++;
                    console.log(' ' + i + '/' + subCompanyList.length + ') ' + companyInfo.name + ' (' + uri + ')');
                    return parseAndSearchWriters(companyInfo, page, writers);
                })
                .then(function (found) {
                    if (found === 1) {
                        //var uri = 'http://finance.naver.com/item/board.nhn?code='
                        //    + companyInfo.code + '&page=' + page;

                        //console.log('found : ' + companyInfo.name);
                        //console.log(' ' + i + '/' + subCompanyList.length + ') ' + companyInfo.name + ' (' + uri + ')');
                        foundedCompanies.push(companyInfo);
                        return 0;
                    }
                    else {
                        page++;
                        return parseAndSearchWriters(companyInfo, page, writers);
                    }
                })
                //.then(function () {
                //    page++;
                //    return parseAndGetCompanyInfo(companyInfo, page);
                //})
                .then(function (found) {
                    if (found === 1) {
                        console.log('found : ' + companyInfo.name);
                        foundedCompanies.push(companyInfo);
                    }
                    else {
                        console.log('not found [' + writers + ']');
                    }
                    return common.waitFor(100);
                })
                .catch(function (error) {
                    console.log(error);
                });
        });

        return sequence
            .then(function () {
                return foundedCompanies;
            });
    }

    function updateCompanyInfos(companyList) {
        return Promise.all(companyList).each(function (companyInfo) {
                common.logCompany(companyInfo);
                //console.log(companyInfo);
                return db.updateCompanyInfo(companyInfo);
            })
            .then(function () {
                return closeDB();
            });
    }

    function initialize() {
        return new Promise(function (resolve, reject) {
            resolve();
        });

        // return db.buildModel();
    }

    function getCompanyListFromDB(type) {
        return new Promise(function (resolve, reject) {
            Items.findByType(type, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        // return db.openDB(collection)
        //     .then(function (dbConnection) {
        //         return db.getCompanyList();
        //     });
    }

    function getKospiList() {
        return getCompanyListFromDB('kospi');
    }

    function getKosdaqList() {
        return getCompanyListFromDB('kosdaq');
    }

    function closeDB() {
        console.log('close db');
        return db.closeDB();
    }

    initialize()
        .then(getKospiList)
        //.then(searchWriters)
        //.then(function(foundedCompanies) {
        //    foundedCompanies.forEach(function(companyInfo) {
        //        common.logCompany(companyInfo);
        //    });
        //})
        //.then(closeDB)
        // .then(getKosdaqList)
        .then(searchWriters)
        .then(function(foundedCompanies) {
            foundedCompanies.forEach(function(companyInfo) {
                common.logCompany(companyInfo);
            });
        })
        // .then(closeDB)
        .catch(function (err) {
            console.log(err);
        });
})();

