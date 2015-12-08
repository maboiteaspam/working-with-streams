# working with streams

my repo-playground to test and try about streams.

After few months working with streams,
somehow it remains surprising from time to time,
so i seriously needed to put that down and try to clarify few things.

Your warmly welcome to fix me when i did some weird stuff !!

## through2

All examples are based on `rvagg/through2` module, as it helps to create streams and transforms in a glance.

## stuff to read

For a quick introduction about stream, check https://streams.spec.whatwg.org/#intro

 - https://github.com/whatwg/streams
 - https://github.com/rvagg/through2
 - https://github.com/nodejs/readable-stream/blob/master/doc/stream.markdown#stream_event_data
 - https://github.com/substack/stream-handbook

## The short introduction

```js
var source = through2();                        // Source stream,
                                                // is the stream data are written to,
                                                // and transforms are piped in.

var fnTransform = function (chunk, enc, cb) {   // Transform function,
    cb(null, {chunk: 'transformed'})            // bound to a stream,
};                                              // it transforms data as they come.

var transform = through2(fnTransform);          // That is a stream-transform.

var sink = through2();                          // Sink stream, ends the chain of stream.

source.pipe(transform).pipe(sink);              // Chained streams, like a recipe to cook flowed data.

source.write({                                  // Now, write data in the stream,
    your: 'first chunk'                         // Let it transform and pass the data
});                                             // to the sink.


source.on('data', function (data){              // each stream (source, transform, sink)
    console.log(data);                          // emits its own data event.
});

sink.on('error', function (err){                // each stream (source, transform, sink)
    console.error(err);                         // emits its own data event.
});
```

## examples

I have put down 10 examples so far.

From the most basic one, which just illustrate the stream methods,
to more complex one, with flush functions pending for tasks endings.

## Usage

Clone the repo, then run the script, modify them, study ect. whatever.

```sh
git clone git@github.com:maboiteaspam/working-with-streams.git
cd working-with-streams
node 10* --verbose
```

## Notes

Happy streaming ~!
