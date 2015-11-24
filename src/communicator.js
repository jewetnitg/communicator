import _ from 'lodash';

import adapters from './singletons/adapters';
import connections from './singletons/connections';
import requests from './singletons/requests';
import servers from './singletons/servers';

import Adapter from './factories/Adapter';
import Connection from './factories/Connection';
import Request from './factories/Request';

/**
 *
 * @namespace communicator
 * @type Object
 *
 * @author Rik Hoffbauer
 *
 * @property Adapter {Function} The {@link Adapter} factory, used to create {@link Adapter}s
 * @property Connection {Function} The {@link Connection} factory, used to create {@link Connection}s
 * @property Request {Function} The {@link Request} factory, used to create {@link Request}s
 */
const communicator = {

  /**
   * @name adapters
   * @desc Object containing all {@link Adapter}s
   * @memberof communicator
   * @instance
   * @type Object<Adapter>
   * @example
   * // where XHR is the name of the {@link Adapter}
   * communicator.adapters.XHR;
   */
  adapters,

  /**
   * @name connections
   * @desc Object containing all {@link Connection}s
   * @memberof communicator
   * @instance
   * @type Object<Connection>
   * @example
   * // where local-xhr is the name of the {@link Connection}
   * communicator.connections['local-xhr'];
   */
  connections,

  /**
   * @name requests
   * @desc Object containing all {@link Request}s, like communicator.requests.context.name
   * @memberof communicator
   * @instance
   * @type Object<Object<Request|Object<Request>>>
   * @example
   * communicator.requests.context.name;
   */
  requests,

  /**
   * @name servers
   * @desc Object containing a representation of a servers requests as functions, like communicator.servers.connection.context.name()
   * @memberof communicator
   * @instance
   * @type Object<Object<Function|Object<Function>>>
   * @example
   * communicator.servers.connection.context.name(splat1, splat2, data);
   */
  servers,

  /**
   * @method Adapter
   * @desc The {@link Adapter} factory, used to create {@link Adapter}s
   * @memberof communicator
   * @instance
   *
   * @param options {Object} Object containing the properties for an {@link Adapter}.
   *
   * @returns {Adapter} The created {@link Adapter}
   *
   * @example
   * communicator.Adapter({
   *   name: 'XHR',
   *   disconnect() {},
   *   connect() {},
   *   request() {},
   *   events: true,
   *   on() {},
   *   emit() {}
   * });
   */
  Adapter,

  /**
   * @method Connection
   * @desc The {@link Connection} factory, used to create {@link Connection}s
   * @memberof communicator
   * @instance
   *
   * @param options {Object} Object containing the properties for a {@link Connection}.
   *
   * @returns {Connection} The created {@link Connection}
   *
   * @example
   * communicator.Connection({
   *   name: 'local-xhr',
   *   adapter: 'XHR',
   *   url: 'http://localhost:1337'
   * });
   */
  Connection,

  /**
   * @method Request
   * @desc The {@link Request} factory, used to create {@link Request}s
   * @memberof communicator
   * @instance
   *
   * @param options {Object} Object containing the properties for a {@link Request}.
   *
   * @returns {Request} The created {@link Request}
   *
   * @example
   * const request = communicator.Request({
   *   name: 'findById',
   *   context: 'user',
   *   route: '/user/:id',
   *   connection: 'local-xhr',
   *   method: 'get',
   *   resolve(){},
   *   reject(){}
   * });
   *
   * request.execute(56)
   *   .then(...);
   */
  Request,

  /**
   * Connects to a specified connection
   *
   * @method connect
   * @memberof communicator
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

    return _connection.connect();
  }

};

export default communicator;
