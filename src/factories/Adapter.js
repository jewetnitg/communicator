import _ from 'lodash';

import LazyLoader from './LazyLoader';

import AdapterValidator from '../validators/Adapter';

/**
 * This function creates an Adapter.
 *
 * @class Adapter
 * @author Rik Hoffbauer
 *
 * @param {Object}[options={}] - Object containing the properties listed below.
 *
 * @property name {String} The name of the adapter.
 * @property {Boolean} [events=false] - indicates whether the Adapter supports server events, if set to true, the on and trigger methods must be implemented.
 * @property connect {function(url)} Function that should return a Promise that resolves when connection to the server has been established, and rejects when it failed to do so.
 * @property disconnect {function(url)} Function that should return a Promise that resolves when the client has disconnected from the server, and rejects when it failed to do so.
 * @property request {function(data)} Function that should return a Promise that resolves when a request has been successfully executed, and rejects when it failed to do so. The data object contains a url, method and data property.
 * @property on {function(event, callback)} Function that should listen for a server event and trigger a callback when it occurs.
 * @property trigger {function(event, data)} Function that should trigger a server event with data.
 *
 * @returns {Adapter}
 * @example
 * const adapter = Adapter({
 *   events: true,
 *
 *   connect(url) {
 *     return new Promise({
 *       // ....
 *     });
 *   },
 *
 *   disconnect(url) {
 *     return new Promise({
 *       // ....
 *     });
 *   },
 *
 *   // data contains a url, method and data property
 *   request(data) {
 *     return new Promise({
 *       // ....
 *     });
 *   },
 *
 *   on(event, cb) {
 *     // ...
 *   },
 *
 *   emit(event, data) {
 *     // ...
 *   }
 * });
 */
function Adapter(options = {}) {
  // validates the options object contains all properties needed to create an Adapter
  AdapterValidator.construct(options);

  const adapter = options.communicator.adapters[options.name] = _.extend({
    events: false
  }, options);

  adapter.connect = LazyLoader(adapter.connect.bind(adapter));
  adapter.disconnect = LazyLoader(adapter.disconnect.bind(adapter));
  adapter.request = LazyLoader(adapter.request.bind(adapter));

  return adapter;
}

export default Adapter;