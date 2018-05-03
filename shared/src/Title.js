const m = require('mithril');

const Title = {
    view: function(vnode) {
        return m('h1', vnode.children);
    }
};

module.exports = Title;
