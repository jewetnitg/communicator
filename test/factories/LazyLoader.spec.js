/**
 * @author rik
 */
import _ from 'lodash';

import LazyLoader from '../../src/factories/LazyLoader';

describe(`LazyLoader`, () => {

  it(`should be a function`, (done) => {
    expect(LazyLoader).to.be.a('function');
    done();
  });

  describe(`LazyLoader(Function resolver, Number lifetime)`, () => {

    it(`should return a function that when called calls the resolver with the arguments provided and returns a Promise`, (done) => {
      const fn = mockFunction();
      const data = 'data';
      const lazyFn = LazyLoader(fn);
      const actual = lazyFn(data);

      expect(actual).to.be.an.instanceof(Promise, "Lazily loaded function should return a Promise");

      actual.then(() => {
        verify(fn)(data);
        done();
      });
    });

    it(`should cache the value returned / resolved by the resolver`, (done) => {
      const fn = mockFunction();
      const lazyFn = LazyLoader(fn);

      Promise.all([
          lazyFn(),
          lazyFn()
        ])
        .then(() => {
          verify(fn, once())();
        });


      done();
    });

    it(`should remove the cache when the value lifetime of the cache has expired`, (done) => {
      const lifetime = 50;
      const fn = mockFunction();
      const lazyFn = LazyLoader(fn, lifetime);

      // call the lazy fn for the first time
      lazyFn()
        .then(() => {
          // wait for the cache to have expired
          setTimeout(() => {
            lazyFn()
              .then(() => {
                // the function should be called twice, as the second time it was called was after the cache had expired
                verify(fn, times(2))();
                done();
              });
          }, lifetime + 20); // add some margin for js time inaccuracy
        });

    });

  });

});