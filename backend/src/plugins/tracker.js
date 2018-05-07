const diff = require('jsondiffpatch').diff;

const tracker = {
    register: function (server, options, next) {
        const input = server.zmq.socket('pull').connect(server.ports.tracker);
        const output = server.zmq.socket('push').bindSync(server.ports.broker);
        let lastState = {};

        input.on('message', function(msg){
            console.log('TRK>', msg.toString());
            const newState = JSON.parse(msg.toString());
            const stateDiff = diff(lastState, newState);
            console.log(stateDiff);

            if (stateDiff && stateDiff.worlds) {
                console.log('worlds change');
                output.send(JSON.stringify({ type: 'WORLD_CHANGED' }));
            }

            lastState = newState;
        });

        next();
    }
};

tracker.register.attributes = {
    name: 'tracker',
    version: '1.0.0'
};

module.exports = tracker;
