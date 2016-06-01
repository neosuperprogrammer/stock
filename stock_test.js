/**
 * Created by neox on 2/22/16.
 */

var fs = require('fs');
var _ = require('underscore');
var xml2js = require('xml2js');
var XLSX = require('xlsx');

(function () {

    function toJson(workbook) {
        var result = {};
        workbook.SheetNames.forEach(function (sheetName) {
            //console.log(sheetName);
            var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            if (roa.length > 0) {
                result[sheetName] = roa;
            }
        });
        return result;
    }

    var kospiList = [];
    var kosdaqList = [];

    function loadKRXInfo(excelPath, list) {
        var workbook = XLSX.readFile(excelPath);
        var json = toJson(workbook);
        //console.log(json);

        json['Sheet1'].forEach(function (data) {
            list.push({'code':data['종목코드'], 'data':data})
            //console.log(data);
        });
    }

    loadKRXInfo(__dirname + '/kospi.xls', kospiList);
    //console.log(kospiList);

    loadKRXInfo(__dirname + '/kosdaq.xls', kosdaqList);
    //console.log(kosdaqList);

    _.each(kospiList, function(data) {
        if (data['data']['기업명'] == '포스코') {
            console.log(data);
        }
        else {
            //console.log(data['data']['기업명']);
        }
    });

})();

