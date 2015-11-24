import _ from 'lodash';

import ConnectionValidator from '../validators/Connection';
import connections from '../singletons/connections';
import adapters from '../singletons/adapters';
import requests from '../singletons/requests';
import servers from '../singletons/servers';

import concatenateUrls from '../helpers/concatenateUrls';

/**
 *
 * @class Connection
 * @author Rik Hoffbauer
 *
 * @param {Object} [options={}] - Object containing the properties listed below
 *
 * @property name {String} The name of the Connection
 * @property {String} [url=The current protocol, hostname and port] The (base) url of the connection, protocol + host + port, http://localhost:1337 for example
 * @property adapter {String} A string referring to the name of an {@link Adapter}
 *
 * @returns {Connection}
 *
 * @example
 * // construct a Connection, the new keyword is not necessary
 * const connection = Connection({
 *   name: 'local-xhr',
 *   url: 'http://localhost:1337',
 *   adapter: 'XHR'
 * });
 *
 */
function Connection(options = {}) {
  options.url = options.url || (window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''));

  ConnectionValidator.construct(options);

  // initialize the Connections requests as an empty object
  requests[options.name] = {};
  servers[options.name] = {};

  const connection = connections[options.name] = Object.create(Connection.prototype, {
    name: {
      value: options.name
    },
    url: {
      value: options.url
    },
    adapter: {
      value: adapters[options.adapter]
    },

    /**
     * @name requests
     * @memberof Connection
     * @type Object<Request|Object<Request>>
     * @instance
     * @example
     * // context and name refer to the context and name of a request
     * connection.requests.context.name.execute(splat1, splat2, requestBody)
     *   .then(...);
     * // requests without a context are called like this
     * connection.requests.name.execute(splat1, splat2, requestBody)
     *   .then(...);
     */
    requests: {
      value: requests[options.name]
    },

    /**
     * @name server
     * @memberof Connection
     * @type Object<Function|Object<Function>>
     * @instance
     * @example
     * // context and name refer to the context and name of a request
     * connection.server.context.name(splat1, splat2, requestBody)
     *   .then(...);
     * // requests without a context are called like this
     * connection.server.name(splat1, splat2, requestBody)
     *   .then(...);
     */
    server: {
      value: servers[options.name]
    }
  });

  // backbone like events hashmap for server events
  _.each(options.events, (eventHandler, event) => {
    const _eventHandler = typeof eventHandler === 'function' ? eventHandler : options[eventHandler];

    if (!_eventHandler) {
      throw new Error(`Failed to bind event listener for event '${event}', event handler '${eventHandler}' not defined.`);
    }

    connection.on(event, eventHandler);
  });

  return connection;
}

Connection.prototype = {

  connected: false,

  /**
   * Connects this Connection to the server using its url and adapter.
   *
   * @method connect
   * @memberof Connection
   * @instance
   *
   * @returns {Promise}
   * @example
   * // connect this connection to the server
   * connection.connect()
   *   .then(...);
   */
  connect() {
    if (this.connected) {
      return Promise.resolve();
    } else {
      return this.adapter.connect(this.url)
        .then((data) => {
          this.connected = true;
          return data;
        });
    }
  },

  /**
   * Disconnects this Connection from the server using its url and adapter.
   *
   * @method disconnect
   * @memberof Connection
   * @instance
   *
   * @returns {Promise}
   * @example
   * // disconnect this connection from the server
   * connection.disconnect()
   *   .then(...);
   */
  disconnect() {
    if (!this.connected) {
      return Promise.resolve();
    } else {
      return this.adapter.disconnect(this.url)
        .then((data) => {
          this.connected = false;
          return data;
        });
    }
  },

  /**
   * Makes a request to the server
   *
   * @method request
   * @memberof Connection
   * @instance
   *
   * @param {Object} [options={}] Object containing a url, method and optionally a data property
   *
   * @returns {Promise} Returns a promise that resolves with the server response
   *
   * @example
   * // make a request to the server
   * connection.request({
   *     url: '/user',
   *     method: 'get',
   *     data: {
   *       id: 67
   *     }
   *   })
   *   .then(...);
   */
  request(options = {}) {
    options.url = concatenateUrls(this.url, options.url);

    // ensure the Connection is connected
    return this.connect()
      .then(() => {
        return this.adapter.request(options);
      });
  },

  /**
   * Listens for a server event
   *
   * @method on
   * @memberof Connection
   * @instance
   *
   * @param event {String} Server event to listen for.
   * @param eventHandler {function(data)} Function to execute when the event has occurred.
   * @example
   * // listen for an event being triggered by the server
   * connection.on('serverEvent', function callback(data) {});
   */
  on(event, eventHandler) {
    this.adapter.on(event, eventHandler);
  },

  /**
   * Emits a client event to the server.
   *
   * @method emit
   * @memberof Connection
   * @instance
   *
   * @param event {String} Client event to emit.
   * @param data {*} Data passed to event handlers
   * @example
   * // trigger an event from the client to the server
   * connection.emit('serverEvent', data);
   */
  emit(event, data) {
    this.adapter.emit(event, data);
  }

};

// makes convenience methods for, get, post, put and delete requests
function addConvenienceMethodsToConnection() {
  const methods = [
    'get',
    'post',
    'put',
    'delete'
  ];

  _.each(methods, (method) => {
    Connection.prototype[method] = function (url, data) {
      return this.request({
        url,
        data,
        method
      });
    };
  });
}

addConvenienceMethodsToConnection();

export default Connection;