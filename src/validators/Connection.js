/**
 * @author rik
 */
const connectionValidator = {

  construct(options = {}) {
    if (typeof options.name !== 'string') {
      throw new Error(`No name provided on Connection`);
    }

    if (typeof options.communicator === 'undefined') {
      throw new Error(`Connection doesn't have a communicator instance in its options.`);
    }

    if (typeof options.communicator.connections[options.name] !== 'undefined') {
      throw new Error(`Connection with name '${options.name}' already exists`);
    }

    if (typeof options.url !== 'string') {
      throw new Error(`Connection '${options.name}' doesn't have a url defined on it`);
    }

    if (typeof options.adapter !== 'string') {
      throw new Error(`Connection '${options.name}' doesn't have an adapter defined on it`);
    }

    if (options.communicator.adapters[options.adapter] === 'undefined') {
      throw new Error(`The Adapter '${options.adapter}' specified on Connection '${options.name}' doesn't exist.`);
    }
  }

};

export default connectionValidator;