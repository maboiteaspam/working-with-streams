
/*
  Demonstrate error events

  It declares 3 streams
    streamA
      -> streamB
        -> streamC

  It connects 'error' events of each stream.

 streamB will explode when it receives 'b' message.
 Although, the error is caught and forwarded to 'error' handler.
 This has two interesting behaviors,
    The error won t blow up the program
    The data is still streamed down to streamC for further processing.

 Notes:
  - error handler has to be attached for each stream.
  - not binding error handler would let error blow up the program

 */

var demo = function () {
  // create a new stream instance
  var streamA = through2();
  var streamB = through2(function(chunk, end, cb){cb((String(chunk)==='b'?'boom!':null),chunk);});
  var streamC = through2();

  streamA.on('error', function (d) {
    debug("streamA error : %s", d)
  });

  streamB.on('error', function (d) {
    debug("streamB error : %s", d)
  });

  streamC.on('error', function (d) {
    debug("streamC error : %s", d)
  });

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
