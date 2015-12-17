/**
 * @author rik
 */
import path from 'path';
import socketIoClient from 'socket.io-client';
//noinspection JSFileReferences
import sailsIoClient from 'sails.io.js';

const connections = {};

const SAILS_IO = {

  sailsIoClient,
  socketIoClient,

  events: true,

  // @todo implement aborting an upload (add abort method to Request?)
  // @todo figure out if we need CSRF token
  upload(connection, files, options, progress) {
    _.defaults(options, {
      filesAttribute: 'files'
    });
    return new Promise((resolve, reject) => {
      var formData = new FormData();
      var xhr = new XMLHttpRequest();

      /* Required for large files */
      //xhr.setRequestHeader('X-CSRF-Token', csrfToken);

      _.each(files, (val) => {
        if (val instanceof FileList) {
          _.each(val, (_val) => {
            formData.append(options.filesAttribute, _val);
          });
        } else {
          formData.append(options.filesAttribute, val);
        }
      });

      _.each(options.data, (val, key) => {
        formData.append(key, val);
      });

      //formData.append('_csrf', csrfToken);
      const url = connection.url + options.url;
      xhr.open(options.method.toUpperCase() || 'GET', url, true);
      xhr.send(formData);

      xhr.onprogress = function (_data) {
        if (typeof progress === 'function') {
          progress(_data);
        }
      };

      xhr.onerror = function (_data) {
        reject(_data);
      };

      xhr.onload = function (_data) {
        resolve(_data);
      };
    });
  },

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