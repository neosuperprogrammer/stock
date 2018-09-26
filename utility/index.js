var _ = require('underscore');
var request = require('request');
// var cheerio = require('cheerio');
// var iconv = require('iconv-lite');
// var Iconv = require('iconv').Iconv;
var Promise = require('bluebird');
var XLSX = require('xlsx');
var path = require('path');

function getUrlContents(requestOption) {
    return new Promise(function (resolve, reject) {
        request(requestOption, function (error, response, body) {
            if (error) {
                reject(error);
                return;
            }
            // console.log(body);
            // body = new Buffer(body, 'binary');
            // iconv2 = new Iconv('euc-kr', 'UTF8');
            // var utf8String = iconv2.convert(body).toString();
            //console.log(utf8String);
            // var loaded = cheerio.load(utf8String);
            resolve(body);
        });
    });
};

function to_json(workbook) {
    var result = {};
    workbook.SheetNames.forEach(function (sheetName) {
        var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if (roa.length > 0) {
            result[sheetName] = roa;
        }
    });
    return result;
}

function getElementayListWithSheeData(sheetData, result, callback) {
	var maximum_number = 0;
    sheetData.forEach(function (translate) {
        var number = translate['__EMPTY'];
        var item = translate['__EMPTY_1'];
        var item_desc = translate['__EMPTY_2'];
        if (!isNaN(number)) {
            number *= 1;
            result[number] = {item : item, item_desc : item_desc};
            if (number > maximum_number) {
                maximum_number = number;
            }
        }

        number = translate['__EMPTY_4'];
        item = translate['__EMPTY_5'];
        item_desc = translate['__EMPTY_6'];
        if (!isNaN(number)) {
            number *= 1;
            result[number] = {item : item, item_desc : item_desc};
            if (number > maximum_number) {
                maximum_number = number;
            }

        }

        number = translate['__EMPTY_8'];
        item = translate['__EMPTY_9'];
        item_desc = translate['__EMPTY_10'];
        if (!isNaN(number)) {
            number *= 1;
            result[number] = {item : item, item_desc : item_desc};
            if (number > maximum_number) {
                maximum_number = number;
            }

        }

        number = translate['__EMPTY_12'];
        item = translate['__EMPTY_13'];
        item_desc = translate['__EMPTY_14'];
        if (!isNaN(number)) {
            number *= 1;
            result[number] = {item : item, item_desc : item_desc};
            if (number > maximum_number) {
                maximum_number = number;
            }

        }

        number = translate['__EMPTY_16'];
        item = translate['__EMPTY_17'];
        item_desc = translate['__EMPTY_18'];
        if (!isNaN(number)) {
            number *= 1;
            result[number] = {item : item, item_desc : item_desc};
            if (number > maximum_number) {
                maximum_number = number;
            }

        }

        number = translate['__EMPTY_20'];
        item = translate['__EMPTY_21'];
        item_desc = translate['__EMPTY_22'];
        if (!isNaN(number)) {
            number *= 1;
            result[number] = {item : item, item_desc : item_desc};
            if (number > maximum_number) {
                maximum_number = number;
            }

        }

    });

    callback(maximum_number, result);

}

function getElementaryList(filePath, callback) {
    // filePath = path.join(__dirname, 'test.xls');
    var workbook = XLSX.readFile(filePath);
    // console.log('workbook : ' + workbook.SheetNames);
    var first_sheet_name = workbook.SheetNames[0];
    var translate_data = to_json(workbook)[first_sheet_name];
    // console.log(translate_data);
    var result = {};
    var maximum_number = 0;
    getElementayListWithSheeData(translate_data, result, function (maximumNumber, result) {
        maximum_number = maximumNumber;
    });

    var second_sheet_name = workbook.SheetNames[1];
    translate_data = to_json(workbook)[second_sheet_name];
    console.log(translate_data);

    getElementayListWithSheeData(translate_data, result, function (maximumNumber, result) {
        maximum_number = maximumNumber;
    });

    console.log('maximum : ' + maximum_number);
    // console.log(result);
    callback(maximum_number, result);
    // return result;

}

var contents = {
	loadElementaryListWithLevel: function (level, callback) {
        filePath = path.join(__dirname, 'test.xls');
        getElementaryList(filePath, callback);
    },
    requestUrlContents: function (url, callback) {
        var requestOptions = {
            encoding: null,
            method: "GET",
            // json: true,
            uri: url
        };
        getUrlContents(requestOptions)
            .then(function (loaded) {
                callback(loaded, null);
            })
            .
            catch(function (err) {
                console.log(err);
                callback(null, err);
            });
    }
};

var exports = module.exports = contents;
