/**
 * @author rik
 */
import _ from 'lodash';
import dataSatisfiesRoute from '../helpers/dataSatisfiesRoute';

const requestValidator = {

  construct(options = {}) {
    if (typeof options.name !== 'string') {
      throw new Error(`No name provided on Request.`);
    }

    if (typeof options.communicator === 'undefined') {
      throw new Error(`Request doesn't have a communicator instance in its options.`);
    }

    if (typeof options.connection !== 'string') {
      throw new Error(`Request '${options.name}' doesn't have an c defined on it`);
    }

    if (options.communicator.connections[options.connection] === 'undefined') {
      throw new Error(`The Connection '${options.adapter}' specified on Request '${options.name}' doesn't exist.`);
    }

    if (_.get(options.communicator.requests[options.connection], options.name)) {
      throw new Error(`Request with name '${options.name}' already exists.`);
    }

    if (typeof options.route !== 'string') {
      throw new Error(`Request '${options.name}' doesn't have a url defined on it`);
    }

    if (typeof options.method !== 'string') {
      throw new Error(`Request '${options.name}' doesn't have a method defined on it`);
    }

    if (['get', 'post', 'put', 'delete'].indexOf(options.method) === -1) {
      throw new Error(`Can't construct Request '${options.name}', method '${options.method}' is not a valid method.`);
    }
  },

  executeWithConnection(request, connection, splats) {
    if (!connection) {
      throw new Error(`Can't execute Request ${this.name}, no connection provided.`)
    }

    const _connection = typeof connection === 'string' ? request.communicator.connections[connection] : connection;

    if (!_connection) {
      throw new Error(`Can't execute Request ${this.name}, Connection '${connection}' not found.`)
    }

    if (!dataSatisfiesRoute(request.route, splats)) {
      throw new Error(`Can't execute Request '${request.name}', data object doesn't satisfy all splats in the route.`);
    }
  }

};

export default requestValidator;