const ports = {
    register: function (server, options, next) {
        server.decorate('server', 'ports', {
            logs: 'tcp://127.0.0.1:4000',
            validator: 'tcp://127.0.0.1:5000',
            validatorState: 'tcp://127.0.0.1:5500',
            mutator: 'tcp://127.0.0.1:6000',
            mutatorState: 'tcp://127.0.0.1:6500',
            memory: 'tcp://127.0.0.1:7000',
            memoryRequest: 'tcp://127.0.0.1:7500',
            tracker: 'tcp://127.0.0.1:8000',
            broker: 'tcp://127.0.0.1:9000',
            brokerResponse: 'tcp://127.0.0.1:9500'
        });

        next();
    }
};

ports.register.attributes = {
    name: 'ports',
    version: '1.0.0'
};

module.exports = ports;
