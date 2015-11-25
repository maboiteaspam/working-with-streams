
/*
  Demonstrate [push then pull] effect on the stream
    to compare with 9-pull-then-push

 */

var demo = function () {
  var fnTransform = function (s){
    return function (chunk, enc, cb) {
      if(s.match(/A$/)) debug('=== stream processing start ===')
      debug('%s > push %s', s, chunk);
      this.push(chunk)
      if(s.match(/C$/)) debug('=== stream processing done ===')
      debug('%s < call to pull from %s', s, chunk);
      cb(null);
    };
  };
  var fnFlush = function (s){
    return function (cb) {
      debug('%s flush', s);
      cb(null);
    };
  };
  var fnEnd = function (s){
    return function () {
      debug('%s done !', s);
    };
  };
  // create a new stream instance
  var streamA = through2(fnTransform('streamA', fnFlush('streamA')));
  var streamB = through2(fnTransform('streamB', fnFlush('streamB')));
  var streamC = through2(fnTransform('streamC', fnFlush('streamC')));

  streamA.on('end', fnEnd('streamA'));
  streamB.on('end', fnEnd('streamB'));
  streamC.on('end', fnEnd('streamC'));

  // pipe streamA to streamB
  streamA.pipe(streamB);
  streamB.pipe(streamC);

  // write as many data as you want
  for(var i=0;i<5;i++){
    streamA.write(''+i);
  }

  streamB.write('message to B and C');

  streamA.end(); // if you do nt call end(), flush function does not occur, end event neither.
};

// boiler plate stuff for the demo
process.env['DEBUG'] = 'stream';

var debug = require('debug')('stream')
var through2 = require('through2');

demo();

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}