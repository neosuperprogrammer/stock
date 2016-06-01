/**
 * Created by neox on 2/29/16.
 */


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
                //console.log('connected!');
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

    _.getSomeCompanyList = function () {
        return new Promise(function (resolve, reject) {
            _.CompanyModel
                .find({per: {$gt: '0', $lt: '10'}, mc: {$gt: '10000000000'}})
                //.find({})
                .exec(function (err, companies) {
                    //console.log('***' + companies.length);
                    resolve(companies);
                });
        });
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
            var companySchema = new mongoose.Schema({
                type: String,
                name: String,
                code: String,
                current: Number,
                offset: String,
                mc: Number,
                ls: Number,
                per: Number,
                eps: Number
            });
            companySchema.methods.print = function () {
                console.log(this.name, '(', this.code, ') ', this.current, '(', this.offset,
                    ')\n - Market Capitalization : ', this.mc,
                    ')\n - Listed Shares : ', this.ls);
            };

            _.CompanyModel = mongoose.model('Company', companySchema);
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
                eps: companyInfo.eps
            });
            //company.print();
            company.save(function (err) {
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
                eps: companyInfo.eps
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

}.call(this));

