
/*
  most minimal example

  Describe and show common operations of stream.

    through2(): to create stream objects.
    pipe: to connect two streams.
    stream.push(): to push data downstream
    cb(): to pull data upstream
    write(): to enable the stream
    end(): to close and finish a stream, flush.

 */

var demo = function () {
  // create a new stream instance
  var stream = through2();

  // pipe connects to stream a new stream transforms
  stream.pipe(
    through2(function(chunk, end, cb){  // the stream transform receive objects
      streamReceived(chunk)             // process them
      this.push(chunk)                  // push forward in the stream the data
      cb(null)                          // pull a new data in the stream
    })
  ).pipe(
    through2(function(chunk, end, cb){
      chunk = 'b';                      // this is a simplistic transform.
      streamSent(chunk)                 // following transforms will now process b
      cb(null, chunk)                   // cb(err, data) push data && pull new one from the stream.
    })
  ).pipe(
    through2(function(chunk, end, cb){
      console.log(''+chunk)
      cb(null, chunk)
    })
  );

  // write as many data as you want
  stream.write('a');
  stream.write('b');
  stream.write('c');


  // When it s all done, end the stream to invoke its flush transforms.
  stream.end();
};

// boiler plate stuff for the demo
process.env['DEBUG'] = 'stream';

var debug = require('debug')('stream')
var through2 = require('through2');

var streamReceived = function (d) {
  debug("received : %s", d)
};
var streamSent = function (d) {
  debug("               sent : %s", d)
};
demo();
