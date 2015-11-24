/**
 * @author Rik Hoffbauer
 * @module LazyLoader
 */

import _ from 'lodash';

// creates a cache object
function cacheFactory(args = []) {
  return {
    // the arguments used to execute the resolver
    args: _.clone(args),
    // array of function that should be executed once the cache resolves
    callbacks: [],
    // the state, set to done once the resolver has resolved
    state: LazyLoader.STATES.BUSY,
    // the value the resolver resolves with will be put on the result property
    result: null
  };
}

/**
 * Makes a function cache its return value and combine concurrent executions by caching it's result and not executing it again if it still busy acquiring the result. A cache is identified by the arguments used to call the function.
 *
 * Please note that the context of the resolver function provided loses its context if not first bound with context.
 *
 * @name LazyLoader
 * @function
 *
 *
 * @param resolver {Function} The function to make a LazyLoader out of, should in most cases return a Promise but can do with just returning the result
 * @param lifetime {Number} defaults to 6000, amount of ms to cache a value after it has been acquired
 *
 * @returns {Function} The lazily loading function
 *
 * @example
 * import LazyLoader from '../path/to/LazyLoader';
 *
 * function fn (arg1, arg2) {
 *   return new Promise(resolve => {
 *     // ... do some async stuff ...
 *     resolve(result);
 *   });
 * };
 *
 * const lazyFn = LazyLoader(fn, 6000);
 *
 * // executes fn, no caches for arguments [1, 2] exist
 * lazyFn(1, 2)
 *   .then(...);
 *
 * // doesn't execute fn if executed within 6000ms after the data for arguments [1, 2] was acquired
 * lazyFn(1, 2)
 *   .then(...);
 *
 * // doesn't execute fn if executed within 6000ms ...
 * lazyFn(1, 2)
 *   .then(...);
 *
 * // doesn't execute fn if executed within 6000ms ...
 * lazyFn(1, 2)
 *   .then(...);
 *
 * // executes fn, because arguments [1, 3] dont have a cached value
 * lazyFn(1, 3)
 *   .then(...);
 *
 */
function LazyLoader(resolver, lifetime = 6000) {
  // verify the provided arguments are valid, throw an Error if they are not
  if (typeof resolver !== 'function') {
    throw new Error(`No resolver provided on Lazy Loader.`);
  }

  if (typeof cache !== 'undefined') {
    if (typeof cache !== 'number') {
      throw new Error(`Cache should provided as a Number to the LazyLoader.`);
    }
  }

  const props = {
    // cache objects (see the cacheFactory) will be stored in here,
    // this array contains all caches for the lazily loading function
    caches: {
      value: []
    },

    // the resolver is the function that actually acquires the value
    resolver: {
      // ensure resolver returns a Promise
      value: function (...args) {
        return Promise.resolve()
          .then(() => {
            return resolver.apply(undefined, args);
          });
      }
    },

    // the cache property represents the lifetime of a cache, it defaults to 6000ms
    lifetime: {
      value: lifetime
    }
  };

  const lazyLoader = Object.create(LazyLoader.prototype, props);

  // just return the resolve function, this is the function that checks if there is a cache, creates it if not etc. etc.
  return lazyLoader.resolve.bind(lazyLoader);
}

LazyLoader.STATES = {
  "BUSY": "BUSY",
  "DONE": "DONE"
};

LazyLoader.prototype = {

  resolve(...args) {
    const cache = this.ensureCache(args);

    if (cache.state !== LazyLoader.STATES.DONE) {
      // if the cache is NOT done, return a Promise that is resolved once it IS done
      return new Promise(resolve => {
        cache.callbacks.push(resolve);
      });
    } else {
      // if the cache is done, resolve with its result
      return Promise.resolve(cache.result);
    }
  },

  ensureCache(args) {
    return this.findInCaches(args) || this.addNewCache(args);
  },

  findInCaches(args) {
    // this is where the magic happens,
    // we look for caches that were called with arguments
    // that deeply equal the arguments it was called this time
    return _.find(this.caches, (cache) => {
      return _.eq(cache.args, args);
    });
  },

  addNewCache(args) {
    // create a cache object
    const cache = cacheFactory(args);

    // add the cache to the caches
    this.caches.push(cache);

    // call the resolver with the arguments passed in,
    // if it needs a context it should be bound before passing it to the LazyLoader factory
    this.resolver.apply(undefined, args)
      .then((data) => {
        this.resolveCache(cache, data);
      });

    return cache;
  },

  resolveCache(cache, result) {
    // start the cache timeOut now, so from the moment a value is acquired, the value will be available for this.lifetime ms
    cache.timeOut = setTimeout(() => {
      this.removeCache(cache);
    }, this.lifetime);

    cache.state = LazyLoader.STATES.DONE;
    cache.result = result;

    // the callback property on a cache contains resolve functions,
    // run all of them to resolve all calls to the resolver while it was busy,
    // this includes the initial call
    _.each(cache.callbacks, (callback) => {
      callback(cache.result);
    });
  },

  removeCache(cache) {
    const index = this.caches.indexOf(cache);

    if (index !== -1) {
      this.caches.splice(index, 1);
    }
  }

};

export default LazyLoader;