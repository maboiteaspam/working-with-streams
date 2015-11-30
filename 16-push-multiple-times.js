
/*
 Demonstrate the effect of pushing multiple times
 before calling `cb(err)`

 */
var demo = function () {

  var len     = 500;

  var fnTransform = function (s){
    return function (chunk, enc, cb) {
      debug('%s %s', s, chunk)
      this.push(chunk)    // that is ok
      this.push(chunk)    // that is ok
      this.push(chunk)    // that is ok
      cb(null);
    };
  };
  var fnFlush = function (s){
    return function (cb) {
      debug('flushing %s', s)
      cb();
    };
  };
  var streamA = through2(fnTransform('streamA'), fnFlush('streamA'));
  var streamB = through2(fnTransform('streamB'), fnFlush('streamB'));

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
