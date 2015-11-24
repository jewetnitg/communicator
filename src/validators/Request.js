/**
 * @author rik
 */
import requests from '../singletons/requests';
import connections from '../singletons/connections';
import adapters from '../singletons/adapters';
import dataSatisfiesRoute from '../helpers/dataSatisfiesRoute';

const requestValidator = {

  construct(options = {}) {
    if (typeof options.name !== 'string') {
      throw new Error(`No name provided on Request.`);
    }

    if (options.context && typeof options.context !== 'string') {
      throw new Error(`No context on Request ${options.name} is not a string.`);
    }

    if (typeof options.connection !== 'string') {
      throw new Error(`Request '${options.context}.${options.name}' doesn't have an c defined on it`);
    }

    if (connections[options.connection] === 'undefined') {
      throw new Error(`The Connection '${options.adapter}' specified on Request '${options.context}.${options.name}' doesn't exist.`);
    }

    const _requests = requests[options.connection];
    const obj = options.context ? _requests[options.context] : _requests[options.connection];

    if (obj && typeof obj[options.name] !== 'undefined') {
      throw new Error(`Request with context '${options.context}' and name '${options.name}' already exists.`);
    }

    if (typeof options.route !== 'string') {
      throw new Error(`Request '${options.context}.${options.name}' doesn't have a url defined on it`);
    }

    if (typeof options.method !== 'string') {
      throw new Error(`Request '${options.context}.${options.name}' doesn't have a method defined on it`);
    }

    if (['get', 'post', 'put', 'delete'].indexOf(options.method) === -1) {
      throw new Error(`Can't construct Request '${options.context}.${options.name}', method '${options.method}' is not a valid method.`);
    }
  },

  executeWithConnection(request, connection, splats) {
    if (!connection) {
      throw new Error(`Can't execute Request ${this.name}, no connection provided.`)
    }

    const _connection = typeof connection === 'string' ? connections[connection] : connection;

    if (!_connection) {
      throw new Error(`Can't execute Request ${this.name}, Connection '${connection}' not found.`)
    }

    if (!dataSatisfiesRoute(request.route, splats)) {
      throw new Error(`Can't execute Request '${request.context}.${request.name}', data object doesn't satisfy all splats in the route.`);
    }
  }

};

export default requestValidator;