/**
 * @author rik
 */
import socketIoClient from 'socket.io-client';
//noinspection JSFileReferences
import sailsIoClient from 'sails.io.js';

const connections = {};

const SAILS_IO = {

  sailsIoClient,
  socketIoClient,

  events: true,

  subscribe(connection, modelName, callback) {
    return this.request(connection, {
      url: '/' + modelName,
      method: 'get'
    }).then((data) => {
      this.on(connection, modelName, (event) => {
        callback(event);
      });

      return data;
    });
  },

  on(connection, event, cb) {
    connection.io.socket.on(event, cb);
  },

  emit(connection, event, data) {
    connection.io.socket.emit(event, data);
  },

  connect(connection) {
    if (connections[connection.url]) {
      connection.io = connections[connection.url];
      return Promise.resolve();
    } else {
      connection.io = this.sailsIoClient(this.socketIoClient);
      connection.io.sails.url = connection.url;
      connection.io.sails.transports = ['websocket'];

      return new Promise(resolve => {
        this.on(connection, 'connect', () => {
          connections[connection.url] = connection.io;
          resolve();
        });
      });
    }
  },

  disconnect(connection) {
    return Promise.resolve();
  },

  request(connection, options) {
    return new Promise((resolve, reject) => {
      connection.io.socket.request(options, (data, JWR) => {
        if (JWR.statusCode >= 200 && JWR.statusCode < 400) {
          resolve(data)
        } else {
          reject(data);
        }
      });
    });
  }

};

export default SAILS_IO;