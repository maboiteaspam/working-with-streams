
/*
  Demonstrate the effect of declaring flush function.

  Let s recall that through2 signature is +/-
    through2(fnTransform, fnFlush)

  fnFlush is called if, and only if, stream.end() is called.
    Not doing so is much like having infinite stream.

 */

var demo = function () {
  // create a new stream instance
  var streamA = through2(
    function (chunk,enc,cb) {debug('streamA transform %s', chunk);cb(null, chunk)},
  function (cb) {debug('streamA flush !');setTimeout(cb, 500)} // streamA takes time to flush.
  );
  var streamB = through2(
    function (chunk,enc,cb) {debug('streamB transform %s', chunk);cb(null, chunk)},
    function (cb) {debug('streamB flush !');cb(null);}
  );
  var streamC = through2(
    function (chunk,enc,cb) {debug('streamC transform %s', chunk);cb(null, chunk)},
    function (cb) {debug('streamC flush !');setTimeout(cb, 1500)} // streamC takes time to flush.
  );

  streamA.on('end', function () {
    debug('streamA done !')
  });

  streamB.on('end', function () {
    debug('streamB done !')
  });

  streamC.on('end', function () {
    debug('streamC done !') // note this handler not called, not sure why.
  });

  // pipe streamA to streamB
  streamA.pipe(streamB);

  // pipe streamB to streamC
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