### Creating a Communicator

Below is an example implementation of a {@link Communicator}
```
import Communicator from 'frontend-communicator';

const communicator = Communicator({

  name: 'some-unique-name-for-the-communicator',
  defaultConnection: 'local-xhr',
  defaultAdapter: 'XHR',
  adapters: {...},
  connections: {...},
  requests: {...}

});

export default communicator;
```