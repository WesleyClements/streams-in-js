const Benchmark = require("benchmark");
const { identity } = require('../dist/cjs/utils');

const IterableStream = require("../dist/cjs").default;

const toFalse = () => false;
const toTrue = () => true;

const compareAscending = (a, b) => a - b;
const compareDescending = (a, b) => b - a;

const arrayLength = 1000;
const iterations = 100;

const array = Array(arrayLength).fill(0).map((_, i) => i)
const stream = IterableStream.from(array);

const nestedArraysArray = Array(arrayLength).fill(0).map((_, i) => [i])
const nestedArraysStream = IterableStream.from(nestedArraysArray);

let value;
const arraySuite = new Benchmark.Suite("Array")
  .add("concat", () => {
    value = array.concat(array);
  })
  .add("every", () => {
    value = array.every(toTrue);
  })
  .add("filter", () => {
    value = array.filter(toTrue);
  })
  .add("find", () => {
    value = array.find(toFalse);
  })
  .add("flat", () => {
    value = nestedArraysArray.flat();
  })
  .add("flatMap", () => {
    value = nestedArraysArray.flatMap(identity);
  })
  .add("forEach", () => {
    value = array.forEach(identity);
  })
  .add("includes", () => {
    value = array.includes(-1);
  })
  .add("limit", () => {
    value = array.slice(0, 100);
  })
  .add("max", () => {
    value = array.reduce(
      (accumulator, n) => Math.max(accumulator, n),
      Number.NEGATIVE_INFINITY
    );
  })
  .add("min", () => {
    value = array.reduce(
      (accumulator, n) => Math.min(accumulator, n),
      Number.POSITIVE_INFINITY
    );
  })
  .add("peek", () => {
    value = array.map(identity);
  })
  .add("reduce", () => {
    value = array.reduce(identity, 0);
  })
  .add("skip", () => {
    value = array.slice(100);
  })
  .add("some", () => {
    value = array.some(toFalse);
  })
  .add("sum", () => {
    value = array.reduce((accumulator, n) => accumulator + n, 0);
  })
  .add("unique", () => {
    value = [...new Set(array)];
  });

const streamSuite = new Benchmark.Suite("IterableStream")
  .add("concat", () => {
    value = stream.concat(stream).toArray();
  })
  .add("count", () => {
    value = stream.count();
  })
  .add("every", () => {
    value = stream.every(toTrue);
  })
  .add("filter", () => {
    value = stream.filter(toTrue).toArray();
  })
  .add("find", () => {
    value = stream.find(toFalse);
  })
  .add("flat", () => {
    value = nestedArraysStream.flat().toArray();
  })
  .add("flatMap", () => {
    value = nestedArraysStream.flatMap(identity).toArray();
  })
  .add("forEach", () => {
    value = stream.forEach(identity);
  })
  .add("includes", () => {
    value = stream.includes(-1);
  })
  .add("limit", () => {
    value = stream.limit(100).toArray();
  })
  .add("max", () => {
    value = stream.max(compareAscending).toArray();
  })
  .add("min", () => {
    value = stream.min(compareDescending).toArray();
  })
  .add("peek", () => {
    value = stream.peek(identity).toArray();
  })
  .add("reduce", () => {
    value = stream.reduce(identity, 0);
  })
  .add("skip", () => {
    value = stream.skip(100).toArray();
  })
  .add("some", () => {
    value = stream.some(toFalse);
  })
  .add("sum", () => {
    value = stream.sum();
  })
  .add("unique", () => {
    value = stream.unique().toArray();
  });

Promise.all(
  [arraySuite, streamSuite].map(async (suite) => {
    const conclusion = new Promise((resolve) => {
      suite.on('init', () => console.log())
      suite.on('complete', function() {
        const results = {};
        this.forEach((bench) => {
          results[bench.name] = [
            Benchmark.formatNumber(
              Math.round(
                1.0 / bench.times.period * (
                  bench.name == 'init' ? 1 : iterations
                )
              )
            ),
            Math.round(bench.stats.rme),
          ]
          
        });
        resolve([suite.name, results])
      });
    });
    console.log(`Starting ${suite.name}`)
    suite.run();
    return conclusion;
  })
)
  .then((results) => {
    return results.reduce(
      (accumulator, [suiteName, data]) => {
        Object.entries(data)
          .forEach(([benchName, [ops, error]]) => {
            if (!accumulator[benchName]) {
              accumulator[benchName] = {}
            }
            accumulator[benchName][suiteName] = `${ops} ops/sec ±${error}`
          })
        return accumulator;
      },
      {}
    );
  })
  .then((results) => {
    return Object.entries(results)
      .map(([benchName, data]) => [
        benchName,
        Object.fromEntries(
          Object.entries(data)
            .sort(([a], [b]) => {
              if (a < b) {
                return -1
              }
              if (a > b) {
                return 1;
              }
              return 0
            })
        )
      ])
      .sort(([a], [b]) => {
        if (a < b) {
          return -1
        }
        if (a > b) {
          return 1;
        }
        return 0
      })
  })
  .then(Object.fromEntries)
  .then(console.log)

exports = value;