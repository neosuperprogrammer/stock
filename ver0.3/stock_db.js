/**
 * Created by neox on 2/29/16.
 */

// 가치투자 기업 검색.

(function () {

  var Promise = require('bluebird');
  var mongoose = require('mongoose');
  var common = require('./stock_common');

  //console.log(this);
  var root = this;

  // Create a safe reference to the Underscore object for use below.
  var _ = function (obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  exports = module.exports = _;

  _.VERSION = 0.1;

  var dropCollection = function (dbConnection, collectionName) {
    return new Promise(function (resolve, reject) {
      dbConnection.collection(collectionName)
        .drop(function () {
          resolve(dbConnection);
        });
    });
  };

  _.openDB = function (dbName) {
    //console.log('try to open db');
    return new Promise(function (resolve, reject) {
      mongoose.connect('mongodb://127.0.0.1:27017/' + dbName);
      var db = mongoose.connection;
      //var db = mongoose.createConnection('mongodb://127.0.0.1:27017/' + dbName);
      db.once('open', function callback() {
        console.log(dbName + ' connected!');
        _.dbConnection = db;
        resolve(db);
      });
      db.on('error', function callback(err) {
        console.log('open error : ' + err);
        resolve(err);
      });
    })
  };

  _.getCompanyList = function () {
    return new Promise(function (resolve, reject) {
      _.CompanyModel
        .find({})
        .exec(function (err, companies) {
          //console.log('***' + companies.constructor);
          resolve(companies);
        });
    });
  };

  getBaseClassList = function () {
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
  };

  getKosdaqBaseClassList = function () {
    console.log('getBaseClassList');
    return new Promise(function (resolve) {
      var market = 500 * 100;
      _.CompanyModel
        .find({current: {$gt: 10000}, ls: {$gt: 10000}, pbr: {$gt: 0.1, $lt: 1}, mc: {$gt: market}})
        //.find({})
        .exec(function (err, companies) {
          //console.log(err);
          console.log('>>>base : ' + companies.length);
          resolve(companies);
        });
    });
  };

  _.getValueCompanyList = function () {
    console.log('getWantedCompanyList');
    return new Promise(function (resolve, reject) {
      var selectedCompanyList = [];
      getBaseClassList()
        .then(function (companyList) {
          companyList.forEach(function (companyInfo) {
            //console.log('***' + companyInfo);
            if (companyInfo.eps > 0 && companyInfo.eps * 30 > companyInfo.current) {
              if (companyInfo.debt < 200) {
                selectedCompanyList.push(companyInfo);
              }
            }
          });
          console.log('>>>selected : ' + selectedCompanyList.length);

          resolve(selectedCompanyList);
          //return selectedCompanyList;
        })
        .catch(function (error) {
          console.log(error);
          reject(error);
        });

    });
  };

  _.getValueCompanyList2 = function () {
    console.log('getWantedCompanyList');
    return new Promise(function (resolve, reject) {
      var selectedCompanyList = [];
      getBaseClassList()
        .then(function (companyList) {
          companyList.forEach(function (companyInfo) {
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
          //return selectedCompanyList;
        })
        .catch(function (error) {
          console.log(error);
          reject(error);
        });

    });
  };

  _.getSomeCompanyList = function () {
    //return new Promise(function (resolve, reject) {
    //    _.CompanyModel
    //        .find({current: {$gt: 10000},  per: {$gt: 10, $lt: 15}, mc: {$gt: 100000}})
    //        //.find({})
    //        .exec(function (err, companies) {
    //            //console.log('***' + companies.length);
    //            resolve(companies);
    //        });
    //});


    // 시총이 500억 이상
    //return new Promise(function (resolve, reject) {
    //    var market = 500 * 100;
    //    _.CompanyModel
    //        .find({mc: {$lt: market}})
    //        //.find({})
    //        .exec(function (err, companies) {
    //            //console.log('***' + companies.length);
    //            resolve(companies);
    //        });
    //});

    // pbr 값
    //return new Promise(function (resolve, reject) {
    //    var market = 500 * 100;
    //    _.CompanyModel
    //        .find({pbr: {$gt: 0.1, $lt: 1.0}, mc: {$gt: market}})
    //        //.find({})
    //        .exec(function (err, companies) {
    //            //console.log('***' + companies.length);
    //            resolve(companies);
    //        });
    //});

    // 주식이름.
    return new Promise(function (resolve, reject) {
      _.CompanyModel
        .find({name: '세아베스틸'})
        //.find({})
        .exec(function (err, companies) {
          //console.log('***' + companies.length);
          resolve(companies);
        });
    });


    // code name
    //return new Promise(function (resolve, reject) {
    //    _.CompanyModel
    //        .find({code: '079940'})
    //        //.find({})
    //        .exec(function (err, companies) {
    //            //console.log('***' + companies.length);
    //            resolve(companies);
    //        });
    //});


    //return new Promise(function (resolve, reject) {
    //    _.CompanyModel
    //        .find({})
    //        //.find({'per': {$gt: '0', $lt: '20'}})
    //        .exec(function (err, companies) {
    //            console.log('***' + companies);
    //            resolve(companies);
    //        });
    //});
  };

  isExistCompany = function (companyInfo) {
    return new Promise(function (resolve, reject) {
      _.CompanyModel
        .find({code: companyInfo.code})
        //.find({})
        .exec(function (err, companies) {
          //console.log('err : ' + err);
          //console.log('companies : ' + companies);
          if (companies !== undefined && companies.length > 0) {
            resolve(1);
          }
          else {
            resolve(0);
          }
        });
    });
  };

  _.closeDB = function (dbConnection) {
    return new Promise(function (resolve, reject) {
      if (dbConnection === undefined) {
        if (_.dbConnection !== undefined) {
          _.dbConnection.close(function () {
            _.dbConnection = undefined;
            resolve();
          });
          return;
        }
      }
      dbConnection.close(function () {
        //console.log('close : ' + dbConnection);
        resolve();
      });
    });
  };

  _.buildModel = function () {
    return new Promise(function (resolve, reject) {

      if (_.CompanyModel !== undefined) {
        console.log('model is already created, return');
        resolve();
        return;
      }

      var stockInvestigation = new mongoose.Schema({
        date: Date,
        amount: Number // 주
      });

      var companySchema = new mongoose.Schema({
        type: String,
        name: String,
        code: String,
        current: Number,
        offset: String,
        mc: Number, // 시총 (백만) (Market Capitalization)
        ls: Number, // 총주식수 (천주) (Listed Shares)
        per: Number,
        eps: Number,
        bps: Number,
        pbr: Number,
        debt: Number, // 부채 (%)
        scf: Number, // 영업활동으로 인한 현금흐름 (백만) (sales cash flow)
        fi: [stockInvestigation],
        di: [stockInvestigation]
      });

      var recordSchema = new mongoose.Schema({
        date: Date,
        desc: String,
        companies: [companySchema]
      });

      companySchema.methods.print = function () {
        console.log(this.name, '(', this.code, ') ', this.current, '(', this.offset,
          ')\n - Market Capitalization : ', this.mc,
          ')\n - Listed Shares : ', this.ls);
      };

      _.CompanyModel = mongoose.model('Company', companySchema);
      _.RecordModel = mongoose.model('Record', recordSchema);

      resolve();
    });
  };

  _.dropCollections = function () {
    return _.openDB('kospi')
      .then(function (dbConnection) {
        return dropCollection(dbConnection, 'companies');
      })
      .then(function (dbConnection) {
        return _.closeDB(dbConnection);
      })
      .then(function () {
        return _.openDB('kosdaq');
      })
      .then(function (dbConnection) {
        return dropCollection(dbConnection, 'companies');
      })
      .then(function (dbConnection) {
        return _.closeDB(dbConnection);
      });
  };

  _.initialize = function () {
    return _.buildModel()
      .then(_.dropCollections);
  };

  _.saveOrUpdate = function (companyInfo) {
    return isExistCompany(companyInfo)
      .then(function (exist) {
        if (exist === 1) {
          //console.log(companyInfo.name + ' exist : update');
          return _.updateCompanyInfo(companyInfo);
        }
        else {
          console.log(companyInfo.name + ' not exist : insert');
          return _.saveCompanyInfo(companyInfo);
        }
      })
  };

  _.saveCompanyInfo = function (companyInfo) {
    return new Promise(function (resolve, reject) {
      var company = new _.CompanyModel({
        type: companyInfo.type,
        name: companyInfo.name,
        code: companyInfo.code,
        current: companyInfo.current,
        offset: companyInfo.offset,
        mc: companyInfo.mc,
        ls: companyInfo.ls,
        per: companyInfo.per,
        eps: companyInfo.eps,
        bps: companyInfo.bps,
        pbr: companyInfo.pbr,
        debt: companyInfo.debt,
        scf: companyInfo.scf,
        fi: companyInfo.fi,
        di: companyInfo.di
      });
      //company.print();
      //console.log(_.CompanyModel);
      company.save(function (err) {
        console.log('save' + err);
        resolve();
      });
    });
  };

  _.updateCompanyInfo = function (companyInfo) {
    return new Promise(function (resolve, reject) {
      //console.log(companyInfo);
      var company = new _.CompanyModel({
        _id: companyInfo._id,
        type: companyInfo.type,
        name: companyInfo.name,
        code: companyInfo.code,
        current: companyInfo.current,
        offset: companyInfo.offset,
        mc: companyInfo.mc,
        ls: companyInfo.ls,
        per: companyInfo.per,
        eps: companyInfo.eps,
        bps: companyInfo.bps,
        pbr: companyInfo.pbr,
        debt: companyInfo.debt,
        scf: companyInfo.scf,
        fi: companyInfo.fi,
        di: companyInfo.di
      });

      var upsertData = company.toObject();

// Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
      delete upsertData._id;

      //console.log(upsertData);

      _.CompanyModel.update({_id: company._id}, upsertData, {upsert: true}, function (err) {
        //console.log('update??');
        if (err) {
          console.log(err);
        }
        resolve();
      });
    });
  };

  _.insertRecord = function (date, desc, companies) {
    return new Promise(function (resolve, reject) {
      //console.log(date);
      var record = new _.RecordModel({
        date: date,
        desc: desc,
        companies: companies
      });
      //company.print();
      record.save(function (err) {
        //console.log('save : ' + err);
        resolve();
      });
    });
  };

}.call(this));

