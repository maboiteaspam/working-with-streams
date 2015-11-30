
/*
 Demonstrate try catch behavior in a stream

 in short, avoid try-catch surrounding cb(null, chunk) or push(chunk),
 it will pop the exception of down transforms into the current transform
 and point the stack trace to the try-catch, totally useless for debug.

 */
var demo = function () {

  var len     = 500;

  var fnTransformCatch = function (s){
    return function (chunk, enc, cb) {
      debug('%s %s', s, chunk)
      try{
        console.log('                 try')
        cb(null, chunk);              // note: the stack report about here,
                                      // totally mistaking.
      }catch(ex){
        console.log('                 catch')
        cb(null, chunk);              // that is not ok.
      }
    };
  };
  var fnTransformThrow = function (s){
    return function (chunk, enc, cb) {
      debug('%s %s', s, chunk)
      console.log('                    throw')
      throw 'boom'
      cb(null, chunk);
    };
  };
  var fnFlush = function (s){
    return function (cb) {
      debug('flushing %s', s)
      cb();
    };
  };
  var streamA = through2(fnTransformCatch('streamA'), fnFlush('streamA'));
  var streamB = through2(fnTransformThrow('streamB'), fnFlush('streamB'));

  streamA.pipe(streamB)

  for(var i=0;i<len;i++){
    streamA.write(''+i);
  }

  streamA.end();
  streamA.resume();
  streamB.resume();
};

// boiler plate stuff for the demo
process.env['DEBUG'] = 'stream';

var debug = require('debug')('stream')
var through2 = require('through2');

demo();
