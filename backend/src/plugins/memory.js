const graphql = require('graphql');

const getState = function(events) {
    const state = {
        worlds: {

        }
    }

    events.forEach(function(event) {
        if (event.type === 'CREATE_WORLD') {
            state.worlds[event.name] = {};
        }
        else if (event.type === 'DESTROY_WORLD') {
            delete state.worlds[event.name];
        }
    });

    return state;
};

let lastState = {};

const WorldType = new graphql.GraphQLObjectType({
    name: 'World',
    description: 'This represent a World',
    fields: () => ({
        name: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
    })
});

const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            worlds: {
                type: new graphql.GraphQLList(WorldType),
                resolve: function(root, args) {
                    return Object.keys(lastState.worlds).map(function(key) {
                        return {
                            name: key
                        }
                    });
                }
            }
        }
    })
});

const memory = {
    register: function (server, options, next) {
        const events = [];

        const input = server.zmq.socket('pull').connect(server.ports.memory);
        const requestInput = server.zmq.socket('pull').connect(server.ports.memoryRequest);
        const output = server.zmq.socket('push').bindSync(server.ports.tracker);
        const responseOutput = server.zmq.socket('push').bindSync(server.ports.brokerResponse);

        output.send(JSON.stringify(getState(events)));

        input.on('message', function(msg){
            console.log('MEM>', msg.toString());
            events.push(JSON.parse(msg.toString()));
            const state = getState(events);
            console.log(state);
            lastState = state;
            output.send(JSON.stringify(state));
        });

        requestInput.on('message', function(msg){
            const message = JSON.parse(msg.toString());
            console.log('MEM REQ>', message);

            graphql.graphql(schema, message.query).then(result => {
                console.log(result);
                responseOutput.send(JSON.stringify({ username: message.username, query: message.query, result: result.data }));
            });

        });

        next();
    }
};

memory.register.attributes = {
    name: 'memory',
    version: '1.0.0'
};

module.exports = memory;
