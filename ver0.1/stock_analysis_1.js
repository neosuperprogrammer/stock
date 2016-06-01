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
var stock_request = require('./stock_request');
var common = require('./stock_common');
var db = require('./stock_db');

(function () {

    function getCurrentPrice(loaded) {
        var list = loaded('td > span#lastTick\\[6\\]');
        var currentString = list[0].children[0].children[0].data;
        //console.log(totalString);
        var current = parseFloat(currentString.replace(/,/g, ''));
        return current;
    }

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
        //console.log(array);
        //var total = parseFloat(totalString.replace(/,/g, ''));
        //total = total * 1000;
        //console.log('total : ' + total);
        var per = parseFloat(array[0]);
        if (isNaN(per)) {
            per = 0.0;
        }
        return per;
    }

    function getEPS(loaded) {
        var list = loaded('td > span#PER\\/EPS');
        var perString = list[0].children[0].children[0].data;
        //console.log(totalString);
        var array = perString.split('/');
        var eps = parseFloat(array[1].replace(/,/g, ''));
        if (isNaN(eps)) {
            eps = 0;
        }
        return eps;
    }

    function checkCompanyInfo(companyInfo) {
        console.log('type : ' + companyInfo.type + '\n'
            + 'name : ' + companyInfo.name + '\n'
            + 'code : ' + companyInfo.code + '\n'
            + 'current : ' + companyInfo.current + '\n'
            + 'offset : ' + companyInfo.offset + '\n'
            + 'ls : ' + companyInfo.ls + '\n'
            + 'mc : ' + companyInfo.mc + '\n'
            + 'eps : ' + companyInfo.eps + '\n'
            + 'per : ' + companyInfo.per + '\n'
        );
        //var calMarketCapitalization = companyInfo.current * companyInfo.ls;
        //console.log('calc : ' + calMarketCapitalization
        //    + ', mc :' + companyInfo.mc);
    }

    function getCompanyInfos(companyList) {
        var subCompanyList = companyList.slice(0, 0 + 2);
        return Promise.all(subCompanyList).each(function (companyInfo) {
                var requestOption = {
                    encoding: null,
                    method: "GET",
                    uri: 'http://vip.mk.co.kr/newSt/price/price.php?stCode=005930&MSid=&msPortfolioID='
                };

                requestOption.uri = 'http://vip.mk.co.kr/newSt/price/price.php?stCode=' + companyInfo.code + '&MSid=&msPortfolioID=';
                //console.log('request');
                var contents = null;
                return stock_request.getUrlContents(requestOption)
                    //return getUrlContents(requestOption)
                    .then(function (loaded) {
                        contents = loaded;
                        return getMarketCapitalization(contents);
                    })
                    .then(function (mc) {
                        //companyList[count].total = total;
                        //console.log(' ) ' + companyInfo.name + ' : ' + total);
                        companyInfo.mc = mc;
                        return companyInfo;
                        //return waitFor(100);
                    })
                    .then(function () {
                        return getCurrentPrice(contents);
                    })
                    .then(function (current) {
                        companyInfo.current = current;
                        return companyInfo;
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
                        //console.log('per : ' + per);
                        companyInfo.per = per;
                        return companyInfo;
                    })
                    .then(function () {
                        return getEPS(contents);
                    })
                    .then(function (eps) {
                        //console.log('eps : ' + eps);
                        companyInfo.eps = eps;
                        return companyInfo;
                    })
                    .then(function () {
                        checkCompanyInfo(companyInfo);
                        return common.waitFor(10);
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

    function updateCompanyInfos(companyList) {
        return Promise.all(companyList).each(function (companyInfo) {
                //console.log(companyInfo);
                return db.updateCompanyInfo(companyInfo);
            })
            .then(function () {
                return closeDB();
            });
    }

    function initialize() {
        return db.buildModel();
    }

    function getCompanyListFromDB(collection) {
        return db.openDB(collection)
            .then(function (dbConnection) {
                return db.getCompanyList();
            });
    }

    function getKospiList() {
        return getCompanyListFromDB('kospi');
    }

    function getKosdaqList() {
        return getCompanyListFromDB('kosdaq');
    }

    function closeDB() {
        return db.closeDB();
    }

    function getSomeCompany() {
        return db.openDB('kospi')
            .then(function (dbConnection) {
                return db.getSomeCompanyList();
            });
    }

    initialize()
        .then(getSomeCompany)
        .then(function(companies) {
            console.log('count : ' + companies.length);
            _.each(companies, function(company) {
               console.log(company.name + ' : per(' + company.per + ')');
            });
        })
        .then(closeDB)
        .catch(function (err) {
            console.log(err);
        });
})();

