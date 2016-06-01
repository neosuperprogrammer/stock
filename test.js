///**
// * Created by neox on 2/23/16.
// */
//
////var string = 'test';
////console.dir(string.prototype);
////
////▲75)
////S&K폴리텍(091340) : 3,095(▲5)
////SBI액시즈(950110) : 3,370(▼20)
////SBI인베스트먼트(019550) : 554(▼1)
////SBS콘텐츠허브(046140) : 12,000(▼500)
////SCI평가정보(036120) : 1,075(▼20)
//
//var test = '▲5';
//var test2 = '▼500';
//
//var index = test.indexOf('▲');
//console.log(index);
//
//var index = test.indexOf('▼');
//console.log(index);
//
////test.replace('')
////
////var string = "foo",
////    substring = "oo";
////console.log(string.indexOf(substring) > -1);

//function h(z) {
//    // Print stack trace
//    console.log(new Error().stack); // (A)
//}
//function g(y) {
//    h(y + 1); // (B)
//}
//function f(x) {
//    g(x + 1); // (C)
//}
//f(3); // (D)
//return; // (E)

var test = null;
console.log(typeof test);
console.log(test.constructor);
test = undefined;
console.log(typeof test);
console.log(test == undefined);
console.log(test === undefined);
console.log(test == 'undefined');
console.log(test === 'undefined');
console.log(typeof test === 'undefined');
console.log(typeof test == 'undefined');
