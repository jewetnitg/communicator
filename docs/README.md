Communicator
============================

This npm module serves as an abstraction for communications with the server

Adding it to a project
======================

```
npm install frontend-communicator --save
```

Installing
==========

```
npm install
```

Running tests
=============

```
npm test
```

Running build
=============

```
npm run build
```

To read more on the build setup, please refer to the {@tutorial build} documentation.

Npm scripts
===========
The project comes with a couple npm scripts that can be executed by running

```
npm run <script>
```
So,
```
npm run build
```

for example.
For all npm scripts available please see {@tutorial npm scripts}

Concepts
========

### {@link Adapter}
{@link Adapter}s serve to do the actual transport of data.
{@link Adapter}s are used by {@link Connections} to execute {@link Request}s.

### {@link Connection}
{@link Connection}s serve to represent a connection to a server, it uses an {@link Adapter} to do it's transport of data.

### {@link Request}
{@link Request}s are blueprints for executing a request to a server, they can execute themselves using their own {@link Connection}, or execute themselves on another {@link Connection}.

Walkthrough
===========
For more information, please read the {@tutorial walkthrough}, for even more information please refer to the documented Namespaces and Classes.

TODOs
=====
* Add an upload method to the {@link Adapter} spec, add an upload method to {@link Connection} and add an upload flag to {@link Request}
* Allow cache lifetime to be configured on Request and Connection level, where Request has precedence