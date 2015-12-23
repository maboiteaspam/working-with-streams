
/*
  Before you read that ont, ensure you read 18.

  Demonstrate .carryon Vs .pipe



 */
var demo = function () {


  var pipedSource = through2();
  var piped2Sink = pipedSource.pipe(through2(function (c,e,n){
    console.log('pipedSource 1 start')
    setTimeout(function () {
      console.log('pipedSource 1')
      n(null,c)
    }, 500)
  })).pipe(through2(function (c,e,n){
    console.log('pipedSource 2 start')
    setTimeout(function () {
      console.log('pipedSource 2')
      n(null,c)
    }, 500)
  })).pipe(through2(function (c,e,n){
    console.log('pipedSource 3')
    n(null,c)
  }))

  pipedSource.write('does not matter')


  setTimeout(function () {

    console.log(' ')
    console.log(' ')
    piped2Sink.write('does not matter')


    setTimeout(function () {

      console.log(' ')
      console.log(' ')

      var carriedOnStream = cStream();
      carriedOnStream.carryon(cStream(function (c,e,n){
        console.log('carryon 1 start')
        setTimeout(function () {
          console.log('carryon 1')
          n(null,c)
        }, 500)
      })).carryon(cStream(function (c,e,n){
        console.log('carryon 2 start')
        setTimeout(function () {
          console.log('carryon 2')
          n(null,c)
        }, 500)
      })).carryon(cStream(function (c,e,n){
        console.log('carryon 3')
        n(null,c)
      })).write('does not matter')

    }, 2100)


  }, 1100)


};

// boiler plate stuff for the demo
process.env['DEBUG'] = 'stream';

var debug = require('debug')('stream')
var through2 = require('through2');

function cStream(fnT, fnF){
  var s = through2(fnT, fnF)
  s.carryon = function (B) {
    this.pipe(B)
    return this
  };
  return s;
}

demo();

// got it ?
