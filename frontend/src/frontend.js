const domready = require('domready');
const m = require('mithril');

const Title = require('../../shared/src/Title.js');

const App = {
    view: function() {
        return m(Title, 'App');
    }
}

domready(function() {
    const primus = Primus.connect('?token=ZZZ');
    primus.on('open', function() {
        primus.write(JSON.stringify({ foo: 'bar' }));
        m.mount(document.body, App);
    });
});
