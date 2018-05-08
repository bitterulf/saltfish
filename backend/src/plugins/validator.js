let state = {};

const validator = {
    register: function (server, options, next) {
        const input = server.zmq.socket('pull').connect(server.ports.validator);
        const output = server.zmq.socket('push').bindSync(server.ports.mutator);
        const stateInput = server.zmq.socket('pull').connect(server.ports.validatorState);

        stateInput.on('message', function(msg){
            state = JSON.parse(msg.toString());
        });

        input.on('message', function(msg){
            const message = JSON.parse(msg.toString());

            if (message.role === 'admin') {
                output.send(msg);
            }
            else if (message.message.action === 'join') {
                output.send(msg);
            }
            else {
                console.log('action blocked!', msg.toString());
            }
        });

        next();
    }
};

validator.register.attributes = {
    name: 'validator',
    version: '1.0.0'
};

module.exports = validator;
