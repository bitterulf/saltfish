const Path = require('path');
const Hapi = require('hapi');

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.resolve(__dirname, '../../')
            }
        }
    }
});

server.connection({
    port: 8080
});

server.register(
    [
        require('inert'),
        require('./plugins/process.js'),
        require('./plugins/zmq.js'),
        require('./plugins/ports.js'),
        require('./plugins/log.js'),
        require('./plugins/dev.js'),
        require('./plugins/broker.js'),
        require('./plugins/mithril.js'),
        require('./plugins/shared.js'),
        require('./plugins/root.js'),
        require('./plugins/validator.js'),
        require('./plugins/mutator.js'),
        require('./plugins/memory.js'),
        require('./plugins/tracker.js')
    ], (err) => {

        if (err) {
            throw err;
        }

        server.start((err) => {
            server.pushLog({foo: 'bar'});

            if (err) {
                throw err;
            }

            console.log('Server running at:', server.info.uri);
        });

    });
