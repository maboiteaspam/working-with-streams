
/*
  Demonstrate [pull then push] effect on the stream
    to compare with 8-push-then-pull

  When you pull then push data,
    Note
      - how streamA receives all data at first,
        then starts to push down.
      - that you must declare flush function
      - the flush fn function must pend the stream until a push can occur



 */

var demo = function () {
  var touts = {};
  var doSomeLongProcess = function (i, s, then) {
    if(!touts[s]) touts[s] = []
    touts[s].push(setTimeout(function(){
      touts[s].shift();
      debug('%s jobs %s', s, touts[s].length);
      then();
    }, i*1000));
  };
  var fnTransform = function (s){
    return function (chunk, enc, cb) {
      debug('%s received %s', s, chunk);
      var that = this;
      doSomeLongProcess(chunk, s, function () {
        debug('%s push %s', s, chunk);
        if(s.match(/A$/)) debug('=== %s processing start ===', s)
        that.push(chunk)
        if(s.match(/C$/)) debug('=== %s processing done ===', s)
      });
      cb(null);
    };
  };
  var fnFlush = function (s){
    return function (cb) {
      var waitForThemToFinish = function () {
        if(!touts[s]) cb();
        else if(!touts[s].length) {
          debug('========= %s flush finish', s);
          cb();
        } else setTimeout(waitForThemToFinish, 10);
      };
      debug('========= %s flush start', s);
      waitForThemToFinish();
    };
  };
  var fnEnd = function (s){
    return function () {
      debug('%s end !', s);
    };
  };
  // create a new stream instance
  var streamA = through2(fnTransform('streamA'), fnFlush('streamA'));
  var streamB = through2(fnTransform('streamB'), fnFlush('streamB'));
  var streamC = through2(fnTransform('streamC'), fnFlush('streamC'));

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

  streamA.end();
};

// boiler plate stuff for the demo
process.env['DEBUG'] = 'stream';

var debug = require('debug')('stream')
var through2 = require('through2');

demo();

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}