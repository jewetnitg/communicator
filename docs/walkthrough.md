This walkthrough consists of a few different tutorials, please follow the following tutorials in order

First, we have to create a {@link Communicator}, once we have this we can register {@link Adapter}s, {@link Connection}s and {@link Request}s on it.

{@tutorial creating a Communicator}

Now that we have set up the communicator, we have to create an {@link Adapter}, {@link Adapter}s are used to do the actual transport of data from and to the server.

{@tutorial creating an Adapter}

After creating the {@link Adapter}, we must create a {@link Connection}, a {@link Connection} is a combination of an {@link Adapter} and a url.

{@tutorial creating a Connection}

The last object we have to create is a {@link Request}, {@link Request}s are blueprints for requests to a server, it uses a {@link Connection} and properties such as 'method' and 'route' to do the actual request.

{@tutorial creating a Request}

This is the end of the walkthrough.