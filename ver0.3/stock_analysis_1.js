/**
 * Created by neox on 2/22/16.
 */

var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var stock_request = require('./stock_request');
var db = require('./stock_db');
var common = require('./stock_common');
var Items       = require("../model/items");

(function () {

    function initialize() {
        return new Promise(function (resolve, reject) {
            resolve();
        });

        // return db.buildModel();
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

    function getSomeCompanyFromKosdaq() {
        return db.openDB('kosdaq')
            .then(function (dbConnection) {
                return db.getSomeCompanyList();
            });
    }

    function getValueCompanyFromKospi() {
        return db.openDB('kospi')
            .then(function (dbConnection) {
                return db.getValueCompanyList();
            });
    }
     function getBaseClassList() {
        console.log('getBaseClassList');
        return new Promise(function (resolve) {
            var market = 500 * 100;
            _.CompanyModel
                .find({current: {$gt: 10000}, ls: {$gt: 10000}, pbr: {$gt: 0.1, $lt: 0.7}, mc: {$gt: market}})
                //.find({})
                .exec(function (err, companies) {
                    //console.log(err);
                    console.log('>>>base : ' + companies.length);
                    resolve(companies);
                });
        });
    }

    function getValueCompanyFromKospi2(companyList) {
        return new Promise(function (resolve, reject) {
            var subCompanyList = companyList.slice();
            var selectedCompanyList = [];
            subCompanyList.forEach(function (companyInfo) {
                //console.log('***' + companyInfo);
                var cashFlowPerStock = (companyInfo.scf / companyInfo.ls) * 1000 * 10;
                if (companyInfo.scf > 0 && cashFlowPerStock > companyInfo.current) {
                    //console.log('cash flow price : ' + cashFlowPerStock + ', current : ' + companyInfo.current);
                    if (companyInfo.debt < 200) {
                        if (!companyInfo.name.endsWith('우')) {
                            selectedCompanyList.push(companyInfo);
                        }
                    }
                }
                //if (companyInfo.name === 'POSCO') {
                //    selectedCompanyList.push(companyInfo);
                //}
            });
            console.log('>>>selected : ' + selectedCompanyList.length);
            resolve(selectedCompanyList);
        });



        // console.log('getWantedCompanyList');
        // return new Promise(function (resolve, reject) {
        //     var selectedCompanyList = [];
        //     getBaseClassList()
        //         .then(function (companyList) {
        //             companyList.forEach(function (companyInfo) {
        //                 //console.log('***' + companyInfo);
        //                 var cashFlowPerStock = (companyInfo.scf / companyInfo.ls) * 1000 * 10;
        //                 if (companyInfo.scf > 0 && cashFlowPerStock > companyInfo.current) {
        //                     //console.log('cash flow price : ' + cashFlowPerStock + ', current : ' + companyInfo.current);
        //                     if (companyInfo.debt < 200) {
        //                         if (!companyInfo.name.endsWith('우')) {
        //                             selectedCompanyList.push(companyInfo);
        //                         }
        //                     }
        //                 }
        //                 //if (companyInfo.name === 'POSCO') {
        //                 //    selectedCompanyList.push(companyInfo);
        //                 //}
        //             });
        //             console.log('>>>selected : ' + selectedCompanyList.length);
        //
        //             resolve(selectedCompanyList);
        //             //return selectedCompanyList;
        //         })
        //         .catch(function (error) {
        //             console.log(error);
        //             reject(error);
        //         });
        //
        // });


        // return db.openDB('kospi')
        //     .then(function (dbConnection) {
        //         return db.getValueCompanyList2();
        //     });
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
        // .then(function (dbConnection) {
        //   return db.getCompanyList();
        // });
    }

    function getKospiList() {
        return getCompanyListFromDB('kospi');
    }

    function getWantedCompanyFromKosdaq() {
        return db.openDB('kosdaq')
            .then(function (dbConnection) {
                return db.getWantedCompanyList();
            });
    }

    initialize()
        //.then(getValueCompanyFromKospi)
        //.then(function (companies) {
        //    console.log('kospi count : ' + companies.length);
        //    _.each(companies, function (companyInfo) {
        //        common.logCompany(companyInfo);
        //    });
        //})
        //.then(closeDB)
        .then(getKospiList)
        .then(getValueCompanyFromKospi2)
        .then(function (companies) {
            console.log('kospi count : ' + companies.length);
            _.each(companies, function (companyInfo) {
                common.logCompany(companyInfo);
            });
        })
        // .then(closeDB)
        //.then(getSomeCompany)
        //.then(function (companies) {
        //    console.log('kosdaq count : ' + companies.length);
        //    _.each(companies, function (companyInfo) {
        //        common.logCompany(companyInfo);
        //    });
        //})
        //.then(closeDB)
        .catch(function (err) {
            console.log(err);
        });
})();

