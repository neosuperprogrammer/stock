/**
 * Created by neox on 2/22/16.
 */

// naver에서 eps, bps, pbr, debt 를 가져옴


var _ = require('underscore');
var request = require('request');
//var cheerio = require('cheerio');
var $ = require('cheerio');
var iconv = require('iconv-lite');
var Iconv = require('iconv').Iconv;
var detectCharacterEncoding = require('detect-character-encoding');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var stock_request = require('./stock_request');
var common = require('./stock_common');
var db = require('./stock_db');

(function () {

  function getEPS(loaded) {
    var list = $(loaded('th.th_cop_anal17')[0]).parent().find('td.t_line');
    //console.log(list);
    if (list.length < 1) {
      return 0;
    }
    //var currentData = $(list[0]).first().children().first().data.trim();
    var currentValue = list[0].children[0].data.trim();
    if (currentValue !== '') {
      var eps = common.getFloatValue(currentValue);
      //console.log('eps : ' + eps);
      return eps;
    }

    var prevValue = $(list[0]).prev().find('em');
    if (prevValue.length > 0) {
      eps = prevValue[0].children[0].data.trim();
      eps = common.getFloatValue(eps);
      //console.log('eps : ' + eps);
      return eps;
    }

    eps = $(list[0]).prev()[0].children[0].data.trim();
    eps = common.getFloatValue(eps);
    //console.log('eps : ' + eps);
    return eps;
  }

  function getBPS(loaded) {
    var list = $(loaded('th.th_cop_anal18')[0]).parent().find('td.t_line');
    if (list.length < 1) {
      return 0;
    }

    //var currentData = $(list[0]).first().children().first().data.trim();
    var currentValue = list[0].children[0].data.trim();
    if (currentValue !== '') {
      var bps = common.getFloatValue(currentValue);
      return bps;
    }

    var prevValue = $(list[0]).prev().find('em');
    if (prevValue.length > 0) {
      bps = prevValue[0].children[0].data.trim();
      bps = common.getFloatValue(bps);
      return eps;
    }

    bps = $(list[0]).prev()[0].children[0].data.trim();
    bps = common.getFloatValue(bps);
    return bps;
  }

  function getDebt(loaded) {
    var list = loaded('#aside #tab_con1');
    if (list.length < 1) {
      return 0;
    }
    var section = $(list[0]).children().last().prev();

    var table = $(section[0]).find('table');

    var tr = $(table[0]).find('tr').last();

    if ($(table[0]).find('tr').length < 5) {
      return 0;
    }

    debt = $(tr[0]).children().last()[0].children[1].children[0].data;
    debt = debt.replace('%', '');

    debt = common.getFloatValue(debt);

    return debt;
  }

  function parseAndGetCompanyInfo(companyInfo) {
    var requestOption = {
      encoding: null,
      method: "GET",
      uri: 'http://finance.naver.com/item/main.nhn?code=110570'
    };

    requestOption.uri = 'http://finance.naver.com/item/main.nhn?code=' + companyInfo.code;

    console.log(requestOption.uri);
    var contents = null;
    return stock_request.getUrlContents(requestOption)
      //return getUrlContents(requestOption)
      .then(function (loaded) {
        contents = loaded;
        return getEPS(contents);
      })
      .then(function (eps) {
        //companyList[count].total = total;
        //console.log(' ) ' + companyInfo.name + ' : ' + total);
        console.log(companyInfo.name);
        console.log('eps : ' + eps);
        companyInfo.eps = eps;
        return companyInfo;
        //return waitFor(100);
      })
      .then(function () {
        return getBPS(contents);
      })
      .then(function (bps) {
        console.log('bps : ' + bps);
        companyInfo.bps = bps;
        return companyInfo;
      })
      .then(function (companyInfo) {
        if (companyInfo.bps !== 0) {
          var pbr = companyInfo.current / companyInfo.bps;
        }
        else {
          pbr = 0;
        }
        console.log('pbr : ' + pbr);

        companyInfo.pbr = pbr;
        return companyInfo;
      })
      .then(function () {
        return getDebt(contents);
      })
      .then(function (debt) {
        console.log('debt : ' + debt);
        companyInfo.debt = debt;
        return companyInfo;
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

    var sequence = Promise.resolve();

    subCompanyList.forEach(function (companyInfo) {
      sequence = sequence
        .then(function () {
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
    //.then(getKosdaqList)
    .then(getCompanyInfos)
    .then(updateCompanyInfos)
    .catch(function (err) {
      console.log(err);
    });
})();

