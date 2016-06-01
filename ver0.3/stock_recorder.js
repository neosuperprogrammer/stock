/**
 * Created by neox on 3/14/16.
 */

(function () {

  var Promise = require('bluebird');
  var mongoose = require('mongoose');
  var common = require('./stock_common');
  var db = require('./stock_db');

  //console.log(this);
  var root = this;

  var _ = function (obj) {
    if (obj instanceof _) {
      return obj;
    }
    if (!(this instanceof _)) {
      return new _(obj);
    }
    this._wrapped = obj;
  };

  exports = module.exports = _;

  _.VERSION = 0.1;

  function initialize() {
    return db.buildModel();
  }

  function openDB() {
    //console.log('record db open');
    return db.openDB('record');
  }

  function closeDB() {
    console.log('close db');
    return db.closeDB();
  }

  _.record = function(date, desc, companyList) {
    return initialize()
      .then(openDB)
      .then(function() {
        //common.logCompany(companyList[0]);
        //return db.saveCompanyInfo(companyList[0]);
        return db.insertRecord(date, desc, companyList);
        //console.log('record');
      })
      .then(closeDB);
  };

}.call(this));