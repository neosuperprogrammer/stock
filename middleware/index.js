
var Items = require('../model/items');

var contents = {
  checkUserItem: function (req, res, next) {
    if (req.session.user) {
      var userEmail = req.session.user.email;
      Items.findById(req.params.id, function (err, foundItem) {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          if (foundItem) {
            if (foundItem.user_email == userEmail) {
              next();
            } else {
              res.send("You don't have permission to do that!");
            }
          } else {
            res.send("You don't have permission to do that!");
          }
        }
      });
    } else {
      console.log("You need to be signed in to do that!");
      res.redirect("/SignIn");
    }
  },

  isLoggedIn: function (req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash("error", "You must be signed in to do that");
      res.redirect("/SignIn");
    }
  }

};

var exports = module.exports = contents;
