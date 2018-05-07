const validator = {
    register: function (server, options, next) {
        const input = server.zmq.socket('pull').connect(server.ports.validator);
        const output = server.zmq.socket('push').bindSync(server.ports.mutator);

        input.on('message', function(msg){
            console.log('VAL>', msg.toString());
            output.send(msg);
        });

        next();
    }
};

validator.register.attributes = {
    name: 'validator',
    version: '1.0.0'
};

module.exports = validator;
