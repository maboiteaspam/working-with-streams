
/*
 Demonstrate process limiting

  the streams receives lots of data,
  but process at constant rate.


 */

var demo = function () {

  var meter = new StreamMeter();
  meter.start();

  var len     = 50;
  var width   = 90;
  var touts   = {};
  var pend    = {};
  var k       = 1;
  var rate    = 2;

  var doSomeLongProcess = function (i, s, then) {
    if(!touts[s]) touts[s] = []
    touts[s].push(setTimeout(function(){
      touts[s].shift()
      then();
    }, getRandomArbitrary(100*k, 1000+100*k)) );
  };

  var fnTransform = function (s){
    k++
    return function (chunk, enc, cb) {
      var that = this;
      if(touts[s] && touts[s].length>=rate) {               // rate exceeded
        if(!pend[s]) pend[s] = []
        pend[s].push(function () {                          // store a function to pend the process
          doSomeLongProcess(chunk, s, function () {
            if(pend[s].length) pend[s].shift()();           // takes first pend process, run it
            that.push(chunk)                                // push the data down
          });
          cb(null);                                         // pull new one, as this process is queued
        })
      } else {
        doSomeLongProcess(chunk, s, function () {
          if(pend[s] && pend[s].length) pend[s].shift()();  // takes first pend process, run it
          that.push(chunk)                                  // push the data down
        });
        cb(null);                                           // it pools immediately
      }
    };
  };
  var fnFlush = function (s){                               // flush must not end before the transform !!
    return function (cb) {
      var waitForThemToFinish = function () {
        if(!touts[s]) cb();
        else if(!touts[s].length) cb()
        else setTimeout(waitForThemToFinish, 10);           // re-call until all process has ended
      };
      waitForThemToFinish();                                // flush is called once, normally, i guess.
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
      currentBar.percent(touts[s].length/width*100, touts[s].length+'');
    });
    var doneBar = meter.add(s+' done         ');
    stream.on('data', function () {
      var done = receivedBar.progress-touts[s].length;
      done = done<0?0:done;
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