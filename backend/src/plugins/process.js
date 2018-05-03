const processPlugin = {
    register: function (server, options, next) {

        server.decorate('server', 'process', process);

        next();
    }
};

processPlugin.register.attributes = {
    name: 'process',
    version: '1.0.0'
};

module.exports = processPlugin;
