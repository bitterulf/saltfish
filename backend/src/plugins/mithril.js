require('mithril/test-utils/browserMock')(global);
const render = require('mithril-node-render');
const m = require('mithril');

const mithril = {
    register: function (server, options, next) {
        server.decorate('request', 'render', render);
        server.decorate('request', 'm', m);

        next();
    }
};

mithril.register.attributes = {
    name: 'mithril',
    version: '1.0.0'
};

module.exports = mithril;
