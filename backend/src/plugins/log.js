const log = {
    register: function (server, options, next) {
        const output = server.zmq.socket('push').bindSync(server.ports.logs);

        const pushLog = function(message) {
            output.send(JSON.stringify(message));
        };

        server.decorate('server', 'pushLog', pushLog);
        server.decorate('request', 'pushLog', pushLog);

        next();
    }
};

log.register.attributes = {
    name: 'log',
    version: '1.0.0'
};

module.exports = log;
