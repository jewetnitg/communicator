/**
 * @author rik
 */
import $ from 'jquery';

const XHR = {

  name: 'XHR',

  connect(connection) {
    return Promise.resolve();
  },

  disconnect(connection) {
    return Promise.resolve();
  },

  request(connection, options) {
    return new Promise((resolve, reject) => {
      $.ajax(options)
        .done((data) => {
          resolve(data);
        })
        .fail((data) => {
          reject(data);
        });
    });
  }

};

export default XHR;