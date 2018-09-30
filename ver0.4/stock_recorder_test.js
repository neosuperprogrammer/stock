/**
 * Created by neox on 3/14/16.
 */

var _ = require('underscore');
var $ = require('cheerio');
var Promise = require('bluebird');
var stock_request = require('./stock_request');
var common = require('./stock_common');
var db = require('./stock_db');
var stock_recorder = require('./stock_recorder');

(function () {


  function getCurrentPrice(loaded) {
    var list = loaded('td > span#lastTick\\[6\\]');
    var currentString = list[0].children[0].children[0].data;
    //console.log(totalString);
    var current = parseFloat(currentString.replace(/,/g, ''));
    return current;
  }

  function updateCurrentPrice(companyInfo) {
    var requestOption = {
      encoding: null,
      method: "GET",
      uri: 'http://vip.mk.co.kr/newSt/price/price.php?stCode=005930&MSid=&msPortfolioID='
    };

    requestOption.uri = 'http://vip.mk.co.kr/newSt/price/price.php?stCode=' + companyInfo.code + '&MSid=&msPortfolioID=';
    console.log(requestOption.uri);
    var contents = null;
    return stock_request.getUrlContents(requestOption)
      //return getUrlContents(requestOption)
      .then(function (loaded) {
        contents = loaded;
        return getCurrentPrice(contents);
      })
      .then(function (current) {
        console.log(companyInfo.name + ') update current : ' + companyInfo.current + ' -> ' + current);
        companyInfo.current = current;
        return companyInfo;
      })
      //.then(function () {
      //  common.logCompany(companyInfo);
      //  //return checkCompanyInfo(companyInfo);
      //  return common.waitFor(1000);
      //})
      .catch(function (err) {
        console.log(err);
      });
  }

  function updateCompanyInfos(companyList) {
    var sequence = Promise.resolve();

    companyList.forEach(function (companyInfo) {
      sequence = sequence
        .then(function () {
          return updateCurrentPrice(companyInfo);
        })
    });

    return sequence;
  }

  function recordSelectedCompany(companyList) {
    //var subCompanyList = companyList.slice(0, 0 + 1);
    //var subCompanyList = companyList.slice();

    //console.log(companyList);
    var date = new Date();
    var desc = '가치주';
    return stock_recorder.record(date, desc, companyList);
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
    console.log('close db');
    return db.closeDB();
  }

  var selectedCompany;

  initialize()
    .then(getKospiList)
    .then(function(companyList) {
      //console.log(companyList);
      selectedCompany = companyList.slice(0, 0 + 1);
    })
    .then(closeDB)
    .then(function() {
      return common.updateCompanyInfos(selectedCompany);
    })
    .then(function() {
      return recordSelectedCompany(selectedCompany);
    })
    //.then(function() {
    //  //console.log('end!!!');
    //})
    //.then(getKosdaqList)
    .catch(function (err) {
      console.log(err);
    });
})();

