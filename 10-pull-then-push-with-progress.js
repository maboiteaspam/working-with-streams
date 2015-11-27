
/*
  Demonstrate [pull then push] effect on the stream
    to compare with 8-push-then-pull

  This time let s use some progress to visualize the resulting behavior.

  You know what ? Play with it yourself.
  I admit i still need to figure out few things....


 */

var demo = function () {

  var meter = new StreamMeter();
  meter.start();

  var len = 500;
  var touts = {};
  var finished = {};
  var k = 1;
  var doSomeLongProcess = function (i, s, then) {
    if(!touts[s]) touts[s] = []
    if(!finished[s]) finished[s] = 0
    touts[s].push(setTimeout(function(){
      touts[s].shift()
      finished[s]++
      then();
    }, getRandomArbitrary(500*k, 500*k*2) +i*100) );
  };
  var fnTransform = function (s){
    k++
    return function (chunk, enc, cb) {
      var that = this;
      doSomeLongProcess(chunk, s, function () {
        that.push(chunk)
        //cb(null, chunk);
      });
      cb(null);
    };
  };
  var fnFlush = function (s){
    return function (cb) {
      var waitForThemToFinish = function () {
        if(!touts[s]) cb();
        else if(!touts[s].length) cb()
        else setTimeout(waitForThemToFinish, 10);
      };
      waitForThemToFinish();
    };
  };
  var fnEnd = function (s){
    return function () {
    };
  };
  var fnProgress = function (stream, s){
    var receivedBar = meter.add(s+' received     ');
    stream.on('data', function () {
      receivedBar.progress++;
      receivedBar.percent(receivedBar.progress/len*100, receivedBar.progress+'');
    });
    var currentBar = meter.add(s+' length       ');
    stream.on('data', function () {
      currentBar.percent(touts[s].length/len*100, touts[s].length+'');
    });
    var doneBar = meter.add(s+' done         ');
    stream.on('data', function () {
      var done = finished[s] || 0;
      doneBar.percent(done/len*100, done+'');
    });
  };
  // create a new stream instance
  var streamA = through2(fnTransform('streamA'), fnFlush('streamA'));
  var streamB = through2(fnTransform('streamB'), fnFlush('streamB'));
  var streamC = through2(fnTransform('streamC'), fnFlush('streamC'));
  var streamD = through2();

  streamA.on('end', fnEnd('streamA'));
  streamB.on('end', fnEnd('streamB'));
  streamC.on('end', fnEnd('streamC'));
  streamD.on('end', fnEnd('streamD'));

  // pipe streamA to streamB
  streamA.pipe(streamB);
  streamB.pipe(streamC);
  streamC.pipe(streamD);

  //-
  fnProgress(streamA, 'streamA')
  fnProgress(streamB, 'streamB')
  fnProgress(streamC, 'streamC')

  streamC.on('end', function () {
    setTimeout(function (){
      meter.end();
    }, 500)
  })

  // write as many data as you want
  for(var i=0;i<len;i++){
    streamA.write(''+i);
  }

  streamA.end();
};

// boiler plate stuff for the demo
var through2 = require('through2');
var StreamMeter = require('./lib/stream-meter');

demo();

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}