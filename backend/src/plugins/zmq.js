const ZMQ = require('zeromq');

const zmq = {
    register: function (server, options, next) {

        server.decorate('server', 'zmq', ZMQ);

        next();
    }
};

zmq.register.attributes = {
    name: 'zmq',
    version: '1.0.0'
};

module.exports = zmq;
