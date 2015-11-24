/**
 * @author rik
 */
import adapters from '../singletons/adapters';

const adapterValidator = {

  construct(options = {}) {
    if (typeof options.name !== 'string') {
      throw new Error(`No name provided on Adapter`);
    }

    if (typeof adapters[options.name] !== 'undefined') {
      throw new Error(`Adapter with name '${options.name}' already exists`);
    }

    if (typeof options.connect !== 'function') {
      throw new Error(`'connect' method not implemented on Adapter ${options.name}`);
    }

    if (typeof options.disconnect !== 'function') {
      throw new Error(`'disconnect' method not implemented on Adapter ${options.name}`);
    }

    if (typeof options.request !== 'function') {
      throw new Error(`'request' method not implemented on Adapter ${options.name}`);
    }

    if (options.events === true) {
      if (typeof options.on !== 'function') {
        throw new Error(`'on' method not implemented on Adapter ${options.name}`);
      }
      if (typeof options.emit !== 'function') {
        throw new Error(`'emit' method not implemented on Adapter ${options.name}`);
      }
    }
  },

  request(options = {}) {
    if (!options.method || typeof options.method !== 'string') {
      throw new Error(`Can't execute request, no method provided.`);
    }

    if (['get', 'delete', 'post', 'put'].indexOf(options.method.toLowerCase()) === -1) {
      throw new Error(`Can't execute request, method ${options.method} is invalid.`);
    }

    if (!options.url || typeof options.url === 'string') {
      throw new Error(`Can't execute request, method ${options.method} is invalid.`);
    }
  },

  eventMethod() {
    if (!this.events) {
      throw new Error(`Can't execute ${method} method, the '${this.name}' Adapter doesn't server events.`);
    }
  }

};

export default adapterValidator;