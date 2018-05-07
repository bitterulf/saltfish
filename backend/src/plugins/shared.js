const shared = {
    register: function (server, options, next) {
        server.decorate('request', 'shared', {
            Title: require('../../../shared/src/Title.js')
        });

        next();
    }
};

shared.register.attributes = {
    name: 'shared',
    version: '1.0.0'
};

module.exports = shared;
