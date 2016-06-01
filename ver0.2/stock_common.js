/**
 * Created by neox on 2/29/16.
 */

var Promise = require('bluebird');

module.exports = {

    version: '0.1',

    waitFor: function (miliSeconds) {
        return new Promise(function (resolve, reject) {
            setTimeout(resolve, miliSeconds);
        });
    },

    logCompany: function (companyInfo) {

        var cashflowUri = 'http://media.kisline.com/fininfo/mainFininfo.nice?paper_stock='
            + companyInfo.code + '&nav=4';
        var cashFlowPerStock = (companyInfo.scf / companyInfo.ls) * 1000 * 10;
        cashFlowPerStock = Math.floor(cashFlowPerStock);
        var boardUri = 'http://finance.naver.com/item/board.nhn?code='
            + companyInfo.code + '&page=1';
        console.log('type : ' + companyInfo.type + '\n'
            + 'chart : http://finance.naver.com/item/fchart.nhn?code=' + companyInfo.code + '\n'
            + 'cashflow : ' +  cashflowUri + '\n'
            + 'board : ' +  boardUri + '\n'
            + 'cashflow calculated : ' +  cashFlowPerStock + '\n'
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


        );
    },

    getFloatValue: function (original) {
        return parseFloat(original.replace(/,/g, ''));
    }


};