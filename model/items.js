
var mysql = require('mysql');
var Promise = require('bluebird');
/*

mysql> create database stock;

mysql> grant ALL PRIVILEGES
       ON stock.* to flowgrammer@localhost
       identified by 'qwer1234'
       with grant option;

mysql -u flowgrammer -p

mysql> use stock;
Database changed


mysql> create table if not exists users (
       email varchar(255) NOT NULL PRIMARY KEY,
       username varchar(255) NOT NULL,
       hash varchar(255) NOT NULL,
       salt varchar(255) NOT NULL,
       granted varchar(255) NOT NULL
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


    mysql> create table if not exists company (
            id INT NOT NULL AUTO_INCREMENT,
            type varchar(64) NOT NULL,
            name varchar(255) NOT NULL,
            code varchar(64) NOT NULL,
            current INT default 0,
            mc INT default 0,
            ls INT default 0,
            per FLOAT default 0,
            eps INT default 0,
            bps INT default 0,
            pbr INT default 0,
            debt INT default 0,
            scf INT default 0,
            created timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

    mysql> create table if not exists fi (
            id INT NOT NULL AUTO_INCREMENT,
            code varchar(64) NOT NULL,
            amount INT default 0,
            date timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


    mysql> create table if not exists di (
            id INT NOT NULL AUTO_INCREMENT,
            code varchar(64) NOT NULL,
            amount INT default 0,
            date timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


mysql> create table if not exists items (
  id INT NOT NULL AUTO_INCREMENT,
  user_email varchar(255) NOT NULL,
  item varchar(255) NOT NULL,
  item_desc varchar(255) NOT NULL,
  remember_state INT default 1,
  created timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  FOREIGN KEY (user_email) REFERENCES users(email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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


 */


var conn = mysql.createConnection({
    host: "localhost",
    user: "flowgrammer",
    password: "qwer1234",
    database: "stock"
});

conn.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + conn.threadId);
});

var contents = {
    find: function (userEmail, done) {
        conn.query('select * from items where user_email = ? ORDER BY created DESC', [userEmail], function (err, result) {
            if (err) {
                console.log(err);
                //req.flash({'error':err.message});
                done(err);
            } else {
                //console.log(result);
                done(err, result);
            }
        });
    },
    findByPage: function (userEmail, start, limit, done) {
        conn.query('select * from items where user_email = ? ORDER BY created DESC LIMIT ?, ?', [userEmail, start, limit], function (err, result) {
            if (err) {
                console.log(err);
                //req.flash({'error':err.message});
                done(err);
            } else {
                done(err, result);
            }
        });
    },
    findByPageAndState: function (userEmail, start, limit, state, sort, done) {
        if (state == 1) {
            var queryString = 'select * from items where user_email = ? and remember_state = ? ORDER BY created DESC LIMIT ?, ?';
            if (sort == 0) {
                queryString = 'select * from items where user_email = ? and remember_state = ? ORDER BY created ASC LIMIT ?, ?';
            }

            // console.log('query : ' + queryString);
            conn.query(queryString, [userEmail, state, start, limit], function (err, result) {
                if (err) {
                    console.log(err);
                    //req.flash({'error':err.message});
                    done(err);
                } else {
                    done(err, result);
                }
            });
        }
        else {
            var queryString = 'select * from items where user_email = ? and remember_state = ? ORDER BY remembered DESC LIMIT ?, ?';
            if (sort == 0) {
                queryString = 'select * from items where user_email = ? and remember_state = ? ORDER BY remembered ASC LIMIT ?, ?';
            }

            conn.query(queryString, [userEmail, state, start, limit], function (err, result) {
                if (err) {
                    console.log(err);
                    //req.flash({'error':err.message});
                    done(err);
                } else {
                    done(err, result);
                }
            });
        }
    },
    findItemsWithState: function (userEmail, done) {
        conn.query('select remember_state from items where user_email = ?', [userEmail], function (err, result) {
            if (err) {
                console.log(err);
                //req.flash({'error':err.message});
                done(err);
            } else {
                done(err, result);
            }
        });
    },
    create: function (newItem, done) {
        conn.query('insert into company set ?', newItem, function (err, result) {
            if (err) {
                console.log(err);
                done(err);
            } else {
                console.log(result);
                done(null);
            }
        });

    },
    save: function (companyInfo, done) {
        return new Promise(function (resolve, reject) {
            var newItem = {
                type: companyInfo.type,
                name: companyInfo.name,
                code: companyInfo.code,
                current: companyInfo.current,
                // offset: companyInfo.offset,
                mc: companyInfo.mc,
                ls: companyInfo.ls,
                per: companyInfo.per,
                eps: companyInfo.eps,
                bps: companyInfo.bps,
                pbr: companyInfo.pbr,
                debt: companyInfo.debt,
                scf: companyInfo.scf
            };
            // console.log('newItem: ' + newItem);
            //company.print();
            //console.log(_.CompanyModel);
            // company.save(function (err) {
            //     console.log('save' + err);
            //     resolve();
            // });

                //     mysql> create table if not exists company (
//         id INT NOT NULL AUTO_INCREMENT,
//         type varchar(64) NOT NULL,
//         name varchar(255) NOT NULL,
//         code varchar(64) NOT NULL,
//         current INT default 0,
//         mc INT default 0,
//         ls INT default 0,
//         per FLOAT default 0,
//         eps INT default 0,
//         bps INT default 0,
//         pbr INT default 0,
//         debt INT default 0,
//         scf INT default 0,
//         created timestamp DEFAULT CURRENT_TIMESTAMP,
//         PRIMARY KEY(id)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
            conn.query('insert into company set ?', newItem, function (err, result) {
                if (err) {
                    console.log(err);
                    resolve();
                } else {
                    // console.log(result);
                    resolve();
                }
            });
        });
    },

    deleteAll: function (done) {
        conn.query('DELETE from company', function (err, result) {
            if (err) {
                console.log(err);
                done(err);
            } else {
                done(null);
            }
        });

    },

    getFiInfo: function(code, done) {
        conn.query('select * from fi where code = ?', [code], function (err, result) {
            if (err) {
                console.log(err);
                done(err);
            } else {
                done(null, result)
            }
        });
    },

    getAllFiInfo: function(companyList) {
        var theThis = this;

        return Promise.all(companyList).each(function (companyInfo) {
            return new Promise(function (resolve, reject) {
                // console.log('update');
                theThis.getFiInfo(companyInfo.code, function (err, result) {
                    if (err) {
                        console.log(err);
                        companyInfo.fi = [];
                        resolve(companyInfo);
                    } else {
                        result.forEach(function (fi) {
                            fi.code = companyInfo.code;
                            fi.new = false;
                        });
                        companyInfo.fi = result;
                        resolve(companyList);
                    }
                });
            });
        });
    },

    getDiInfo: function(code, done) {
        conn.query('select * from di where code = ?', [code], function (err, result) {
            if (err) {
                console.log(err);
                done(err);
            } else {
                done(null, result)
            }
        });
    },

    getAllDiInfo: function(companyList) {
        var theThis = this;

        return Promise.all(companyList).each(function (companyInfo) {
            return new Promise(function (resolve, reject) {
                // console.log('update');
                theThis.getDiInfo(companyInfo.code, function (err, result) {
                    if (err) {
                        console.log(err);
                        companyInfo.di = [];
                        resolve(companyInfo);

                    } else {
                        result.forEach(function (di) {
                            di.new = false;
                        });
                        companyInfo.di = result;
                        resolve(companyInfo);
                    }
                });
            });
        });
    },

    findByType: function (type, done) {
        var theThis = this;
        conn.query('select * from company where type = ?', [type], function (err, result) {
            if (err) {
                console.log(err);
                //req.flash({'error':err.message});
                done(err);
            } else {
                theThis.getAllFiInfo(result)
                    .then(function (companyList) {
                        theThis.getAllDiInfo(result)
                            .then(function (companyList) {
                                // console.log(companyList);
                                done(err, result);
                            });

                    });
            }
        });
    },

    updateDiInfo: function(di, done) {

        var newItem = {
            code: di.code,
            amount: di.amount,
            date: di.date
        };

        conn.query('insert into di set ?', newItem, function (err, result) {
            if (err) {
                console.log(err);
                done(err);
            } else {
                // console.log('success');
                // console.log(result);
                done(null, result);
            }
        });
    },

    updateAllDiInfo: function (companyInfo) {

        var newDi = [];
        companyInfo.di.forEach(function (di) {
            if (di.new == true) {
                di.code = companyInfo.code;
                newDi.push(di);
            }
        });

        console.log('new di count : ' + newDi.length);

        var theThis = this;
        var theCompanyInfo = companyInfo;

        if (newDi.length == 0) {
            return new Promise(function (resolve, reject) {
                resolve(companyInfo);
            });
        }

        return Promise.all(newDi).each(function (di) {
            return new Promise(function (resolve, reject) {
                // console.log('update');
                theThis.updateDiInfo(di, function (err, result) {
                    if (err) {
                        console.log(err);
                        resolve(theCompanyInfo);
                    } else {
                        // console.log('resolve');
                        resolve(theCompanyInfo);
                    }
                });
            });
        });
    },

    updateFiInfo: function(fi, done) {
        var newItem = {
            code: fi.code,
            amount: fi.amount,
            date: fi.date
        };

        conn.query('insert into fi set ?', newItem, function (err, result) {
            if (err) {
                console.log(err);
                done(err);
            } else {
                // console.log(result);
                done(null, result);
            }
        });
    },

    updateAllFiInfo: function (companyInfo) {

        var newFi = [];

        // console.log('fi : ' + companyInfo);
        companyInfo.fi.forEach(function (fi) {
            if (fi.new == true) {
                fi.code = companyInfo.code;
                newFi.push(fi);
            }
        });

        console.log('new fi count : ' + newFi.length);

        if (newFi.length == 0) {
            return new Promise(function (resolve, reject) {
                resolve(companyInfo);
            });
        }

        var theThis = this;

        return Promise.all(newFi).each(function (fi) {
            return new Promise(function (resolve, reject) {
                // console.log('update');
                theThis.updateFiInfo(fi, function (err, result) {
                    if (err) {
                        console.log(err);
                        resolve(companyInfo);
                    } else {
                        resolve(companyInfo);
                    }
                });
            });
        });
    },

    updateCompanyInfo: function (companyInfo, done) {
        // console.log('updatecompanyinfo');
        var theThis = this;
        var theCompanyInfo = companyInfo;
        conn.query('UPDATE company SET current = ?, mc = ?, ls = ?, per = ?, eps = ?, bps = ?, pbr = ?, debt = ?, scf = ? WHERE id = ?',
            [companyInfo.current, companyInfo.mc, companyInfo.ls, companyInfo.per, companyInfo.eps, companyInfo.bps, companyInfo.pbr, companyInfo.debt, companyInfo.scf, companyInfo.id], function (err, results) {
                if (err) {
                    console.log(err);
                    done(err);
                } else {
                    theThis.updateAllDiInfo(theCompanyInfo)
                        .then(function (companyInfo) {
                            theThis.updateAllFiInfo(theCompanyInfo)
                                .then(function (companyInfo) {
                                    // console.log(">>>>>>>>>>>>>>>>>>>> " + results.constructor);
                                    done(null, results);
                                });

                            // done(null, results);
                        });
                    
                }
            });

    },

    findByPage: function (start, limit, done) {
        // var queryString = 'select * from company ORDER BY created DESC LIMIT ?, ?';
        var queryString = 'select * from company LIMIT ?, ?';
        conn.query(queryString, [start, limit], function (err, result) {
            if (err) {
                console.log(err);
                //req.flash({'error':err.message});
                done(err);
            } else {
                done(err, result);
            }
        });
    },

    findById: function (item, done) {
        conn.query('select * from items where id = ?', [item], function (err, result) {
            if (err) {
                console.log(err);
                done(err);
            } else {
                if (result.length > 0) {
                    console.log(result);
                    done(null, result[0]);
                } else {
                    done(null);
                }

            }

        });
    },
    findByIdAndUpdate: function (itemId, updatedItem, done) {
        conn.query('UPDATE items SET item = ?, item_desc = ?, remember_state = ? WHERE id = ?',
            [updatedItem.item, updatedItem.item_desc, updatedItem.remember_state, itemId], function (err, results) {
                if (err) {
                    console.log(err);
                    done(err);
                } else {

                    console.log(">>>>>>>>>>>>>>>>>>>> " + results.constructor);
                    done(null, results);
                }
            });
    },
    findByIdAndRemove: function (itemId, done) {
        conn.query('DELETE from items where id = ?', [itemId], function (err, result) {
            if (err) {
                console.log(err);
                done(err);
            } else {
                done(null);
            }
        });
    },
    findByStateAndRemove: function (userEmail, state, done) {
        if (state == 0) {
            conn.query('DELETE from items where user_email = ?', [userEmail, state], function (err, result) {
                if (err) {
                    console.log(err);
                    done(err);
                } else {
                    done(null);
                }
            });
        } else {
            conn.query('DELETE from items where user_email = ? and remember_state = ?', [userEmail, state], function (err, result) {
                if (err) {
                    console.log(err);
                    done(err);
                } else {
                    done(null);
                }
            });
        }
    },

    findByIdAndUpdateState: function (itemId, state, done) {
        var now = new Date();
        // console.log('now : ' + now + ', state : ' + state);
        conn.query('UPDATE items SET remember_state = ?, remembered = ? WHERE id = ?',
            [state, now, itemId], function (err, results) {
                if (err) {
                    console.log(err);
                    done(err);
                } else {
                    console.log(">>>>>>>>>>>>>>>>>>>> " + results.constructor);
                    done(null, results);
                }
            });
    },

    findByIdAndUpdateStateAndForgetCount: function (itemId, state, forgetCount, done) {
        var now = new Date();
        // console.log('now : ' + now + ', state : ' + state);
        // conn.query('UPDATE items SET remember_state = ?, forget_count = ?, created = ?, remembered = ? WHERE id = ?',
        //     [state, forgetCount, now, now, itemId], function (err, results) {
        //         if (err) {
        //             console.log(err);
        //             done(err);
        //         } else {
        //             console.log(">>>>>>>>>>>>>>>>>>>> " + results.constructor);
        //             done(null, results);
        //         }
        //     });
        conn.query('UPDATE items SET remember_state = ?, forget_count = ?, remembered = ? WHERE id = ?',
            [state, forgetCount, now, itemId], function (err, results) {
                if (err) {
                    console.log(err);
                    done(err);
                } else {
                    console.log(">>>>>>>>>>>>>>>>>>>> " + results.constructor);
                    done(null, results);
                }
            });

    }


};

module.exports = contents;

