/**
 * Created by neox on 3/9/16.
 */

var _ = require('underscore');
var $ = require('cheerio');
var Promise = require('bluebird');
var stock_request = require('./stock_request');
var common = require('./stock_common');
var db = require('./stock_db');

(function () {

    function getVisibleHin (loaded) {
        //for (var i = 0; i < 10; i++) {
        //    var hin = '#Hin' + 0;
        //    if (loaded(hin).attr('style') != 'display:none;') {
        //        return hin;
        //    }
        //}
        //return '';

        return '#Hin1';
    }

    function getSalesMonth(loaded) {

        var hin = getVisibleHin(loaded);

        if (hin == '') {
            return 0;
        }

        var tbody = loaded(hin + ' > div > table.list_b1 > thead');
        if (tbody.length < 1) {
            return 0;
        }
        var tr = tbody.children().first();
        if (tr.length < 1) {
            return 0;
        }
        var td = tr.children().last();
        if (td.length < 1) {
            return 0;
        }

        var dateString = td[0].children[0].data;
        dateString = dateString.replace(/\./g, '-');


        var date = new Date(dateString);
        var month = date.getMonth() + 1;

        return month;
    }

    function getSalesCashFlow(loaded) {
        var month = getSalesMonth(loaded);
        if (month < 1) {
            return 0;
        }

        var hin = getVisibleHin(loaded);

        if (hin == '') {
            return 0;
        }

        var tbody = loaded(hin + ' > div > table.list_b1 > tbody');
        if (tbody.length < 1) {
            return 0;
        }
        var tr = tbody.children().first();
        if (tr.length < 1) {
            return 0;
        }
        var td = tr.children().last();
        if (td.length < 1) {
            return 0;
        }

        //console.log(td.find('font'));

        if (td.find('font').length > 0) {
            //if (td[0].children[0].children[0] !== undefined) {
            var scf = td[0].children[0].children[0].data;
        }
        else {
            scf = td[0].children[0].data;
        }

        //console.log(td.find('font'));
        scf = scf.trim();
        scf = common.getFloatValue(scf);

        if (month !== 12) {
            var ration = 4 * (3 / month);
            scf = scf * ration;
        }
        scf = Math.floor(scf);

        return scf;
    }

    //function getSalesCashFlow(loaded) {
    //
    //    var month = getSalesMonth(loaded);
    //    if (month < 1) {
    //        return 0;
    //    }
    //
    //    var tbody = loaded('#Hin1 > div > table.list_b1 > tbody');
    //    if (tbody.length < 1) {
    //        return 0;
    //    }
    //    var tr = tbody.children().first();
    //    if (tr.length < 1) {
    //        return 0;
    //    }
    //    var td = tr.children().last();
    //    if (td.length < 1) {
    //        return 0;
    //    }
    //
    //    if ($(td[0].children[0]).find('font').length > 0) {
    //    //if (td[0].children[0].children[0] !== undefined) {
    //        var scf = td[0].children[0].children[0].data;
    //    }
    //    else {
    //        scf = td[0].children[0].data;
    //    }
    //
    //    scf = scf.trim();
    //    scf = common.getFloatValue(scf);
    //
    //    if (month !== 12) {
    //        var ration = 4 * (3 / month);
    //        scf = scf * ration;
    //    }
    //    scf = Math.floor(scf);
    //
    //    return scf;
    //}

    function parseAndGetCompanyInfo(companyInfo) {
        var requestOption = {
            encoding: null,
            method: "GET",
            uri: 'http://media.kisline.com/fininfo/mainFininfo.nice?paper_stock=066575&nav=4'
        };

        requestOption.uri = 'http://media.kisline.com/fininfo/mainFininfo.nice?paper_stock='
            + companyInfo.code + '&nav=4';

        //console.log(requestOption.uri);
        //console.log('chart : ' + 'http://finance.naver.com/item/fchart.nhn?code=' + companyInfo.code);

        var contents = null;
        return stock_request.getUrlContents(requestOption)
            //return getUrlContents(requestOption)
            .then(function (loaded) {
                contents = loaded;
                return getSalesCashFlow(contents);
            })
            .then(function (scf) {
                //companyList[count].total = total;
                //console.log(' ) ' + companyInfo.name + ' : ' + total);
                //console.log(companyInfo.name);
                //console.log('scf : ' + scf);
                companyInfo.scf = scf;
                return companyInfo;
                //return waitFor(100);
            })
            .then(function (companyInfo) {
                common.logCompany(companyInfo);
                return common.waitFor(1000);
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    function getCompanyInfos(companyList) {
        //var subCompanyList = companyList.slice(0, 0 + 1);
        var subCompanyList = companyList.slice();

        var i = 0;
        var sequence = Promise.resolve();

        subCompanyList.forEach(function (companyInfo) {
            sequence = sequence
                .then(function () {
                    i++;
                    console.log('>>> ' + i + '/' + subCompanyList.length);
                    return parseAndGetCompanyInfo(companyInfo);
                })
        });

        return sequence
            .then(function () {
                return subCompanyList;
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

    initialize()
        .then(getKospiList)
        .then(getCompanyInfos)
        .then(updateCompanyInfos)
        .then(getKosdaqList)
        .then(getCompanyInfos)
        .then(updateCompanyInfos)
        .catch(function (err) {
            console.log(err);
        });
})();

