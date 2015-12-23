
/*
 Demonstrate that A.pipe(B) returns B

  Which is a matter of importance, see

  if A
  if B
  if C

  then A             A|_ -> transform() ▶ ▼
       .pipe(B)        B|_ -> transform() ▶ ▼
         .pipe(C)        C|_ -> transform() ▶ ▼
          .write()        ▶  ▶ applies to C
 It is much different than

 if A
 if B
 if C

 then A             A|_ -> transform() ▼ ▶
 A.pipe(B)          B|_ -> transform() ▼ ▶
 A.pipe(C)          C|_ -> transform() ▼ ▶
 A.write()            ▶  ▶ applies to A



 */
var demo = function () {


  var streamA = through2();
  var streamB = through2();

  console.log(
    streamA.pipe(streamB)===streamB
  )
};

// boiler plate stuff for the demo
process.env['DEBUG'] = 'stream';

var debug = require('debug')('stream')
var through2 = require('through2');

demo();
