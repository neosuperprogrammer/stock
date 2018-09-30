/**
 * Created by neox on 2/29/16.
 */

var _ = require('underscore');
var Promise = require('bluebird');
var stock_request = require('./stock_request');

module.exports = {

  version: '0.1',

  waitFor: function (miliSeconds) {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, miliSeconds);
    });
  },

  logCompany: function (companyInfo) {
    // console.log('log company');
    var cashflowUri = 'http://media.kisline.com/fininfo/mainFininfo.nice?paper_stock='
      + companyInfo.code + '&nav=4';
    var cashFlowPerStock = (companyInfo.scf / companyInfo.ls) * 1000 * 10;
    cashFlowPerStock = Math.floor(cashFlowPerStock);
    var boardUri = 'http://finance.naver.com/item/board.nhn?code='
      + companyInfo.code + '&page=1';

    var domesticInv = 0;
    var foreignInv = 0;

    _.forEach(companyInfo.di, function (data) {
      domesticInv += data.amount;
    });

    _.forEach(companyInfo.fi, function (data) {
      foreignInv += data.amount;
    });

    console.log('type : ' + companyInfo.type + '\n'
      + 'chart : http://finance.naver.com/item/fchart.nhn?code=' + companyInfo.code + '\n'
      + 'cashflow : ' + cashflowUri + '\n'
      + 'board : ' + boardUri + '\n'
      + 'cashflow calculated : ' + cashFlowPerStock + '\n'
      + 'name : ' + companyInfo.name + '\n'
      + 'code : ' + companyInfo.code + '\n'
      + 'current : ' + companyInfo.current + '\n'
      + 'offset : ' + companyInfo.offset + '\n'
      + 'ls : ' + companyInfo.ls + '\n'
      + 'mc : ' + companyInfo.mc + '\n'
      + 'eps : ' + companyInfo.eps + '\n'
      + 'per : ' + companyInfo.per + '\n'
      + 'bps : ' + companyInfo.bps + '\n'
      + 'pbr : ' + companyInfo.pbr + '\n'
      + 'debt : ' + companyInfo.debt + '\n'
      + 'scf : ' + companyInfo.scf + '\n'
      + 'foreign_inv : ' + foreignInv + '\n'
      + 'domestic_inv : ' + domesticInv + '\n'
      + 'inv_ratio : ' + this.getInvestigationRatio(companyInfo) + '\n'
      + 'inv_amount : ' + this.getInvestigationAmount(companyInfo) + '\n'
    );
  },

  getFloatValue: function (original) {
    return parseFloat(original.replace(/,/g, ''));
  },

  getInvestigationRatio: function (companyInfo) {
    var domestic = this.getDomesticInvestigation(companyInfo);
    var foreign = this.getForeignInvestigation(companyInfo);

    var sum = domestic + foreign;
    var ratio = sum / (companyInfo.ls * 1000);
    return ratio;
  },

  getInvestigationAmount: function (companyInfo) {
    var domestic = this.getDomesticInvestigation(companyInfo);
    var foreign = this.getForeignInvestigation(companyInfo);

    var sum = domestic + foreign;
    var amount = sum * (companyInfo.current / 1000000);
    return amount;
  },

  getDomesticInvestigation: function (companyInfo, limit) {
    var domesticInv = 0;

    if (limit === undefined) {
      limit = 10;
    }

    var list = companyInfo.di.slice(0, limit);

    _.forEach(list, function (data) {
      domesticInv += data.amount;
    });

    return domesticInv;
  },


  getForeignInvestigation: function (companyInfo, limit) {
    var foreignInv = 0;

    if (limit === undefined) {
      limit = 10;
    }

    var list = companyInfo.fi.slice(0, limit);

    _.forEach(list, function (data) {
      foreignInv += data.amount;
    });

    return foreignInv;
  },

  getCurrentPrice: function (loaded) {
    var list = loaded('td > span#lastTick\\[6\\]');
    var currentString = list[0].children[0].children[0].data;
    //console.log(totalString);
    var current = parseFloat(currentString.replace(/,/g, ''));
    return current;
  },

  updateCurrentPrice: function (companyInfo) {

    var that = this;


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
        return that.getCurrentPrice(contents);
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
  },

  updateCompanyInfos: function (companyList) {
    var that = this;
    var sequence = Promise.resolve();

    companyList.forEach(function (companyInfo) {
      sequence = sequence
        .then(function () {
          return that.updateCurrentPrice(companyInfo);
        })
    });

    return sequence;
  }


};