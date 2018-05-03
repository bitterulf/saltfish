const Path = require('path');
const Hapi = require('hapi');
const Primus = require('primus');
require('mithril/test-utils/browserMock')(global);
const m = require('mithril');
const render = require('mithril-node-render');

const Title = require('../../shared/src/Title.js');

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.resolve(__dirname, '../../')
            }
        }
    }
});

server.connection({
    port: 8080
});

const sessions = {
    'ZZZ': 'bob'
};

const primus = new Primus(server.listener, {/* options */});

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
        spark.username = activeUser;

        spark.on('data', function(message) {
            console.log(spark.username + ': ' + message);
        });
    }
});

server.register(
    [
        require('inert')
    ], (err) => {

        if (err) {
            throw err;
        }

        server.start((err) => {

            server.route({
                method: 'GET',
                path: '/api/hello',
                handler: function (request, reply) {
                    render(m(Title, 'hello')).then(reply);
                }
            });

            server.route({
                method: 'GET',
                path: '/static/{param*}',
                handler: {
                    directory: {
                        path: './static',
                        redirectToSlash: true,
                        index: true
                    }
                }
            });

            server.route({
                method: 'GET',
                path: '/',
                handler: function (request, reply) {
                    render([
                        m("title",
                            "client"
                        ),
                        m("script[src='/primus/primus.js']"),
                        m("script[src='/bundle.js']"),
                        "client"
                    ]).then(reply);
                }
            });

            server.route({
                method: 'GET',
                path: '/bundle.js',
                handler: {
                    file: './frontend/bundle.js'
                }
            });

            if (err) {
                throw err;
            }

            console.log('Server running at:', server.info.uri);
        });

    });
