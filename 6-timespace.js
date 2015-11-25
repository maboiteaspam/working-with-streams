
/*
  Simple demo of the time effect on stream transforms.

  In this example streamB is slow, it pushes data with delay.

  The effect is that streamC is also delayed.

  Note;
    - data are always pushed in order,
      streamC last messages are also
      the last messages wrote using streamB.write

 */

var demo = function () {
  // create a new stream instance
  var streamA = through2();
  var streamB = through2(function(chunk, end, cb){
    setTimeout(function () {
      cb(null,chunk);
    }, getRandomArbitrary(5, 1000));
  });
  var streamC = through2();

  streamA.on('data', function (d) {
    debug("streamA data : %s", d)
  });
  streamB.on('data', function (d) {
    debug("streamB data : %s", d)
  });
  streamC.on('data', function (d) {
    debug("streamC data : %s", d)
  });

  // pipe streamA to streamB
  streamA.pipe(streamB);

  // pipe streamB to streamC
  streamB.pipe(streamC);

  // write as many data as you want
  for(var i=0;i<15;i++){
    streamA.write(''+i);
  }

  streamB.write('message to B and C');

  // When it s all done, end the stream to invoke its flush transforms.
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