import _ from 'lodash';

import ConnectionValidator from '../validators/Connection';
import Request from './Request';
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
  options.communicator.requests[options.name] = {};
  options.communicator.servers[options.name] = {};

  const props = {
    name: {
      value: options.name
    },
    url: {
      value: options.url
    },
    adapter: {
      value: options.communicator.adapters[options.adapter]
    },

    communicator: {
      value: options.communicator
    },

    /**
     * @name requests
     * @memberof Connection
     * @type Object<Request|Object<Request>>
     * @instance
     * @example
     * // request name is 'deep.name' in this case
     * connection.requests.deep.name.execute(splat1, splat2, requestBody)
     *   .then(...);
     * // request name is 'name' in this case
     * connection.requests.name.execute(splat1, splat2, requestBody)
     *   .then(...);
     */
    requests: {
      value: options.communicator.requests[options.name]
    },

    /**
     * @name server
     * @memberof Connection
     * @type Object<Function|Object<Function>>
     * @instance
     * @example
     * // request name is 'deep.name' in this case
     * connection.server.deep.name(splat1, splat2, requestBody)
     *   .then(...);
     * // request name is 'name' in this case
     * connection.server.name(splat1, splat2, requestBody)
     *   .then(...);
     */
    server: {
      value: options.communicator.servers[options.name]
    }
  };

  const connection = options.communicator.connections[options.name] = Object.create(Connection.prototype, props);

  _.each(options.requests, (request, name) => {
    request.name = request.name || name;
    connection.Request(request);
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
   * Adds a {@link Request} to this {@link Connection}
   *
   * @method Request
   * @memberof Connection
   * @instance
   *
   * @param options {Object} Options for the {@link Request}
   *
   * @returns {Request}
   */
  Request(options) {
    options.connection = this.name;
    options.communicator = this.communicator;

    return Request(options);
  },

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
  },

  /**
   * Does a GET request using this {@link Connection}
   *
   * @method get
   * @memberof Connection
   * @instance
   *
   * @returns Promise
   * @example
   * connection.get('/user', {id: 3})
   *   .then(...);
   */
  get(url, data) {
    return this.request({
      method: 'get',
      url,
      data
    });
  },

  /**
   * Does a POST request using this {@link Connection}
   *
   * @method post
   * @memberof Connection
   * @instance
   *
   * @returns Promise
   * @example
   * connection.post('/user', {id: 3, firstName: 'asd'})
   *   .then(...);
   */
  post(url, data) {
    return this.request({
      method: 'post',
      url,
      data
    });
  },

  /**
   * Does a PUT request using this {@link Connection}
   *
   * @method put
   * @memberof Connection
   * @instance
   *
   * @returns Promise
   * @example
   * connection.put('/user/3', {id: 3, firstName: 'rsgsrg'})
   *   .then(...);
   */
  put(url, data) {
    return this.request({
      method: 'put',
      url,
      data
    });
  },

  /**
   * Does a DELETE request using this {@link Connection}
   *
   * @method delete
   * @memberof Connection
   * @instance
   *
   * @returns Promise
   * @example
   * connection.delete('/user/3')
   *   .then(...);
   */
  delete(url, data) {
    return this.request({
      method: 'delete',
      url,
      data
    });
  }

};

export default Connection;