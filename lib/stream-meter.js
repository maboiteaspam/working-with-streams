
var multimeter = require('multimeter');

module.exports = function StreamMeter () {

  var multi = multimeter(process);

  var that = this;
  var bars = [];
  var width = 90;
  var colors = ['blue', 'yellow', 'cyan'];
  colors = colors.concat(colors).concat(colors)

  this.start = function (w) {
    width = w || width;
    multi.on('^C', function () {
      that.end()
      process.exit(); // yeah, this is bad.
    });
    multi.charm.reset();
    multi.charm.cursor(false);
    multi.write('Progress:\n\n');
  };

  this.end = function () {
    multi.charm.cursor(true);
    multi.write(Array(10).join('\n')).destroy();
    bars = []
  };

  this.add = function (name) {
    var bar = multi(0, bars.length + 3, {
      width : width,
      before: name+' [',
      solid : {
        text : '|',
        foreground : 'white',
        background : colors.shift()
      },
      empty : { text : ' ' }
    });
    bar.progress = 0;
    bars.push(bar)
    return bar;
  }

};