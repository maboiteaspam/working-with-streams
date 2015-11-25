
/*
  Same as previous, but this time
  it shows up the effect of a
  stream without error handler.

  Note:
    - as you can see from the output the error handler is executed after the push,
      as aq result streamC transform has time to occur before the program dies.
 */

var demo = function () {
  // create a new stream instance
  var streamA = through2();
  var streamB = through2(function(chunk, end, cb){cb((String(chunk)==='b'?'boom!':null),chunk);});
  var streamC = through2();

  streamA.on('error', function (d) {
    debug("streamA error : %s", d)
  });

  //streamB.on('error', function (d) {
  //  debug("streamB error : %s", d)
  //});

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
