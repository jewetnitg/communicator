### Creating a Connection

Below is an example implementation of a {@link Connection}
```
import communicator from './communicator';

const localXhrConnection = communicator.Connection({

  name: 'local-xhr',
  // refers to the name of an {@link Adapter},
  // we don't have to specify this because a default Adapter was specified in the Communicator options
  adapter: 'XHR',
  url: 'http://localhost:1337',

});

export default localXhrConnection;

```