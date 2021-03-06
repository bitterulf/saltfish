const graphql = require('graphql');

const getState = function(events) {
    const state = {
        worlds: {

        },
        cities: [
            { world: 'no', name: 'Bielefeld' }
        ],
        profiles: {
        },
        contors: [
        ]
    }

    events.forEach(function(event) {
        if (event.type === 'CREATE_WORLD') {
            state.worlds[event.name] = {};
            state.cities.push({
                world: event.name,
                name: 'Hamburg'
            });
            state.cities.push({
                world: event.name,
                name: 'Oslo'
            });
        }
        else if (event.type === 'DESTROY_WORLD') {
            delete state.worlds[event.name];
        }
        else if (event.type === 'CREATE_PROFILE') {
            state.profiles[event.username] = {
                username: event.username
            };
        }
        else if (event.type === 'CREATE_CONTOR') {
            state.contors.push({
                world: event.world,
                user: event.username,
                city: event.city
            });
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

const CityType = new graphql.GraphQLObjectType({
    name: 'City',
    description: 'This represent a City',
    fields: () => ({
        name: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
    })
});

const ProfileType = new graphql.GraphQLObjectType({
    name: 'Profile',
    description: 'This represent a Profile',
    fields: () => ({
        username: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
    })
});

const ContorType = new graphql.GraphQLObjectType({
    name: 'Contor',
    description: 'This represent a Contor',
    fields: () => ({
        city: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
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
            },
            cities: {
                type: new graphql.GraphQLList(CityType),
                resolve: function(root, args) {

                    return lastState.cities.filter(function(city) {
                        return city.world === root.world;
                    });
                }
            },
            contors: {
                type: new graphql.GraphQLList(ContorType),
                resolve: function(root, args) {

                    return lastState.contors.filter(function(contor) {
                        return contor.world === root.world && contor.user === root.username;
                    });
                }
            },
            profile: {
                type: ProfileType,
                resolve: function(root, args) {
                    return {
                        username: root.username
                    }
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
        const updateMutator = server.zmq.socket('push').bindSync(server.ports.mutatorState);
        const updateValidator = server.zmq.socket('push').bindSync(server.ports.validatorState);

        const sendState = function(state) {
            output.send(JSON.stringify(state));
            updateMutator.send(JSON.stringify(state));
            updateValidator.send(JSON.stringify(state));
        };

        sendState(getState(events));

        input.on('message', function(msg){
            console.log('MEM>', msg.toString());
            events.push(JSON.parse(msg.toString()));
            const state = getState(events);
            console.log(state);
            lastState = state;
            sendState(state);
        });

        requestInput.on('message', function(msg){
            const message = JSON.parse(msg.toString());
            console.log('MEM REQ>', message);

            graphql.graphql(schema, message.query, {username: message.username, role: message.role, world: message.world}).then(result => {
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
