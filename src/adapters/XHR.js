/**
 * @author rik
 */
import $ from 'jquery';

const XHR = {

  name: 'XHR',

  connect() {
    return Promise.resolve();
  },

  disconnect() {
    return Promise.resolve();
  },

  request(options) {
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