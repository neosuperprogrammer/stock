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

(function () {

    function initialize() {
        return db.buildModel();
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

    function getValueCompanyFromKospi2() {
        return db.openDB('kospi')
            .then(function (dbConnection) {
                return db.getValueCompanyList2();
            });
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
        .then(getValueCompanyFromKospi2)
        .then(function (companies) {
            console.log('kospi count : ' + companies.length);
            _.each(companies, function (companyInfo) {
                common.logCompany(companyInfo);
            });
        })
        .then(closeDB)
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

