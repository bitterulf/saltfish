const mutator = {
    register: function (server, options, next) {
        const input = server.zmq.socket('pull').connect(server.ports.mutator);
        const output = server.zmq.socket('push').bindSync(server.ports.memory);

        input.on('message', function(msg){
            console.log('MUT>', msg.toString());
            output.send(JSON.stringify({ type: 'CREATE_WORLD',  name: 'w1' }));
            output.send(JSON.stringify({ type: 'CREATE_WORLD',  name: 'w2' }));
            output.send(JSON.stringify({ type: 'DESTROY_WORLD',  name: 'w1' }));
        });

        next();
    }
};

mutator.register.attributes = {
    name: 'mutator',
    version: '1.0.0'
};

module.exports = mutator;
