///**
// * Created by neox on 2/26/16.
// */
//var MongoClient = require('mongodb').MongoClient;
//var demoPerson = { name: 'John', lastName: 'Smith' };
//var findKey = { name: 'John' };
//MongoClient.connect('mongodb://127.0.0.1:27017/demo', function (err, db) { if (err) throw err;
//    console.log('Successfully connected');
//    var collection = db.collection('people'); collection.insert(demoPerson, function (err, docs) {
//        console.log('Inserted', docs[0]); console.log('ID:', demoPerson._id);
//        collection.find(findKey).toArray(function (err, results) { console.log('Found results:', results);
//            collection.remove(findKey, function (err, results) { console.log('Deleted person');
//                db.close();
//            }); });
//    }); });


//var MongoClient = require('mongodb').MongoClient;
//var demoPerson = { name: 'John', lastName: 'Smith' };
//var findKey = { name: 'John' };
//MongoClient.connect('mongodb://127.0.0.1:27017/demo', function (err, db) {
//    if (err) throw err;
//    var collection = db.collection('people');
//    collection.insert(demoPerson, function (err, docs) {
//        demoPerson.lastName = 'Martin';
//        demoPerson.test = 'test';
//        collection.save(demoPerson, function (err) {
//            console.log('Updated');
//            collection.find(findKey).toArray(function (err, results) {
//                console.log(results);
//// cleanup
//                collection.drop(function () { db.close() });
//            });
//        }); });
//});

//var MongoClient = require('mongodb').MongoClient;
//var website = {
//    url: 'http://www.google.com',
//    visits: 0
//};
//var findKey = {
//    url: 'http://www.google.com'
//};
//MongoClient.connect('mongodb://127.0.0.1:27017/demo', function (err, db) {
//    if (err) throw err;
//    var collection = db.collection('websites');
//    collection.insert(website, function (err, docs) {
//        var done = 0;
//        function onDone(err) {
//            done++;
//            if (done < 4) return;
//            collection.find(findKey).toArray(function (err, results) { console.log('Visits:', results[0].visits); // 4
//// cleanup
//                collection.drop(function () { db.close() });
//            });
//        }
//        var incrementVisits = { '$inc': { 'visits': 1 } }; collection.update(findKey, incrementVisits, onDone); collection.update(findKey, incrementVisits, onDone); collection.update(findKey, incrementVisits, onDone); collection.update(findKey, incrementVisits, onDone);
//    }); });


var mongoose = require('mongoose');
// Define a schema
var tankSchema = new mongoose.Schema({ name: 'string', size: 'string' });
tankSchema.methods.print = function () { console.log('I am', this.name, 'the', this.size); };
// Compile it into a model
var Tank = mongoose.model('Tank', tankSchema);
mongoose.connect('mongodb://127.0.0.1:27017/demo');
var db = mongoose.connection;
db.once('open', function callback() {
    console.log('connected!');

    // Use the model
    var tony = new Tank({ name: 'tony', size: 'small' });
    tony.print(); // I am tony the small
    tony.save(function (err) {
        Tank.findOne({ name: 'tony' }).exec(function (err, tank) {
            // You get a model instance all setup and ready!
            tank.print();
            db.close();
            //db.collection('tanks').drop(function () { db.close();})
        });
    }); });
