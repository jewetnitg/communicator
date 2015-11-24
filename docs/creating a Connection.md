### Creating a Connection

Below is an example implementation of a {@link Connection}
```
import communicator from 'frontend-communicator'

const localXhrConnection = communicator.Connection({

  name: 'local-xhr',
  // refers to the name of an {@link Adapter}
  adapter: 'XHR',
  url: 'http://localhost:1337',

});

```