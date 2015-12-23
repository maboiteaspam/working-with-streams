
/*
  Before you read that ont, ensure you read 18 && 19.


 */
var demo = function () {


  var A = hello('A');
  var B = hello('B');
  var C = hello('C');
  var D = hello('D');

  A.pipe(B.pipe(C)).pipe(D)


  A.write('whatever');

  setTimeout(function () {

    console.log('')
    console.log('')
    var A = cStream('A1');
    var B = cStream('B1');
    var C = cStream('C1');
    var D = cStream('D1');
    var E = cStream('E1');
    var F = cStream('F1');

    A.pipe(
      B.carryon(C).carryon(D).carryon(E)
    ).carryon(F)


    A.write('whatever')


    setTimeout(function () {

      console.log('')
      console.log('one more time')
      console.log('')
      var A = cStream('A2');
      var B = cStream('B2');
      var C = cStream('C2');
      var D = cStream('D2');
      var E = cStream('E2');
      var F = cStream('F2');

      A.carryon(
        B.carryon(C).carryon(D).carryon(E)
      ).carryon(F).write('whatever')

    }, 2000)

  }, 1100)

};

// boiler plate stuff for the demo
process.env['DEBUG'] = 'stream';

var debug = require('debug')('stream')
var through2 = require('through2');
function hello (name) {
  return through2(function(c,e,n){
    process.stdout.write(' [' + name + '')
    setTimeout(function () {
      process.stdout.write('' + '' + ']')
      n(null, c)
    }, 250)
})}


function cStream(name){
  var s = hello(name)
  s.carryon = function (B) {
    this.pipe(B)
    return this
  };
  return s;
}

demo();
