/**
 * @author rik
 */
import _ from 'lodash';

import RequestValidator from '../validators/Request';
import replaceSplatsInRouteWithData from '../helpers/replaceSplatsInRouteWithData';
import extractSplatsFromRoute from '../helpers/extractSplatsFromRoute';

import LazyLoader from './LazyLoader';

/**
 * A {@link Request} represents a blueprint for a request to the server, it uses a {@link Connection} and the properties listed below to do so.
 *
 * @class Request
 *
 * @param {Object}[options={}] Object containing the properties specified below
 *
 * @property name {String} The name, specific, behaves like a path (name: 'user.login' will result in requests.user.login)
 *
 * @property upload {Boolean} If set to true, this request is handled as an upload by its {@link Connection} and {@link Adapter}
 *
 * @property connection {String} The name of the {@link Connection} this {@link Request} should use to execute itself
 *
 * @property route {String} The route of this {@link Request}, '/user/:id' for example
 *
 * @property method {String} The HTTP method of this {@link Request}, 'get', 'post', 'put' or 'delete'
 *
 * @property {Function} [prepare=Promise.resolve] Function that is called just before a {@link Request} is executed, allows for transformations to be applied to the request body, it can work asynchronously by returning a Promise that resolves with the transformed value, if it is synchronous the transformed value can just be returned.
 *
 * @property {Function} [resolve=Promise.resolve] Function that is called when the {@link Request} is executed successfully, allows for data response body transformation, can work asynchronously by returning a Promise, if synchronous can just return the value. Even allows for rejecting a resolved request.
 *
 * @property {Function} [reject=Promise.reject] Function that is called when the {@link Request} is executed unsuccessfully, allows for data response body transformation, can work asynchronously by returning a Promise, if synchronous can just return the value. Even allows for resolving a rejected request.
 *
 * @returns {Request}
 *
 * @example
 * cons request = Request({
 *   name: 'user.findById',
 *   connection: 'local-xhr',
 *   route: '/user/:id',
 *   method: 'get',
 *   security: ['user.isLoggedIn'],
 *   // can also return a Promise that resolves with the transformed data, if the transformation is asynchronous
 *   prepare(data) {
 *     delete data.someValueOnlyRequiredByTheClient
 *     return data;
 *   },
 *   resolve(data) {
 *     return new Promise((resolve, reject) => {
 *        // .. do stuff to transform data or even reject the promise
 *        resolve(data);
 *     });
 *   },
 *   reject(data) {
 *     return new Promise((resolve, reject) => {
 *        // .. do stuff to transform data or even resolve the promise
 *        reject(data);
 *     });
 *   }
 * });
 *
 */
function Request(options = {}) {
  _.defaults(options, Request.defaults);
  RequestValidator.construct(options);

  const connection = options.communicator.connections[options.connection];
  let dst = options.communicator.requests[options.connection];
  let serverDst = options.communicator.servers[options.connection];

  _.defaults(options, {
    cache: connection.cache
  });

  const props = {
    name: {
      value: options.name
    },
    cache: {
      value: options.cache
    },
    connection: {
      value: options.communicator.connections[options.connection]
    },
    route: {
      value: options.route
    },
    upload: {
      value: options.upload
    },
    filesAttribute: {
      value: options.filesAttribute
    },
    progress: {
      value: options.progress
    },
    prepare: {
      // ensure prepare returns a Promise
      value(data) {
        return Promise.resolve()
          .then(() => {
            return (options.prepare ? options.prepare.bind(this) : Promise.resolve.bind(Promise))(data);
          })
      }
    },
    security: {
      value: options.security || []
    },
    method: {
      value: options.method
    },
    resolve: {
      value: options.resolve || Promise.resolve.bind(Promise)
    },
    reject: {
      value: options.reject || Promise.reject.bind(Promise)
    },
    splats: {
      value: extractSplatsFromRoute(options.route)
    },
    communicator: {
      value: options.communicator
    }
  };

  const request = Object.create(Request.prototype, props);

  if (!isNaN(parseInt(request.cache), 10)) {
    request.cachedExecuteWithConnection = LazyLoader(request.executeWithConnection.bind(request), request.cache);
  }

  _.set(dst, options.name, request);
  _.set(serverDst, options.name, request.execute.bind(request));

  return request;
}

Request.defaults = {
  method: 'get'
};

Request.prototype = {

  /**
   * Executes this {@link Request} using a {@link Connection}
   *
   * @method executeWithConnection
   * @instance
   * @memberOf Request
   *
   * @param connection {Connection|String} {@link Connection} or name of a {@link Connection} to execute this {@link Request} with
   * @param args {...*} The rest of the arguments should be the :splats in the right order, the last argument (the one after the :splats) is the request body, so, if there are no :splats this argument is the request body. If there are :splats in the route, all :splats are required to be provided to this function.
   *
   * @returns {Promise} A Promise that resolves when the {@link Request} has executed successfully, and rejects when it failed to do so.
   *
   * @example
   * // find by id request, route: '/user/:id'
   * request.executeWithConnection('local-xhr', 13);
   */
  executeWithConnection(connection, ...args) {
    const splats = args.slice(0, this.splats.length);
    const data = this.upload ? args[this.splats.length + 1] : args[this.splats.length];
    const files = this.upload ? args[this.splats.length] : [];
    RequestValidator.executeWithConnection(this, connection, splats);

    const _connection = typeof connection === 'string' ? this.communicator.connections[connection] : connection;

    return this.prepare(data, files)
      .then((_data) => {
        return this.communicator.security(this.security, _data)
          .then(() => {
            const options = {
              url: replaceSplatsInRouteWithData(this.route, splats),
              data: _data,
              filesAttribute: this.filesAttribute,
              method: this.method
            };

            const promise = this.upload
              ? _connection.upload(files, options, this.progress ? this.progress.bind(this) : null)
              : _connection.request(options);

            return promise
              .then((__data) => {
                  return this.resolve(__data, data);
                },
                (__data) => {
                  return this.reject(__data, data);
                });
          }, () => {
            return Promise.reject("You are not allowed to execute this request");
          });
      });
  },

  /**
   * Executes the {@link Request} using its own {@link Connection}
   *
   * @method execute
   * @instance
   * @memberOf Request
   *
   * @param args {...(String|Number)} The :splats followed by the request body
   * @returns {Promise} A Promise that resolves when the {@link Request} has executed successfully, and rejects when it failed to do so.
   *
   * @example
   * // route: '/user/:id'
   * request.execute(56);
   * // route: '/user/:id/:id2'
   * request.execute(56, 57);
   * // route: '/user/:id/:id2', with request body
   * request.execute(56, 57, {someData: true});
   */
  execute(...args) {
    args.unshift(this.connection);

    if (this.cache) {
      return this.cachedExecuteWithConnection.apply(this, args);
    } else {
      return this.executeWithConnection.apply(this, args);
    }
  }

};

export default Request;