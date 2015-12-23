
/*
  Before you read that one, ensure you read 18.


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

  }, 1100)


};

// boiler plate stuff for the demo
process.env['DEBUG'] = 'stream';

var debug = require('debug')('stream')
var through2 = require('through2');

demo();

// got it ?
