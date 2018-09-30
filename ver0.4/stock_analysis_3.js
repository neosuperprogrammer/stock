/**
 * Created by neox on 3/11/16.
 */

// 기관, 외국인 투자 정보를 이용해 회사 검색.

var _ = require('underscore');
var $ = require('cheerio');
var Promise = require('bluebird');
var stock_request = require('./stock_request');
var common = require('./stock_common');
var db = require('./stock_db');
var stock_recorder = require('./stock_recorder');

(function () {

  function searchForeignInvesticationCompany(companyList) {
    //var subCompanyList = companyList.slice(0, 0 + 1);
    var subCompanyList = companyList.slice();

    var sequence = Promise.resolve();

    var foundedCompanies = [];

    subCompanyList.forEach(function (companyInfo) {
      sequence = sequence
        .then(function () {
          return new Promise(function (resolve, reject) {
            //common.logCompany(companyInfo);
            //console.log(companyInfo.fi);
            var domestic = common.getDomesticInvestigation(companyInfo);
            var foreign = common.getForeignInvestigation(companyInfo);
            //console.log(companyInfo.name + ') ' + amount);
            if (foreign > 0 && foreign + domestic > 0) {
              //if (companyInfo.eps > 0 && companyInfo.eps * 10 > companyInfo.current
              //  && companyInfo.current > 4000 && companyInfo.pbr < 1.0) {
              //  foundedCompanies.push(companyInfo);
              //}
              if (companyInfo.eps > 0 && common.getInvestigationAmount(companyInfo) > 5000) {
                foundedCompanies.push(companyInfo);
              }
            }
            resolve(companyInfo);
          })
        })
        //.then(function (companyInfo) {
        //  return common.waitFor(10);
        //})
        .catch(function (error) {
          console.log(error);
        });
    });

    return sequence
      .then(function () {
        return foundedCompanies;
      });
  }

  function initialize() {
      return new Promise(function (resolve, reject) {
          resolve();
      });

      // return db.buildModel();
  }

  function getCompanyListFromDB(collection) {
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
    //   .then(function (dbConnection) {
    //     return db.getCompanyList();
    //   });
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

  //function getInvestigationRatio(companyInfo) {
  //  var domestic = getDomesticInvestigation(companyInfo);
  //  var foreign = getForeignInvestigation(companyInfo);
  //
  //  var sum = domestic + foreign;
  //  var ratio = sum / (companyInfo.ls * 1000);
  //  return ratio;
  //}

  function recordSelectedCompany(companyList) {
    //var subCompanyList = companyList.slice(0, 0 + 1);
    //var subCompanyList = companyList.slice();

    //console.log(companyList);
    var date = new Date();
    var desc = '가치주';
    return stock_recorder.record(date, desc, companyList);
  }

  var foundedCompanies;
  initialize()
    .then(getKospiList)
    //.then(getKosdaqList)
    .then(searchForeignInvesticationCompany)
    .then(function (companies) {

      //foundedCompanies.sort(function(a, b) {
      //  return common.getInvestigationRatio(b) - common.getInvestigationRatio(a);
      //});
      foundedCompanies = companies;
      foundedCompanies.sort(function (a, b) {
        return common.getInvestigationAmount(b) - common.getInvestigationAmount(a);
      });

      console.log('found : ' + foundedCompanies.length);
      foundedCompanies.forEach(function (companyInfo) {
        common.logCompany(companyInfo);
      });
    })
    .then(closeDB)
    .then(function () {
      return common.updateCompanyInfos(foundedCompanies);
    })
    .then(function () {
      return recordSelectedCompany(foundedCompanies);
    })
    .catch(function (err) {
      console.log(err);
    });

})();

