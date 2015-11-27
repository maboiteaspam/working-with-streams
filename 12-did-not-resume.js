
/*
 Demonstrate a not resumed stream behavior.

  One of the most surprising thing when working with streams...
  When you create streams out of nowhere with through2,
  if you don t resume them,
  they ll literally die.
  no joking : )

  As you ll see the stream will never reach the end and just "die" before,
  doing so node "dies" too !!!!!!!!!!!!!!
  Don t even hope about getting a flush or end event.

  The key here is to enter in flowing mode by calling
    stream.resume()

  Pretty much any point in time seems fine.

  see also stream.isPaused() and stream.pause()

 */
var demo = function () {

  var len     = 50000;

  var fnTransform = function (s){
    return function (chunk, enc, cb) {
      debug('%s', chunk)
      cb(null, chunk);
    };
  };
  var fnFlush = function (s){
    return function (cb) {
      debug('flushing %s', s)
      cb();
    };
  };
  var streamA = through2(fnTransform('streamA'), fnFlush('streamA'));

  for(var i=0;i<len;i++){
    streamA.write(''+i);
  }

  streamA.end();
  //streamA.resume();                 // this really matter !
};

// boiler plate stuff for the demo
process.env['DEBUG'] = 'stream';

var debug = require('debug')('stream')
var through2 = require('through2');

demo();
