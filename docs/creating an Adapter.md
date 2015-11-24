### Creating an Adapter

Below is an example implementation of an XHR adapter that uses jQuery to do it's transport
```
import communicator from 'frontend-communicator'

const XhrAdapter = communicator.Adapter({

  events: false,

  connect() {
    // XHR connections don't need to connect
    return Promise.resolve();
  },

  disconnect() {
    // XHR connections don't need to disconnect
    return Promise.resolve();
  },

  request(options) {
    // XHR connections don't need to disconnect
    return new Promise((resolve, reject) => {
      $.ajax({
          url: options.url,
          method: options.method,
          data: options.data
        }).
        done((data) => {
          resolve(data);
        }).
        fail((data) => {
          reject(data);
        });
    });
  }

});

```


When implementing an {@link Adapter} that supports a sever events, events must be set to true and the 'on(event, cb)' and 'emit(event, data)' methods must be implemented.