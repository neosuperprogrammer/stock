var express     = require("express");
router          = express.Router();
var middleware  = require("../middleware");
var Items       = require("../model/items");
var util        = require("../utility");

router.get("/", middleware.isLoggedIn, function(req, res){
  res.redirect("/api/items/page/1");
//   var email = req.session.user.email;
//   console.log("email : " + email);
//   Items.find(email, function(err, items){
//     if (err) {
//       res.send('item find error : ' + err);
//     } else {
//       //console.log(">>>>" + items);
//       var result = {
//         result: 'success',
//         items: items
//       };
//       //res.send('test');
//       res.render('items/index', result);
//     }
//   });
});

router.get("/items/page/:page", middleware.isLoggedIn, function (req, res) {
    var page = req.params.page;
    var state = req.query.state;
    var sort = req.query.sort;

    console.log("page : " + page);
    console.log("state : " + state);
    console.log("sort : " + sort);
    var email = req.session.user.email;
    var start = 0;
    var countPerPage = 20;
    if (page > 1) {
        console.log("page is greater than 1");
        start = countPerPage * (page - 1);
        console.log("start : " + start);
    }
//     Items.findByPage(email, start, countPerPage, function (err, items) {
//         if (err) {
//             var result = {
//                 result: 'fail',
//                 reason: err
//             };
// //       res.send('item find error : ' + err);
//             res.send(result);
//         } else {
//             var result = {
//                 result: 'success',
//                 page: page,
//                 items: items
//             };
//             res.send(result);
//         }
//     });
    Items.findByPageAndState(email, start, countPerPage, state, sort, function (err, items) {
        if (err) {
            var result = {
                result: 'fail',
                reason: err
            };
//       res.send('item find error : ' + err);
            res.send(result);
        } else {
            var result = {
                result: 'success',
                page: page,
                items: items
            };
            res.send(result);
        }
    });
//   Items.find(email, function(err, items){
//     if (err) {
//       res.send('item find error : ' + err);
//     } else {
//       var result = {
//         result: 'success',
//         items: items
//       };
//       res.render('items/index', result);
//     }
//   });
});

router.get("/items/items/:start", middleware.isLoggedIn, function (req, res) {
    var start = parseInt(req.params.start);
    var countPerPage = parseInt(req.query.count);
    var state = req.query.state;
    var sort = req.query.sort;

    console.log("start : " + start);
    console.log("countPerPage : " + countPerPage);
    console.log("state : " + state);
    console.log("sort : " + sort);
    var email = req.session.user.email;

    Items.findByPageAndState(email, start, countPerPage, state, sort, function (err, items) {
        if (err) {
            var result = {
                result: 'fail',
                reason: err
            };
            res.send(result);
        } else {
            var result = {
                result: 'success',
                items: items
            };
            res.send(result);
        }
    });
});

router.get("/setting/items/delete/:state", middleware.isLoggedIn, function (req, res) {
    var state = req.params.state;
    // var state = req.query.state;
    //
    // console.log("page : " + page);
    console.log("state : " + state);
    var email = req.session.user.email;
    Items.findByStateAndRemove(email, state, function(err){
        if(err){
            console.log(err);
            var result = {
                result: 'fail',
                reason: err
            };
            res.send(result);

        } else {
            var result = {
                result: 'success',
            };
            // console.log('result ' +  result);
            res.send(result);
        }
    });
});

router.get("/search/items/", middleware.isLoggedIn, function (req, res) {
    // var state = req.params.state;
    var word = req.query.word;
    //
    console.log("word : " + word);
    var email = req.session.user.email;

    var encodedWord = encodeURIComponent(word);

    urlStr = 'http://ac.endic.naver.com/ac?q=' + encodedWord + '&q_enc=utf-8&st=11001&r_format=json&r_enc=utf-8&r_lt=11001&r_unicode=0&r_escape=1';
    // urlStr = 'http://ac.endic.naver.com/ac?_callback=' + encodeURIComponent('window.__jindo2_callback.$3308') +'&q=' + encodedWord + '&q_enc=utf-8&st=11001&r_format=json&r_enc=utf-8&r_lt=11001&r_unicode=0&r_escape=1';
    console.log(urlStr);
    util.requestUrlContents(urlStr, function (data, err) {
        if (err) {
            console.log('error >>> ' + err);
            var result = {
                result: 'fail',
                reason: err
            };
            res.send(result);
        } else {
            // console.log('success ' + data.toString());
            // console.log('==========================');
            var json = JSON.parse(data.toString());
            // console.log('success ' + json.toString());
            // console.log('query : ' + json.query);
            // console.log('type : ' + typeof json.items);
            // console.log('items : ' + json.items[0][0][0]);
            var resultWord = [];
            json.items[0].forEach(function (value) {
                var item = value[0][0];
                var item_desc = value[1][0];
                // console.log(value[0][0]);
                // console.log(value[1][0]);
                // console.log('length : ' + value.length);
                // console.log('==========================');
                resultWord.push({item:item, item_desc:item_desc});
            });
            // console.log(resultWord);
            var result = {
                result: 'success',
                data: resultWord
            };
            // console.log('result ' +  result);
            res.send(result);
        }
    });
    // $.ajax({
    //     url: urlStr,
    //     type: 'get',
    //     dataType: 'json',
    //     // responseType: 'blob',
    //     success: function (data) {
    //         console.log('success ' + data);
    //         var result = {
    //             result: 'success',
    //             data: data
    //         };
    //         // console.log('result ' +  result);
    //         res.send(result);
    //     },
    //     error: function (error) {
    //         console.log('error >>> ' + error);
    //         var result = {
    //             result: 'fail',
    //             reason: err
    //         };
    //         res.send(result);
    //     }
    //
    // });
});

function createItem(newItem, index) {
    return new Promise(function (resolve, reject) {
        Items.create(newItem, function(err){
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(">>>>>> create : " + index);
                resolve();
            }
        });
    });
}


router.get("/setting/elementary/:level", middleware.isLoggedIn, function (req, res) {
    var level = req.params.level;
    // var state = req.query.state;
    //
    // console.log("page : " + page);
    console.log("level : " + level);
    var email = req.session.user.email;

    var sequence = Promise.resolve();
    util.loadElementaryListWithLevel(level, function (max_number, result) {
        // console.log('result : ' + result);
        var index = 0;
        var words = [];
        for (key in result) {
            var word = result[key];
            words.push(word);
        }
        // console.log(">>>> word : " + words);
        // console.log(">>>> word : " + words.length);
        // const keys = Object.keys(result);
        // for (key in result) {
            // console.log(word);
        // for (i=0s; i< max_number;i++) {

        if (level == 2) {
            index = 100;
        }
        else if (level == 3) {
            index = 200;
        }
        else if (level == 4) {
            index = 300;
        }
        else if (level == 5) {
            index = 400;
        }
        // for (i=0; i< words.length; i++) {
        for (i=0; i< 100; i++) {
            sequence = sequence
                .then(function () {
                    // var word = result[index];
                    var word = words[index];
                    var item = word['item'];
                    var itemDesc = word['item_desc'];
                    if (itemDesc == undefined) {
                        itemDesc = "";
                    }
                    console.log("item : " + item + ", desc : " + itemDesc);
                    index++;

                    created = new Date();
                    var newItem = {
                        user_email: email,
                        item: item,
                        item_desc: itemDesc,
                        remember_state: 1,
                        created: created,
                        remembered: created
                    };
                    return createItem(newItem, index);
                });
        }

        sequence
            .then(function() {
                var result = {
                    result: 'success',
                    level:level
                };
                // console.log('result ' +  result);
                res.send(result);
                console.log(">>>>>>> end");
            })
            .catch(function (err) {
                var result = {
                    result: 'fail',
                    reason: err
                };
                // console.log('result ' +  result);
                res.send(result);
            });
    });

});

router.get('/logout',function(req,res){
    delete req.session.user;
    var result = {
        result: 'success',
    };
    console.log('api log out ');
    res.send(result);
});

router.delete("/items/:id", middleware.checkUserItem, function(req, res){
    console.log(">>>> api delete");
    Items.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            var result = {
                result: 'fail',
                reason:err
            };
            res.send(result);
        } else {
            var result = {
                result: 'success'
            };
            res.send(result);
        }
    })
});



router.get("/setting/items/", middleware.isLoggedIn, function (req, res) {
    // var page = req.params.page;
    // var state = req.query.state;
    //
    // console.log("page : " + page);
    // console.log("state : " + state);
    var email = req.session.user.email;
    Items.findItemsWithState(email, function (err, items) {
        if (err) {
            var result = {
                result: 'fail',
                reason: err
            };
//       res.send('item find error : ' + err);
            res.send(result);
        } else {
            var state_1_count = 0;
            var state_2_count = 0;
            var state_3_count = 0;
            var state_4_count = 0;
            var state_5_count = 0;
            var state_999_count = 0;
            var state_total = 0;

            items.forEach(function(value){
                // console.log(value);
                state_total++;
                if (value.remember_state == 1) {
                    state_1_count++;
                }
                else if (value.remember_state == 2) {
                    state_2_count++;
                }
                else if (value.remember_state == 3) {
                    state_3_count++;
                }
                else if (value.remember_state == 4) {
                    state_4_count++;
                }
                else if (value.remember_state == 5) {
                    state_5_count++;
                }
                else if (value.remember_state == 999) {
                    state_999_count++;
                }
            });

            var result = {
                result: 'success',
                state_1_count : state_1_count,
                state_2_count : state_2_count,
                state_3_count : state_3_count,
                state_4_count : state_4_count,
                state_5_count : state_5_count,
                state_999_count : state_999_count,
                state_total : state_total,
            };
            console.log('result ' +  result);
            res.send(result);
        }
    });
});

router.post("/items", middleware.isLoggedIn, function(req, res){
    var email = req.session.user.email;
    var item = req.body.item;
    var itemDesc = req.body.item_desc;

    console.log("item : " + item + ", desc : " + itemDesc);
    created = new Date();
    var newItem = {
        user_email: email,
        item: item,
        item_desc: itemDesc,
        remember_state: 1,
        created: created
    };
    Items.create(newItem, function(err){
        if (err) {
            res.send("create item failed : " + err);
        } else {
            console.log('api successs');
            var result = {
                result: 'success'
            };
            res.send(result);

        }
    });
});

router.get("/items/memorized/:id", middleware.checkUserItem, function (req, res) {
    var id = req.params.id;

    console.log("memorized id : " + id);

    Items.findById(id, function(err, foundItem){
        if (err) {
            var result = {
                result: 'fail',
                err: 'item not found : ' + err
            };
            res.send(result);

        } else {
            if (foundItem) {
                // var result = {
                //     result: 'success',
                //     item: foundItem
                // };
                // console.log('found item ' + foundItem);
                var rememberState = foundItem.remember_state;
                if (rememberState == 1) {
                    rememberState = 2;
                }
                else if (rememberState == 2) {
                    rememberState = 3;
                }
                else if (rememberState == 3) {
                    rememberState = 4;
                }
                else if (rememberState == 4) {
                    rememberState = 5;
                }
                Items.findByIdAndUpdateState(req.params.id, rememberState, function(err){
                    if(err){
                        console.log(err);
                        var result = {
                            result: 'fail',
                            err: err
                        };
                        res.send(result);

                    } else {
                        var result = {
                            result: 'success',
                            id: id
                        };
                        res.send(result);
                    }
                })

            } else {
                var result = {
                    result: 'fail',
                    err: 'item not found'
                };
                res.send(result);

            }


        }

    });




//     console.log("state : " + state);
//     var email = req.session.user.email;
//     var start = 0;
//     var countPerPage = 20;
//     if (page > 1) {
//         console.log("page is greater than 1");
//         start = countPerPage * (page - 1);
//         console.log("start : " + start);
//     }
//     Items.findByPageAndState(email, start, countPerPage, state, function (err, items) {
//         if (err) {
//             var result = {
//                 result: 'fail',
//                 reason: err
//             };
// //       res.send('item find error : ' + err);
//             res.send(result);
//         } else {
//             var result = {
//                 result: 'success',
//                 page: page,
//                 items: items
//             };
//             res.send(result);
//         }
//     });
//   Items.find(email, function(err, items){
//     if (err) {
//       res.send('item find error : ' + err);
//     } else {
//       var result = {
//         result: 'success',
//         items: items
//       };
//       res.render('items/index', result);
//     }
//   });
});

router.get("/items/forgot/:id", middleware.checkUserItem, function (req, res) {
    var id = req.params.id;
    console.log("forgot id : " + id);

    Items.findById(id, function(err, foundItem){
        if (err) {
            var result = {
                result: 'fail',
                err: 'item not found : ' + err
            };
            res.send(result);

        } else {
            if (foundItem) {
                // var result = {
                //     result: 'success',
                //     item: foundItem
                // };
                // console.log('found item ' + foundItem);
                var rememberState = foundItem.remember_state;
                if (rememberState == 5) {
                    rememberState = 1;
                }
                else if (rememberState == 4) {
                    rememberState = 3;
                }
                else if (rememberState == 3) {
                    rememberState = 2;
                }
                else if (rememberState == 2) {
                    rememberState = 1;
                }

                var forgetCount = foundItem.forget_count;
                forgetCount++;

                Items.findByIdAndUpdateStateAndForgetCount(req.params.id, rememberState, forgetCount, function(err){
                    if(err){
                        console.log(err);
                        var result = {
                            result: 'fail',
                            err: err
                        };
                        res.send(result);

                    } else {
                        var result = {
                            result: 'success',
                            id: id
                        };
                        res.send(result);
                    }
                })

            } else {
                var result = {
                    result: 'fail',
                    err: 'item not found'
                };
                res.send(result);

            }


        }

    });
    // Items.findByIdAndUpdateState(req.params.id, 1, function(err){
    //     if(err){
    //         console.log(err);
    //         var result = {
    //             result: 'fail',
    //             err: err
    //         };
    //         res.send(result);
    //
    //     } else {
    //         var result = {
    //             result: 'success',
    //             id: id
    //         };
    //         res.send(result);
    //     }
    // })

//     console.log("state : " + state);
//     var email = req.session.user.email;
//     var start = 0;
//     var countPerPage = 20;
//     if (page > 1) {
//         console.log("page is greater than 1");
//         start = countPerPage * (page - 1);
//         console.log("start : " + start);
//     }
//     Items.findByPageAndState(email, start, countPerPage, state, function (err, items) {
//         if (err) {
//             var result = {
//                 result: 'fail',
//                 reason: err
//             };
// //       res.send('item find error : ' + err);
//             res.send(result);
//         } else {
//             var result = {
//                 result: 'success',
//                 page: page,
//                 items: items
//             };
//             res.send(result);
//         }
//     });
//   Items.find(email, function(err, items){
//     if (err) {
//       res.send('item find error : ' + err);
//     } else {
//       var result = {
//         result: 'success',
//         items: items
//       };
//       res.render('items/index', result);
//     }
//   });
});

router.get("/items/jargon/:id", middleware.checkUserItem, function (req, res) {
    var id = req.params.id;

    console.log("jargon id : " + id);

    Items.findById(id, function(err, foundItem){
        if (err) {
            var result = {
                result: 'fail',
                err: 'item not found : ' + err
            };
            res.send(result);

        } else {
            if (foundItem) {
                // var result = {
                //     result: 'success',
                //     item: foundItem
                // };
                // console.log('found item ' + foundItem);
                var rememberState = 999;
                Items.findByIdAndUpdateState(req.params.id, rememberState, function(err){
                    if(err){
                        console.log(err);
                        var result = {
                            result: 'fail',
                            err: err
                        };
                        res.send(result);

                    } else {
                        var result = {
                            result: 'success',
                            id: id
                        };
                        res.send(result);
                    }
                })

            } else {
                var result = {
                    result: 'fail',
                    err: 'item not found'
                };
                res.send(result);

            }
        }

    });
});

router.get("/items/unjargon/:id", middleware.checkUserItem, function (req, res) {
    var id = req.params.id;

    console.log("unjargon id : " + id);

    Items.findById(id, function(err, foundItem){
        if (err) {
            var result = {
                result: 'fail',
                err: 'item not found : ' + err
            };
            res.send(result);

        } else {
            if (foundItem) {
                // var result = {
                //     result: 'success',
                //     item: foundItem
                // };
                // console.log('found item ' + foundItem);
                var rememberState = 1;
                Items.findByIdAndUpdateState(req.params.id, rememberState, function(err){
                    if(err){
                        console.log(err);
                        var result = {
                            result: 'fail',
                            err: err
                        };
                        res.send(result);

                    } else {
                        var result = {
                            result: 'success',
                            id: id
                        };
                        res.send(result);
                    }
                })

            } else {
                var result = {
                    result: 'fail',
                    err: 'item not found'
                };
                res.send(result);

            }
        }

    });
});


router.get("/stock/test/", function (req, res) {

    created = new Date();
    var newItem = {
        type: 'kospi',
        name: 'test',
        code: '0001',
        current: 1000,
        created: created
    };
//
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
    Items.create(newItem, function(err){
        if (err) {
            // res.send("create item failed : " + err);
            var result = {
                result: 'fail',
                data: err
            };
            // console.log('result ' +  result);
            res.send(result);

        } else {
            var result = {
                result: 'success',
                data: 'test'
            };
            // console.log('result ' +  result);
            res.send(result);
        }
    });
});

router.get("/stock/items/:start", function (req, res) {
    var start = parseInt(req.params.start);
    var countPerPage = parseInt(req.query.count);
    var state = req.query.state;
    var sort = req.query.sort;

    console.log("start : " + start);
    console.log("countPerPage : " + countPerPage);
    console.log("state : " + state);
    console.log("sort : " + sort);
    var email = req.session.user.email;

    Items.findByPage(start, countPerPage, function (err, items) {
        if (err) {
            var result = {
                result: 'fail',
                reason: err
            };
            res.send(result);
        } else {
            var result = {
                result: 'success',
                items: items
            };
            res.send(result);
        }
    });
});

module.exports = router;
