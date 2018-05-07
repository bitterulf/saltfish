const Primus = require('primus');

const broker = {
    register: function (server, options, next) {
        const input = server.zmq.socket('pull').connect(server.ports.broker);
        const output = server.zmq.socket('push').bindSync(server.ports.validator);
        const requestOutput = server.zmq.socket('push').bindSync(server.ports.memoryRequest);
        const responseInput = server.zmq.socket('pull').connect(server.ports.brokerResponse);

        const sessions = {
            'ZZZ': 'bob'
        };

        const primus = new Primus(server.listener, {/* options */});

        input.on('message', function(msg){
            console.log('BRK>', msg.toString());
            primus.forEach(function (spark) {
                spark.write(JSON.parse(msg.toString()));
            });
        });

        responseInput.on('message', function(msg){
            const message = JSON.parse(msg.toString());
            primus.forEach(function (spark) {
                if (spark.username === message.username) {
                    spark.write(JSON.parse(msg.toString()));
                }
            });
        });

        primus.authorize(function (req, done) {
            const activeUser = sessions[req.query.token];

            if (activeUser) {
                return done();
            }
            done(new Error('invalid token'));
        });

        primus.on('connection', function (spark) {
            const activeUser = sessions[spark.query.token];

            if (activeUser) {
                server.pushLog({user: activeUser, status: 'connected'});
                spark.username = activeUser;

                spark.on('data', function(rawMessage) {
                    const message = JSON.parse(rawMessage);
                    if (message.query) {
                        requestOutput.send(JSON.stringify({username: spark.username, query: message.query}));
                    }
                    else if (message.action) {
                        server.pushLog({user: spark.username, message: message});
                        output.send(JSON.stringify({user: spark.username, message: message}));
                    }
                });

                spark.write({ foo: 'bar' });
            }
        });

        next();
    }
};

broker.register.attributes = {
    name: 'broker',
    version: '1.0.0'
};

module.exports = broker;
