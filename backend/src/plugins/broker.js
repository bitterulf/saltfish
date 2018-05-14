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

        const worlds = {
            'W1': {

            }
        };

        const primus = new Primus(server.listener, {/* options */});

        input.on('message', function(msg){
            console.log('BRK>', msg.toString());
            const message = JSON.parse(msg.toString());
            primus.forEach(function (spark) {
                if (!message.user) {
                    spark.write(JSON.parse(msg.toString()));
                }
                else if (message.user == spark.username) {
                    spark.write(JSON.parse(msg.toString()));
                }
            });
        });

        responseInput.on('message', function(msg){
            const message = JSON.parse(msg.toString());
            primus.forEach(function (spark) {
                if (message.world && spark.world === message.world) {
                    spark.write(JSON.parse(msg.toString()));
                }
                else if (message.username && spark.username === message.username) {
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
            const world = spark.query.world;

            if (activeUser && world && worlds[world]) {
                server.pushLog({user: activeUser, status: 'connected'});
                spark.username = activeUser;
                spark.role = 'admin';
                spark.world = world;

                spark.on('data', function(rawMessage) {
                    const message = JSON.parse(rawMessage);
                    if (message.query) {
                        requestOutput.send(JSON.stringify({username: spark.username, role: spark.role, world: spark.world, query: message.query}));
                    }
                    else if (message.action) {
                        server.pushLog({user: spark.username, message: message});
                        output.send(JSON.stringify({user: spark.username, role: spark.role, world: spark.world, message: message}));
                    }
                });
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
