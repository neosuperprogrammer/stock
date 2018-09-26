var express   = require("express"),
    router    = express.Router();
var User = require('../model/user.js');

var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();


router.get("/", function(req, res){
    console.log('landing');
    if (req.session.user) {
        console.log(req.session.user);
        res.redirect("/items");
    } else {
        res.render("landing");
    }
});

router.get("/SignUp", function(req, res){
    console.log('sign up');
    res.render("signup");
});

router.post("/SignUp", function(req, res){
    console.log('sign up post');
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    console.log('email : ' + email + ', username : ' + username + ', password : ' + password);
    if (User.findOne(email, function (err, user) {
            if (err) {
                res.send(err);
            } else if (user) {
                res.send('user already exists');
            } else {
                hasher({password:password}, function(err, pass, salt, hash){
                    var newUser = {
                        email: email,
                        username: username,
                        hash: hash,
                        salt: salt,
                        granted: 'yes'
                    };
                    User.create(newUser, function(err){
                        if (err) {
                            res.send(err);
                        } else {
                            req.session.user = newUser;
                            res.redirect('/items');
                        }
                    });
                });
            }
        }));
});

router.get("/SignIn", function(req, res){
    console.log('log in');
    res.render("signin");
});

router.post("/SignIn", function(req, res){
    console.log('sign up post');
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    console.log('email : ' + email + ', username : ' + username + ', password : ' + password);
    if (User.findOne(email, function (err, user) {
            if (err) {

                res.send(err);
            } else if (user) {
                hasher({password:password, salt:user.salt}, function(err, pass, salt, hash){
                    if (hash == user.hash) {
                        req.session.user = user;
                        var hour = 3600 * 1000;
                        var day = 24 * hour;
                        var year = 365 * day;
                        req.session.cookie.expires = new Date(Date.now() + year);
                        req.session.cookie.maxAge = year;
                        res.redirect('/items');
                    } else {
                        res.send('password is wrong')
                    }
                });
            } else {
                res.send('user not exists');
            }
        }));
});

router.get('/LogOut',function(req,res){
    delete req.session.user;
    res.redirect('/');
});


router.get("/Setting", function(req, res){
    console.log('Setting');
    res.sendFile('public/html/setting.html', {root: '.'});

});


module.exports = router;
