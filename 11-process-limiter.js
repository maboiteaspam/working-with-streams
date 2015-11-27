
/*
 Demonstrate process limiting

  the streams receives lots of data,
  but process at constant rate.

  Run it to visualize the results with multimeter process bars.

  Then play with it to see how the behavior can be changed.


 */

var demo = function () {

  var meter = new StreamMeter();
  meter.start();

  var len     = 500;
  var touts   = {};
  var pend    = {};
  var finished = {};
  var k       = 1;
  var rate    = 50;

  var doSomeLongProcess = function (i, s, then) {
    if(!touts[s]) touts[s] = []
    if(!finished[s]) finished[s] = 0
    touts[s].push(setTimeout(function(){
      touts[s].shift()
      finished[s]++;
      then();
    }, getRandomArbitrary(100*k, 1000+100*k)) );
  };

  var fnTransform = function (s){
    k++
    return function (chunk, enc, cb) {                // For each chunk
      var that = this;
      if(touts[s] && touts[s].length>=rate) {         // If the rate exceed
        if(!pend[s]) pend[s] = []
        pend[s].push(function () {                    // Store a function to pend the process
          doSomeLongProcess(chunk, s, function () {   // that is slow.
            if(pend[s].length) pend[s].shift()();     // Takes first pend process, run it,
            that.push(chunk)                          // push the data down.
          });
          cb(null);                                   // Pull new one, as this process is queued
        })
      } else {                                        // Else
        doSomeLongProcess(chunk, s, function () {     // Run a slow process, immediately.
          if(pend[s] && pend[s].length)
            pend[s].shift()();                        // Takes first pend process, run it,
          that.push(chunk)                            // push the data down.
        });
        cb(null);                                     // Pull new item immediately
      }
    };
  };
  var fnFlush = function (s){                         // Note: Flush must not end before the transform !!
    return function (cb) {
      var waitForThemToFinish = function () {         // it must wait for the end of the jobs. It could also abort.
        if(!touts[s]) cb();
        else if(!touts[s].length) cb()                // continue the flush if pend process is empty.
        else setTimeout(waitForThemToFinish, 10);     // re-call until all process has ended.
      };
      waitForThemToFinish();                          // Enter a wait loop. Note: flush is called once, normally, i guess.
    };
  };
  var fnEnd = function (s){
    return function () {
    };
  };
  var fnProgress = function (stream, s){
    var receivedBar = meter.add(s+' received     ');
    var currentBar = meter.add(s+' length       ');
    var doneBar = meter.add(s+' done         ');
    stream.on('data', function () {
      receivedBar.progress++;
      receivedBar.percent(receivedBar.progress/len*100, receivedBar.progress+'');
      currentBar.percent(touts[s].length/len*100, touts[s].length+'');
      var done = finished[s];
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