let state = {};

const mutator = {
    register: function (server, options, next) {
        const input = server.zmq.socket('pull').connect(server.ports.mutator);
        const output = server.zmq.socket('push').bindSync(server.ports.memory);
        const stateInput = server.zmq.socket('pull').connect(server.ports.mutatorState);

        stateInput.on('message', function(msg){
            state = JSON.parse(msg.toString());
        });

        input.on('message', function(msg){
            const message = JSON.parse(msg.toString());

            if (message.message.action === 'join') {
                if (!state.worlds[message.world]) {
                    output.send(JSON.stringify({ type: 'CREATE_WORLD',  name: message.world }));
                }
                if (!state.profiles[message.username]) {
                    output.send(JSON.stringify({ type: 'CREATE_PROFILE',  username: message.user}));
                }
            }
        });

        next();
    }
};

mutator.register.attributes = {
    name: 'mutator',
    version: '1.0.0'
};

module.exports = mutator;
