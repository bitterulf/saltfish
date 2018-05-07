const dev = {
    register: function (server, options, next) {
        const input = server.zmq.socket('pull').connect(server.ports.logs);

        input.on('message', function(msg){
            console.log('DEV>', msg.toString());
        });

        next();
    }
};

dev.register.attributes = {
    name: 'dev',
    version: '1.0.0'
};

module.exports = dev;
