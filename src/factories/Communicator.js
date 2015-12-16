/**
 * @author rik
 */
import _ from 'lodash';
import MiddlewareRunner from 'frontend-middleware';

import Adapter from './Adapter';
import Connection from './Connection';
import Request from './Request';

// @todo refactor out, put it on Communicator itself
const singletons = {
  adapters: {},
  connections: {},
  requests: {},
  servers: {},
  communicators: {}
};

/**
 * @class Communicator
 * @param options {Object} Object containing the properties listed below
 *
 * @property defaultAdapter {String} The default {@link Adapter} (name) for {@link Connection}s
 * @property defaultConnection {String} The default {@link Connection} (name) for {@link Request}s
 *
 * @property adapters {Object<Object>} {@link Adapter}s that should be registered on construct
 * @property connections {Object<Object>} {@link Connection}s that should be registered on construct
 * @property requests {Object<Object>} {@link Request}s that should be registered on construct
 *
 * @todo validate options
 *
 * @example
 * import Communicator from 'frontend-communicator';
 *
 * const communicator = Communicator({
 *
 *   name: 'some-unique-name-for-the-communicator',
 *   defaultConnection: 'local-xhr',
 *   defaultAdapter: 'XHR',
 *   middleware: {
 *     security: {}
 *   },
 *   adapters: {...},
 *   connections: {...},
 *   requests: {...}
 *
 * });
 *
 * export default communicator;
 */
function Communicator(options = {}) {
  _.defaults(options, Communicator.defaults, {
    name: 'communicator-' + _.uniqueId()
  });

  singletons.adapters[options.name] = {};
  singletons.connections[options.name] = {};
  singletons.requests[options.name] = {};
  singletons.servers[options.name] = {};

  const middlewareRunner = MiddlewareRunner({
    security: {
      middleware: options.middleware.security
    }
  });

  const props = {
    /**
     * Name of the {@link Communicator} instance
     * @name name
     * @type String
     * @memberof Communicator
     * @instance
     * @example
     * communicator.name; // name provided to factory
     */
    name: {
      value: options.name
    },
    /**
     * Object containing the properties provided to the {@link Communicator} factory
     * @name options
     * @type Object
     * @memberof Communicator
     * @instance
     * @example
     * communicator.options; // options provided to factory
     */
    options: {
      value: options
    },
    middlewareRunner: {
      value: middlewareRunner
    }
  };

  const communicator = singletons.communicators[options.name] = Object.create(Communicator.prototype, props);

  communicator.defaultAdapter = options.defaultAdapter;
  communicator.defaultConnection = options.defaultConnection;

  _.bindAll(
    communicator,
    _.methods(communicator)
  );

  runFactory(communicator.Adapter, options.adapters);
  runFactory(communicator.Connection, options.connections, {
    adapter: options.defaultAdapter
  });
  runFactory(communicator.Request, options.requests, {
    connection: options.defaultConnection
  });

  return communicator;
}

Communicator.defaults = {
  middleware: {}
};

function runFactory(factory, hashMap, defaults = {}) {
  _.each(hashMap, (obj, name) => {
    _.defaults(obj, defaults, {
      name: obj.name || name
    });

    factory(obj);
  });
}

Communicator.prototype = {

  /**
   * Registers an {@link Adapter} on this {@link Communicator}
   * @method Adapter
   * @memberof Communicator
   * @instance
   * @param options {Object} Object containing the properties for an {@link Adapter}
   * @returns {Adapter}
   * @example
   * const adapter = communicator.Adapter({
   *   name: 'XHR',
   *   connect() {...},
   *   disconnect() {...},
   *   request() {...},
   *   ...
   * });
   */
  Adapter(options = {}) {
    _.defaults(options, {
      communicator: this
    });

    return Adapter(options);
  },

  /**
   * Registers an {@link Connection} on this {@link Communicator}
   * @method Connection
   * @memberof Communicator
   * @instance
   * @param options {Object} Object containing the properties for a {@link Connection}
   * @returns {Connection}
   * @example
   * const connection = communicator.Connection({
   *   name: 'local-xhr',
   *   adapter: 'XHR',
   *   url: 'http://localhost:1337'
   * });
   */
  Connection(options = {}) {
    _.defaults(options, {
      communicator: this,
      adapter: this.defaultAdapter
    });

    return Connection(options);
  },

  /**
   * Registers an {@link Request} on this {@link Communicator}
   * @method Request
   * @memberof Communicator
   * @instance
   * @param options {Object} Object containing the properties for a {@link Request}
   * @returns {Request}
   * @example
   * const request = communicator.Request({
   *   name: 'user.login',
   *   connection: 'local-xhr',
   *   route: '/user/login',
   *   method: 'get,
   *   ...
   * });
   */
  Request(options = {}) {
    _.defaults(options, {
      communicator: this,
      connection: this.defaultConnection
    });

    return Request(options);
  },

  /**
   * Object that contains all registered {@link Request}s of all {@link Connection}s on this {@link Communicator}
   * @name servers
   * @type Object
   * @memberof Communicator
   * @instance
   * @example
   * communicator.servers['local-xhr'].user.login()
   *   .then(...);
   */
  get servers() {
    return singletons.servers[this.name];
  },

  /**
   * Object that contains all registered {@link Adapter}s on this {@link Communicator}
   * @name adapters
   * @type Object
   * @memberof Communicator
   * @instance
   * @example
   * communicator.adapters.XHR;
   */
  get adapters() {
    return singletons.adapters[this.name];
  },

  /**
   * Object that contains all registered {@link Connection}s on this {@link Communicator}
   * @name connections
   * @type Object
   * @memberof Communicator
   * @instance
   * @example
   * communicator.connections['local-xhr'].post('/some/relative/path/to/connection/url', data)
   *   .then(...);
   */
  get connections() {
    return singletons.connections[this.name];
  },

  /**
   * Object that contains all registered {@link Request}s on this {@link Communicator}
   * @name requests
   * @type Object
   * @memberof Communicator
   * @instance
   * @example
   * communicator.requests['local-xhr'].user.login.execute('/some/relative/path/to/connection/url', data)
   *   .then(...);
   */
  get requests() {
    return singletons.requests[this.name];
  },

  /**
   * Executes one or more security middleware with data
   *
   * @method middleware
   * @memberof Communicator
   * @instance
   *
   * @param middleware {String|Array<String>} Security middleware to execute
   * @param {Object} [data={}] Data / params to set on the middleware 'request'
   *
   * @returns {Promise}
   */
  security(middleware = [], data = {}) {
    return this.middlewareRunner.security.run(middleware, data);
  },

  /**
   * Connects to a specified connection
   *
   * @method connect
   * @memberof Communicator
   * @instance
   *
   * @param {String} [connection=this.defaultConnection] The name of the {@link Connection} to connect to.
   *
   * @returns {Promise} A promise that resolves when the connection has been established
   *
   * @example
   * communicator.connect('local-xhr')
   *   .then(...);
   * // or, when having set a defaultConnection,
   * communicator.defaultConnection = 'local-xhr';
   * communicator.connect()
   *   .then(...);
   */
  connect(connection = this.defaultConnection) {
    if (typeof connection !== 'string') {
      throw new Error(`Can't connect, no connection specified.`);
    }

    const _connection = this.connections[connection];

    if (!_connection) {
      throw new Error(`Can't connect, connection '${connection}' not defined.`);
    }

    return _connection.connect()
      .then(() => {
        // return the connected Connection instance, so this method resolves with a Connection which can then be used to execute Requests
        return _connection;
      });
  }

};

export default Communicator;