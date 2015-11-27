
/*
 Demonstrate the error that triggers
 when `stream.push(chunk)` is called after `cb(err, chunk)`

  Symptom is

     throw er; // Unhandled 'error' event
     ^
     Error: stream.push() after EOF


  The solution is simple, fix the code.

    `cb(err,chunk)` must not be called after any `stream.push(chunk)` !

 */
var demo = function () {

  var len     = 50000;

  var fnTransform = function (s){
    return function (chunk, enc, cb) {
      debug('%s', chunk)
      cb(null);
      this.push(chunk)    // nop that is not ok !
    };
  };
  var fnFlush = function (s){
    return function (cb) {
      debug('flushing %s', s)
      cb();
    };
  };
  var streamA = through2(fnTransform('streamA'), fnFlush('streamA'));

  for(var i=0;i<len;i++){
    streamA.write(''+i);
  }

  streamA.end();
  streamA.resume();
};

// boiler plate stuff for the demo
process.env['DEBUG'] = 'stream';

var debug = require('debug')('stream')
var through2 = require('through2');

demo();
