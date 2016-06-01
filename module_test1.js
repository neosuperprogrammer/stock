/**
 * Created by neox on 2/29/16.
 */

//module.exports = {
//    test: '1',
//    test2: function () {
//        console.log('test');
//    }
//};


(function () {

    //console.log(this);
    var root = this;

    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) {
        console.log('get called : ' + typeof this);
        if (this instanceof _) {
            console.log('instance of _');
        }
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object.
    if (typeof exports !== 'undefined') {
        console.log('typeof exports' + typeof exports)
        if (typeof module !== 'undefined' && module.exports) {
            console.log('typeof module' + typeof module)
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        console.log('typeof exports' + typeof exports)
        root._ = _;
    }

    var test1 = function () {
        console.log('test1');
    };

    _.test2 = function () {
        test1();
    }



}.call(this));