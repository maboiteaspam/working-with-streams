
/*
  Demonstrate data events

  It declares 3 streams
    streamA
      -> streamB
        -> streamC

  It connects 'data' events of each stream.

  Write to streamA, streamB.

  As you ll see writing to streamB
    writes to streamC too: it bubbles down to streamC through streamB.
    Writing to streamA bubble down to both B and C streams.
 */

var demo = function () {
  // create a new stream instance
  var streamA = through2();
  var streamB = through2();
  var streamC = through2();

  streamA.on('data', function (d) {
    debug("streamA received : %s", d)
  });

  streamB.on('data', function (d) {
    debug("streamB received : %s", d)
  });

  streamC.on('data', function (d) {
    debug("streamC received : %s", d)
  });

  // pipe streamA to streamB
  streamA.pipe(streamB);

  // pipe streamB to streamC
  streamB.pipe(streamC);

  // write as many data as you want
  streamA.write('a');
  streamA.write('b');
  streamA.write('c');


  streamB.write('message to B and C');


  // When it s all done, end the stream to invoke its flush transforms.
  streamA.end();
};

// boiler plate stuff for the demo
process.env['DEBUG'] = 'stream';

var debug = require('debug')('stream')
var through2 = require('through2');

demo();
