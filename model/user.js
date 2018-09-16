var mysql = require('mysql');

var conn = mysql.createConnection({
  host: "localhost",
  user: "flowgrammer",
  password: "qwer1234",
  database: "remember_it"

});

conn.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + conn.threadId);
});

var contents = {
  findOne: function(email, done) {
    conn.query('select * from users where email = ?', [email], function(err, result){
      if (err){
        console.log(err);
        //req.flash({'error':err.message});
        done(err);
      } else {
        if (result.length > 0) {
          //req.flash({'error':'user already exists'});
          done(err, result[0])
        } else {
          done(err)
        }
      }
    });
  },
  create: function(newUser, done) {
    conn.query('insert into users set ?', newUser, function(err, result){
      if (err) {
        console.log(err);
        done(err);
      } else {
        console.log(result);
        done(null);
      }
    });
  }
};

module.exports = contents;

