### Creating a Request

Below is an example implementation of a {@link Request}
```
import communicator from 'frontend-communicator'

communicator.Request({

  // optional, if ommitted request will be 'global'
  context: 'user',
  // name of the request, if context specified, specific to its context
  name: 'findById',
  // the connection to execute this request with
  connection: 'local-xhr',
  // the route of the requst, allowed to contain :splats
  route: '/user/:id',
  // optional, called when the request was successful, should return a transformed response value or a Promise that resolves with the desired response value
  resolve() {},
  // the same as resolve but for failed requests,
  // this allows you to resolve a Request even if its actual request failed
  reject() {}
});
```

### Executing the Request
The {@link Request} created above is now available, and we can call it as described below.

this is the preferred way of executing a {@link Request}.
```
communicator.servers['local-xhr'].user.findById(56)
  .then(...);
// or
communicator.connections['local-xhr'].server.user.findById(56)
  .then(...);
```

The {@link Request} itself is exposed on the requests object.
```
communicator.requests['local-xhr'].user.findById.execute(56)
  .then(...);
// or
communicator.connection['local-xhr'].requests.user.findById.execute(56)
    .then(...);
```

if context were omitted the Request would've been available under:

```
communicator.requests['local-xhr'].findById(56)
  .then(...);
// or
communicator.connections['local-xhr'].requests.findById.execute(56)
  .then(...);

```