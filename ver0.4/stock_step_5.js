/**
 * Created by neox on 3/11/16.
 */

// naver 에서 기관, 외국인 투자 정보 가져옴

var _ = require('underscore');
var $ = require('cheerio');
var iconv = require('iconv-lite');
var stock_request = require('./stock_request');
var common = require('./stock_common');
var db = require('./stock_db');
var Items       = require("../model/items");
var Promise = require('bluebird');

(function () {

  function getDomesticInvestication(loaded) {
    //var tbody = loaded('#middle > #content > div > table > tbody');
    var table = $(loaded('#middle > #content > div.section.inner_sub').find('table').get(1));
    if (table.length < 1) {
      return 0;
    }

    var trlist = table.children();
    //console.log(tr);

    var domesticInv = [];

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
      //console.log(date);

      var td = $(tr.children().get(5));
      var amount = td.text().trim();
      amount = common.getFloatValue(amount);
      //console.log('domestic : ' + amount);

      domesticInv.push({'date': date, 'amount': amount});
    }

    return domesticInv;
  }

  function getForeinInvestication(loaded) {
    //var tbody = loaded('#middle > #content > div > table > tbody');
    var table = $(loaded('#middle > #content > div.section.inner_sub').find('table').get(1));
    if (table.length < 1) {
      return 0;
    }

    var trlist = table.children();
    //console.log(tr);

    var foreignInv = [];

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
      //console.log(date);

      var td = $(tr.children().get(6));
      var amount = td.text().trim();
      amount = common.getFloatValue(amount);
      //console.log('domestic : ' + amount);
      foreignInv.push({'date': date, 'amount': amount});
    }

    return foreignInv;
  }

  function updateInvestication(original, update) {
    //console.log('original : ' + original.length);
    //console.log('update : ' + update.length);
    if (original === undefined || original.length === undefined) {
      original = [];
    }

    for (var i = 0; i < update.length; i++) {
      var found = 0;
      var updateData = update[i];
      for (var j = 0; j < original.length; j++) {
        var originalData = original[j];
        //console.log('update date : ' +  updateData.date);
        //console.log('original date : ' +  originalData.date);
        if (updateData.date.getTime() == originalData.date.getTime()) {
          //console.log('found');
          found = 1;
          break;
        }
        else {
          //console.log('not found');
        }
      }
      if (found !== 1) {
        //console.log('push');
        original.push({'date': updateData.date, 'amount': updateData.amount, 'new': true});
      }
    }

    //console.log('before');
    //
    //_.each(original, function(data) {
    //  console.log(data.date);
    //});

    original.sort(function (a, b) {
      //console.log('a date : ' + a.date);
      //console.log('b date : ' + b.date);
      //if (a.date > b.date) {
      //  console.log('a is bigger than b');
      //}
      //if (b.date == a.date) {
      //  console.log('a is b');
      //}
      //if (b.date > a.date) {
      //  console.log('b is bigger than a');
      //}
      return b.date.getTime() - a.date.getTime();
    });
    //console.log('after');
    //
    //_.each(original, function(data) {
    //  console.log(data.date);
    //});

    return original;
  }

  function parseAndGetCompanyInfo(companyInfo, page) {
    var requestOption = {
      encoding: null,
      method: "GET",
      uri: 'http://finance.naver.com/item/frgn.nhn?code=005930&page=1'
    };

    requestOption.uri = 'http://finance.naver.com/item/frgn.nhn?code=' + companyInfo.code + '&page=' + page;

    console.log(requestOption.uri);
    var contents = null;
    return stock_request.getUrlContents(requestOption)
      //return getUrlContents(requestOption)
      .then(function (loaded) {
        contents = loaded;
        return getForeinInvestication(contents);
      })
      .then(function (foreignInv) {
        //console.log('eps : ' + eps);
        //companyInfo.eps = eps;
        //   console.log('foreignInv : ' + foreignInv);

        companyInfo.fi = updateInvestication(companyInfo.fi, foreignInv);
        // console.log('fi count : ' + companyInfo.fi.length);
        return companyInfo;
        //return waitFor(100);
      })
      .then(function (companyInfo) {
        return getDomesticInvestication(contents);
      })
      .then(function (domesticInv) {
        //console.log('eps : ' + eps);
        //companyInfo.eps = eps;
        companyInfo.di = updateInvestication(companyInfo.di, domesticInv);
          // console.log('di count : ' + companyInfo.di.length);
        return companyInfo;
        //return waitFor(100);
      })
      .then(function (companyInfo) {
        // common.logCompany(companyInfo);
        return common.waitFor(100);
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  function getCompanyInfos(companyList) {
    var subCompanyList = companyList.slice(0, 0 + 1);
    // var subCompanyList = companyList.slice();

    var sequence = Promise.resolve();

    subCompanyList.forEach(function (companyInfo) {
      sequence = sequence
        .then(function () {
          return parseAndGetCompanyInfo(companyInfo, 1);
        });
      //.then(function () {
      //  return parseAndGetCompanyInfo(companyInfo, 2);
      //});
    });

    return sequence
      .then(function () {
        return subCompanyList;
      });
  }

  function updateCompanyInfos(companyList) {
      // console.log('type : ' + typeof companyList )
      return Promise.all(companyList).each(function (companyInfo) {
          return new Promise(function (resolve, reject) {
              // console.log('update');
              Items.updateCompanyInfo(companyInfo, function (err, result) {
                  if (err) {
                      reject(err);
                  } else {
                      resolve(result);
                  }
              });
          });
      });

    //   var sequence = Promise.resolve();
    //
    // companyList.forEach(function (companyInfo) {
    //   sequence = sequence
    //     .then(function () {
    //       return db.updateCompanyInfo(companyInfo);
    //     })
    // });
    //
    // return sequence
    //   .then(function () {
    //     return closeDB();
    //   });
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
      // .then(function (dbConnection) {
      //   return db.getCompanyList();
      // });
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
    //.then(getKosdaqList)
    .then(getCompanyInfos)
    .then(updateCompanyInfos)
    .catch(function (err) {
      console.log(err);
    });
})();

