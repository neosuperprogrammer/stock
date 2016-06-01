/**
 * Created by neox on 3/11/16.
 */

var _ = require('underscore');
var $ = require('cheerio');
var iconv = require('iconv-lite');
var stock_request = require('./stock_request');
var common = require('./stock_common');
var db = require('./stock_db');

(function () {

  function getForeinInvestication(loaded) {
    //var tbody = loaded('#middle > #content > div > table > tbody');
    var table = $(loaded('#middle > #content > div.section.inner_sub').find('table').get(1));
    if (table.length < 1) {
      return 0;
    }

    var trlist = table.children();
    //console.log(tr);

    for (var i = 3; i < trlist.length; i++) {
      var tr = $(trlist.get(i));
      var dateTd = $(tr.children().get(0));
      var dateString = dateTd.text().trim();
      if (dateString.length < 1) {
        continue;
      }

      dateString = dateString.replace(/\./g, '-');

      var date = new Date(dateString);
      //var month = date.getMonth() + 1;


      console.log(date);
      var td = $(tr.children().get(6));
      var amount = td.text().trim();
      amount = common.getFloatValue(amount);
      //var span = $(td.children().first());

      console.log(amount);
    }

    return 0;
  }

  function parseAndGetCompanyInfo(companyInfo, page) {
    var requestOption = {
      encoding: null,
      method: "GET",
      uri: 'http://finance.naver.com/item/frgn.nhn?code=005930&page=1'
    };

    //requestOption.uri = 'http://finance.naver.com/item/frgn.nhn?code=' + companyInfo.code + '&page=' + page;

    console.log(requestOption.uri);
    var contents = null;
    return stock_request.getUrlContents(requestOption)
      //return getUrlContents(requestOption)
      .then(function (loaded) {
        contents = loaded;
        return getForeinInvestication(contents);
      })
      .then(function (fi) {
        //console.log('eps : ' + eps);
        //companyInfo.eps = eps;
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
    var subCompanyList = companyList.slice(0, 0 + 1);
    //var subCompanyList = companyList.slice();

    var sequence = Promise.resolve();

    subCompanyList.forEach(function (companyInfo) {
      sequence = sequence
        .then(function () {
          return parseAndGetCompanyInfo(companyInfo, 1);
        })
    });

    return sequence
      .then(function () {
        return subCompanyList;
      });
  }

  function updateCompanyInfos(companyList) {
    var sequence = Promise.resolve();

    companyList.forEach(function (companyInfo) {
      sequence = sequence
        .then(function () {
          return db.updateCompanyInfo(companyInfo);
        })
    });

    return sequence
      .then(function () {
        return closeDB();
      });

    //return Promise.all(companyList).each(function (companyInfo) {
    //    //console.log(companyInfo);
    //    return db.updateCompanyInfo(companyInfo);
    //  })
    //  .then(function () {
    //    return closeDB();
    //  });
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
    //.then(getKosdaqList)
    //.then(getCompanyInfos)
    //.then(updateCompanyInfos)
    .catch(function (err) {
      console.log(err);
    });
})();

