const root = {
    register: function (server, options, next) {
        server.route({
            method: 'GET',
            path: '/api/hello',
            handler: function (request, reply) {
                const m = request.m;

                request.render(m(request.shared.Title, 'hello')).then(reply);
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
                const m = request.m;

                request.render([
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

        next();
    }
};

root.register.attributes = {
    name: 'root',
    version: '1.0.0'
};

module.exports = root;
