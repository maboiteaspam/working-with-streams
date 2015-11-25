
/*
  Demonstrate [pull then push] effect on the stream
    to compare with 8-push-then-pull

  This time let s use some progress to visualize the resulting behavior.

  You know what ? Play with it yourself.
  I admit i still need to figure out few things....


 */

var demo = function () {
  var touts = {};
  var k = 1;
  var doSomeLongProcess = function (i, s, then) {
    if(!touts[s]) touts[s] = []
    touts[s].push(setTimeout(function(){
      touts[s].shift()
      then();
    }, (k===2?2:getRandomArbitrary(100*k, 1000) + i *250)) );
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
  var bars = [];
  var colors = ['blue', 'yellow', 'cyan'];
  colors = colors.concat(colors)
  colors = colors.concat(colors)
  var fnProgress = function (s){
    var bar = multi(0, bars.length + 3, {
      width : 30,
      before: s+' [',
      solid : {
        text : '|',
        foreground : 'white',
        background : colors.shift()
      },
      empty : { text : ' ' }
    });
    bars.push(bar)
    bar.progress = 0;
    return bar;
    /*

     */
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

  var len = 10;
  //-
  var rBarA = fnProgress('streamA received     ');
  streamA.on('data', function () {
    rBarA.progress++;
    rBarA.percent(rBarA.progress/len*100);
  });
  var tBarA = fnProgress('streamA length       ');
  streamA.on('data', function () {
    tBarA.percent(touts['streamA'].length/30*100);
  });
  var dBarA = fnProgress('streamA done         ');
  streamA.on('data', function () {
    var done = rBarA.progress-touts['streamA'].length;
    done = done<0?0:done;
    dBarA.percent(done/len*100);
  });
  //-
  var rBarB = fnProgress('streamB received     ');
  streamB.on('data', function () {
    rBarB.progress++;
    rBarB.percent(rBarB.progress/len*100);
  });
  var tBarB = fnProgress('streamB length       ');
  streamB.on('data', function () {
    tBarB.percent(touts['streamB'].length/30*100);
  });
  var dBarB = fnProgress('streamB done         ');
  streamB.on('data', function () {
    var done = rBarB.progress-touts['streamB'].length;
    done = done<0?0:done;
    dBarB.percent(done/len*100);
  });
  //-
  var rBarC = fnProgress('streamC received     ');
  streamC.on('data', function () {
    rBarC.progress++;
    rBarC.percent(rBarC.progress/len*100);
  });
  var tBarC = fnProgress('streamC length       ');
  streamC.on('data', function () {
    tBarC.percent(touts['streamC'].length/30*100);
  });
  var dBarC = fnProgress('streamC done         ');
  streamC.on('data', function () {
    var done = rBarC.progress-touts['streamC'].length;
    done = done<0?0:done;
    dBarC.percent(done/len*100);
  });

  streamC.on('end', function () {
    setTimeout(cleanQuit, 500)
  })

  // write as many data as you want
  for(var i=0;i<len;i++){
    streamA.write(''+i);
  }

  streamA.end();
};

// boiler plate stuff for the demo
var through2 = require('through2');
var multimeter = require('multimeter');

var multi = multimeter(process);
var cleanQuit = function () {
  multi.charm.cursor(true);
  multi.write(Array(10).join('\n')).destroy();
}
multi.on('^C', function () {
  cleanQuit()
  process.exit();
});
multi.charm.reset();
multi.charm.cursor(false);
multi.write('Progress:\n\n');

demo();

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}